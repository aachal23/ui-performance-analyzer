/**
 * Performance timeline and marks/measures.
 */

export type PerformanceEntryType = 'mark' | 'measure' | 'longtask';

export interface PerformanceMarkMeasure {
  name: string;
  startTime: number;
  duration: number;
  entryType: PerformanceEntryType;
}

export interface LongTaskEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: 'longtask';
}

export interface TimelineSegment {
  id: string;
  label: string;
  start: number;
  end: number;
  duration: number;
  type: PerformanceEntryType;
}
