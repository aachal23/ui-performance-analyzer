/**
 * Normalized performance timeline entry for unified rendering.
 * Built from PerformanceObserver entries: paint, resource, navigation, layout-shift.
 */

export type TimelineEntryType = 'paint' | 'resource' | 'navigation' | 'layout-shift';

export interface TimelineEntry {
  id: string;
  name: string;
  startTime: number;
  duration: number;
  entryType: TimelineEntryType;
  /** Optional: resource URL, paint event name, or layout-shift score. */
  detail?: string;
  /** Layout-shift score when entryType is 'layout-shift'. */
  value?: number;
}

export interface TimelineModel {
  entries: TimelineEntry[];
  timeOrigin: number;
  /** End of timeline in ms from timeOrigin (max startTime + duration). */
  endTime: number;
}
