/**
 * Layout shift (CLS) entries and heatmap data.
 * Stored shapes use plain rects so they are serializable in state.
 */

/** Serializable rect for state (from DOMRectReadOnly). */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Stored attribution: node label (selector or tag#id) and rects at capture time. */
export interface LayoutShiftSourceStored {
  nodeLabel: string;
  previousRect: Rect;
  currentRect: Rect;
}

/** One layout-shift event from PerformanceObserver, with serialized sources. */
export interface LayoutShiftEntryStored {
  id: string;
  value: number;
  hadRecentInput: boolean;
  startTime: number;
  sources: LayoutShiftSourceStored[];
}

/** Legacy / API shape (DOM rects – not stored in React state). */
export interface LayoutShiftSource {
  node?: string;
  currentRect: DOMRectReadOnly;
  previousRect: DOMRectReadOnly;
}

export interface LayoutShiftEntry {
  value: number;
  hadRecentInput: boolean;
  sources: LayoutShiftSource[];
  startTime?: number;
}

export interface LayoutShiftRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
}
