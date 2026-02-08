import { useCallback, useEffect, useRef, useState } from 'react';
import type { TimelineEntry, TimelineModel } from '@/types/timeline';

const MAX_ENTRIES = 80;
const RESOURCE_LIMIT = 50;

/** Generate a stable id for an entry (entryType + name + startTime). */
function entryId(entryType: string, name: string, startTime: number): string {
  return `${entryType}-${name.slice(0, 80)}-${startTime.toFixed(2)}`.replace(/\s+/g, '_');
}

/** Normalize a PerformanceEntry into TimelineEntry (raw startTime from API). */
function normalizeEntry(entry: PerformanceEntry): TimelineEntry | null {
  const startTime = 'startTime' in entry ? entry.startTime : 0;
  const duration = 'duration' in entry ? entry.duration : 0;
  const type = entry.entryType as TimelineEntry['entryType'];

  if (
    type !== 'paint' &&
    type !== 'resource' &&
    type !== 'navigation' &&
    type !== 'layout-shift'
  ) {
    return null;
  }

  let name: string;
  let detail: string | undefined;
  let value: number | undefined;

  switch (type) {
    case 'paint': {
      const e = entry as PerformancePaintTiming;
      name = e.name ?? 'paint';
      detail = e.name ?? undefined;
      break;
    }
    case 'resource': {
      const e = entry as PerformanceResourceTiming;
      try {
        name = e.name ? new URL(e.name).pathname || e.name : 'resource';
      } catch {
        name = String(e.name).slice(0, 60) || 'resource';
      }
      detail = e.initiatorType ?? undefined;
      break;
    }
    case 'navigation': {
      const e = entry as PerformanceNavigationTiming;
      name = 'Document';
      detail = e.type ?? undefined;
      break;
    }
    case 'layout-shift': {
      const e = entry as LayoutShift;
      name = 'Layout shift';
      value = e.value;
      detail = value != null ? `Score: ${value.toFixed(3)}` : undefined;
      break;
    }
    default:
      return null;
  }

  return {
    id: entryId(type, name, startTime),
    name,
    startTime,
    duration: type === 'layout-shift' && duration === 0 ? 2 : duration,
    entryType: type,
    detail,
    value,
  };
}

export interface UsePerformanceTimelineOptions {
  /**
   * When set (e.g. performance.now() at session start), only entries with
   * startTime >= sessionStartTime are included and their startTime is
   * normalized to (startTime - sessionStartTime). timeOrigin in the model is 0.
   */
  sessionStartTime: number | null;
}

/**
 * usePerformanceTimeline(sessionStartTime)
 *
 * Observes performance entries via PerformanceObserver for paint, resource,
 * navigation, and layout-shift. Intended to run only inside InstrumentationCollector
 * (DemoApp route) so the timeline captures only during DemoApp render.
 *
 * - sessionStartTime: when set (e.g. when user clicks Start), timestamps are
 *   normalized to be relative to session start (0 = session start). Entries
 *   before session start are excluded.
 * - Model timeOrigin is 0 when normalized, else performance.timeOrigin.
 * - Cleans up observers on unmount.
 */
export function usePerformanceTimeline(
  sessionStartTime: number | null
): TimelineModel {
  const timeOriginRef = useRef(typeof performance !== 'undefined' ? performance.timeOrigin : 0);
  const sessionStartTimeRef = useRef(sessionStartTime);
  sessionStartTimeRef.current = sessionStartTime;

  const [model, setModel] = useState<TimelineModel>({
    entries: [],
    timeOrigin: sessionStartTime != null ? 0 : timeOriginRef.current,
    endTime: 0,
  });
  const entriesRef = useRef<Map<string, TimelineEntry>>(new Map());
  const isMountedRef = useRef(true);

  const flushModel = useCallback(() => {
    if (!isMountedRef.current) return;
    const rawList = Array.from(entriesRef.current.values());
    const start = sessionStartTimeRef.current;

    let list: TimelineEntry[];
    let timeOrigin: number;

    if (start != null) {
      list = rawList
        .filter((e) => e.startTime >= start)
        .map((e) => ({ ...e, startTime: e.startTime - start }))
        .sort((a, b) => a.startTime - b.startTime);
      timeOrigin = 0;
    } else {
      list = rawList.sort((a, b) => a.startTime - b.startTime);
      timeOrigin = timeOriginRef.current;
    }

    const endTime =
      list.length === 0 ? 0 : Math.max(...list.map((e) => e.startTime + e.duration));

    setModel({ entries: list, timeOrigin, endTime });
  }, []);

  const handleObserve = useCallback(
    (list: PerformanceObserverEntryList) => {
      const newEntries = list.getEntries();
      let changed = false;
      for (const entry of newEntries) {
        const normalized = normalizeEntry(entry);
        if (!normalized) continue;
        const key = normalized.id;
        if (!entriesRef.current.has(key)) {
          entriesRef.current.set(key, normalized);
          changed = true;
        }
      }
      if (changed) {
        let all = Array.from(entriesRef.current.values());
        const resources = all.filter((e) => e.entryType === 'resource');
        const others = all.filter((e) => e.entryType !== 'resource');
        if (resources.length > RESOURCE_LIMIT) {
          const sorted = [...resources].sort((a, b) => a.startTime - b.startTime);
          const kept = sorted.slice(0, RESOURCE_LIMIT);
          all = [...others, ...kept];
        }
        if (all.length > MAX_ENTRIES) {
          const sorted = [...all].sort((a, b) => a.startTime - b.startTime);
          const keep = sorted.slice(0, MAX_ENTRIES);
          entriesRef.current = new Map(keep.map((e) => [e.id, e]));
        } else if (resources.length > RESOURCE_LIMIT) {
          entriesRef.current = new Map(all.map((e) => [e.id, e]));
        }
        flushModel();
      }
    },
    [flushModel]
  );
  const handleObserveLayoutShift = useCallback(
    (list: PerformanceObserverEntryList) => {
      handleObserve(list);
    },
    [handleObserve]
  );

  useEffect(() => {
    isMountedRef.current = true;
    timeOriginRef.current =
      typeof performance !== 'undefined' ? performance.timeOrigin : 0;

    const supported = PerformanceObserver.supportedEntryTypes ?? [];
    const observers: PerformanceObserver[] = [];

    if (supported.includes('paint')) {
      try {
        const po = new PerformanceObserver(handleObserve);
        po.observe({ type: 'paint', buffered: true });
        observers.push(po);
      } catch {
        // ignore
      }
    }

    if (supported.includes('resource')) {
      try {
        const po = new PerformanceObserver(handleObserve);
        po.observe({ type: 'resource', buffered: true });
        observers.push(po);
      } catch {
        // ignore
      }
    }

    if (supported.includes('navigation')) {
      try {
        const po = new PerformanceObserver(handleObserve);
        po.observe({ type: 'navigation', buffered: true });
        observers.push(po);
      } catch {
        // ignore
      }
    }

    if (supported.includes('layout-shift')) {
      try {
        const po = new PerformanceObserver(handleObserveLayoutShift);
        po.observe({ type: 'layout-shift', buffered: true });
        observers.push(po);
      } catch {
        // ignore
      }
    }

    flushModel();

    return () => {
      isMountedRef.current = false;
      observers.forEach((o) => o.disconnect());
    };
  }, [handleObserve, handleObserveLayoutShift, flushModel]);

  useEffect(() => {
    flushModel();
  }, [sessionStartTime, flushModel]);

  return model;
}
