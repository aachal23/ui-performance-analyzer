/**
 * Resource timing and network waterfall.
 */

export interface ResourceTimingEntry {
  name: string;
  startTime: number;
  duration: number;
  initiatorType: string;
  transferSize?: number;
  encodedBodySize?: number;
  responseEnd?: number;
  domainLookupStart?: number;
  domainLookupEnd?: number;
  connectStart?: number;
  connectEnd?: number;
  requestStart?: number;
  responseStart?: number;
}

export type ResourceInitiatorType =
  | 'script'
  | 'link'
  | 'img'
  | 'fetch'
  | 'xmlhttprequest'
  | 'iframe'
  | 'other';

/** Normalized resource for waterfall: name, startTime, duration, size, type. */
export interface NetworkResourceEntry {
  id: string;
  /** Full URL (for same-origin filtering and links). */
  url: string;
  /** Short display name derived from URL. */
  name: string;
  startTime: number;
  duration: number;
  size: number | null;
  type: string;
  /** Optional timing breakdown for tooltip (ms). */
  timing?: {
    dns?: number;
    connect?: number;
    request?: number;
    response?: number;
  };
}
