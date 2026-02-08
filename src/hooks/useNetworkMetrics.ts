import { useCallback, useEffect, useRef, useState } from 'react';
import type { NetworkResourceEntry } from '@/types/network';

/** Build a short display name from URL. */
function resourceName(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname || '/';
    const last = path.split('/').filter(Boolean).pop();
    return last || u.hostname || url.slice(0, 40);
  } catch {
    return String(url).slice(0, 60);
  }
}

/** Generate stable id for a resource entry. */
function resourceId(entry: PerformanceResourceTiming): string {
  return `${entry.name}-${entry.startTime.toFixed(2)}`;
}

/** Normalize PerformanceResourceTiming to NetworkResourceEntry. */
function normalize(entry: PerformanceResourceTiming): NetworkResourceEntry {
  const duration = entry.duration;
  const transferSize = entry.transferSize ?? entry.encodedBodySize ?? 0;
  const size = transferSize > 0 ? transferSize : null;

  const timing: NetworkResourceEntry['timing'] = {};
  if (entry.domainLookupEnd != null && entry.domainLookupStart != null) {
    timing.dns = entry.domainLookupEnd - entry.domainLookupStart;
  }
  if (entry.connectEnd != null && entry.connectStart != null) {
    timing.connect = entry.connectEnd - entry.connectStart;
  }
  if (entry.responseStart != null && entry.requestStart != null) {
    timing.request = entry.responseStart - entry.requestStart;
  }
  if (entry.responseEnd != null && entry.responseStart != null) {
    timing.response = entry.responseEnd - entry.responseStart;
  }

  return {
    id: resourceId(entry),
    url: entry.name,
    name: resourceName(entry.name),
    startTime: entry.startTime,
    duration,
    size,
    type: entry.initiatorType || 'other',
    timing: Object.keys(timing).length > 0 ? timing : undefined,
  };
}

export interface UseNetworkMetricsResult {
  entries: NetworkResourceEntry[];
  endTime: number;
  clear: () => void;
}

/**
 * useNetworkMetrics
 *
 * Captures resource timing entries via PerformanceObserver and initial
 * performance.getEntriesByType('resource'). Extracts name, startTime, duration,
 * size (transferSize or encodedBodySize), type (initiatorType), and optional
 * timing breakdown (dns, connect, request, response). Cleans up observer on unmount.
 */
export function useNetworkMetrics(): UseNetworkMetricsResult {
  const [entries, setEntries] = useState<NetworkResourceEntry[]>([]);
  const seenRef = useRef<Set<string>>(new Set());
  const isMountedRef = useRef(true);

  const clear = useCallback(() => {
    seenRef.current.clear();
    setEntries([]);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    function addEntry(entry: PerformanceResourceTiming) {
      const id = resourceId(entry);
      if (seenRef.current.has(id)) return;
      seenRef.current.add(id);
      if (!isMountedRef.current) return;
      setEntries((prev) => [...prev, normalize(entry)].sort((a, b) => a.startTime - b.startTime));
    }

    const initial = performance.getEntriesByType?.('resource') ?? [];
    for (const entry of initial) {
      addEntry(entry as PerformanceResourceTiming);
    }

    const supported = PerformanceObserver.supportedEntryTypes ?? [];
    if (supported.includes('resource')) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            addEntry(entry as PerformanceResourceTiming);
          }
        }
      });
      observer.observe({ type: 'resource', buffered: true });
      return () => {
        isMountedRef.current = false;
        observer.disconnect();
      };
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const endTime = entries.length === 0
    ? 0
    : Math.max(...entries.map((e) => e.startTime + e.duration));

  return { entries, endTime, clear };
}
