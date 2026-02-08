/**
 * Web Vitals data models and thresholds.
 * Aligned with web-vitals library and Core Web Vitals documentation.
 */

export type WebVitalName = 'LCP' | 'FCP' | 'CLS' | 'INP' | 'TTFB';

export type VitalRating = 'good' | 'needs-improvement' | 'poor';

export interface WebVitalMetric {
  name: WebVitalName;
  value: number;
  rating: VitalRating;
  delta: number;
  id: string;
  navigationType: string;
}

export interface WebVitalsSnapshot {
  LCP: number | null;
  FCP: number | null;
  CLS: number | null;
  INP: number | null;
  TTFB: number | null;
  timestamp: number;
}

/** Thresholds (in ms for time-based, unitless for CLS). */
export const WEB_VITALS_THRESHOLDS: Record<
  WebVitalName,
  { good: number; poor: number }
> = {
  LCP: { good: 2500, poor: 4000 },
  FCP: { good: 1800, poor: 3000 },
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  TTFB: { good: 800, poor: 1800 },
};

export function getRating(
  name: WebVitalName,
  value: number
): VitalRating {
  const { good, poor } = WEB_VITALS_THRESHOLDS[name];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

/** Display units per metric (for labels). */
export const WEB_VITALS_UNITS: Record<WebVitalName, string> = {
  LCP: 'ms',
  FCP: 'ms',
  CLS: '',
  INP: 'ms',
  TTFB: 'ms',
};

/** Order for consistent display. */
export const WEB_VITALS_ORDER: WebVitalName[] = ['LCP', 'FCP', 'CLS', 'INP', 'TTFB'];
