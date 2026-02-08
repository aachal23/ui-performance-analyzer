/// <reference types="vite/client" />

/** Layout Instability API (layout-shift entry from PerformanceObserver). */
interface LayoutShift extends PerformanceEntry {
  readonly value: number;
  readonly hadRecentInput: boolean;
  readonly sources: LayoutShiftAttribution[];
}

/** Attribution for one shifted element. */
interface LayoutShiftAttribution {
  readonly node?: Node | null;
  readonly previousRect: DOMRectReadOnly;
  readonly currentRect: DOMRectReadOnly;
}
