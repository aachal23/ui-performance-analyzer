import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { LayoutShiftEntryStored, LayoutShiftSourceStored, Rect } from '@/types/layoutShift';

/** Build a short label for a shifted node (for list display). */
function getNodeLabel(node: Node | null | undefined): string {
  if (!node || !('tagName' in node)) return 'unknown';
  const el = node as Element;
  const tag = el.tagName?.toLowerCase() ?? 'element';
  const id = el.id ? `#${el.id}` : '';
  const cls = el.className && typeof el.className === 'string'
    ? `.${el.className.trim().split(/\s+/)[0]?.slice(0, 20) ?? ''}`
    : '';
  return `${tag}${id}${cls}`.slice(0, 60) || 'element';
}

/** Copy DOMRectReadOnly to plain Rect (viewport coordinates). */
function rectFrom(r: DOMRectReadOnly): Rect {
  return { x: r.x, y: r.y, width: r.width, height: r.height };
}

/** Return true if this source should be included (node inside container when containerRef provided). */
function isSourceInsideContainer(
  source: LayoutShiftAttribution,
  container: HTMLElement | null
): boolean {
  if (!container) return true;
  const node = source.node;
  if (!node || !('nodeType' in node)) return false;
  return container.contains(node as Node);
}

export interface UseLayoutShiftResult {
  entries: LayoutShiftEntryStored[];
  totalCls: number;
  /** Call to clear stored entries (e.g. after reset). */
  clear: () => void;
}

export interface UseLayoutShiftOptions {
  /**
   * When set, only layout-shift sources whose node is inside this element are included.
   * Use the DemoApp container ref to scope capture to the Demo App viewport only.
   */
  containerRef?: RefObject<HTMLElement | null> | null;
}

/**
 * useLayoutShift(options?)
 *
 * Subscribes to PerformanceObserver for 'layout-shift'. For each entry we capture:
 * - value (CLS score), hadRecentInput, startTime
 * - sources[].node → nodeLabel (tag#id.class)
 * - sources[].previousRect / currentRect → plain Rect in viewport coordinates
 *
 * When containerRef is provided, only sources whose node is inside containerRef.current
 * are included (map affected nodes inside DemoApp container only). Entries with no
 * such sources are skipped. Rects are stored in viewport coordinates; the overlay
 * converts them to container-relative when rendering inside the container.
 *
 * Cleanup: disconnect observer on unmount.
 */
export function useLayoutShift(options: UseLayoutShiftOptions = {}): UseLayoutShiftResult {
  const { containerRef } = options;
  const [entries, setEntries] = useState<LayoutShiftEntryStored[]>([]);
  const isMountedRef = useRef(true);
  const idCounterRef = useRef(0);

  const clear = useCallback(() => setEntries([]), []);

  useEffect(() => {
    isMountedRef.current = true;

    const supported = PerformanceObserver.supportedEntryTypes ?? [];
    if (!supported.includes('layout-shift')) {
      return () => {
        isMountedRef.current = false;
      };
    }

    const observer = new PerformanceObserver((list) => {
      const container = containerRef?.current ?? null;
      const newEntries: LayoutShiftEntryStored[] = [];

      for (const entry of list.getEntries()) {
        const shift = entry as LayoutShift;
        if (!shift.sources || shift.sources.length === 0) continue;

        const sources: LayoutShiftSourceStored[] = [];
        for (const source of shift.sources) {
          if (!isSourceInsideContainer(source, container)) continue;
          sources.push({
            nodeLabel: getNodeLabel(source.node ?? undefined),
            previousRect: rectFrom(source.previousRect),
            currentRect: rectFrom(source.currentRect),
          });
        }

        if (sources.length === 0) continue;

        idCounterRef.current += 1;
        newEntries.push({
          id: `cls-${idCounterRef.current}-${shift.startTime}`,
          value: shift.value,
          hadRecentInput: shift.hadRecentInput,
          startTime: shift.startTime,
          sources,
        });
      }

      if (newEntries.length > 0 && isMountedRef.current) {
        setEntries((prev) => [...prev, ...newEntries]);
      }
    });

    try {
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch {
      // ignore
    }

    return () => {
      isMountedRef.current = false;
      observer.disconnect();
    };
  }, [containerRef]);

  const totalCls = entries.reduce((sum, e) => sum + e.value, 0);

  return { entries, totalCls, clear };
}
