import { useCallback, useEffect, useRef, useState } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import type { WebVitalName, WebVitalMetric, WebVitalsSnapshot, VitalRating } from '@/types/webVitals';
import { getRating, WEB_VITALS_ORDER } from '@/types/webVitals';

/** Maximum number of snapshots to keep for timeline history. */
const MAX_HISTORY = 20;

/** Map library metric name to our WebVitalName (we do not collect FID). */
function toVitalName(name: string): WebVitalName | null {
  if (name === 'LCP' || name === 'FCP' || name === 'CLS' || name === 'INP' || name === 'TTFB') {
    return name;
  }
  return null;
}

/** Build our WebVitalMetric from the library's metric shape (value, id, etc.). */
function toWebVitalMetric(
  name: WebVitalName,
  value: number,
  id: string,
  delta: number,
  navigationType: string
): WebVitalMetric {
  const rating: VitalRating = getRating(name, value);
  return { name, value, rating, delta, id, navigationType };
}

export interface WebVitalsState {
  /** Current value per metric (null until reported). */
  metrics: Record<WebVitalName, WebVitalMetric | null>;
  /** All reported metrics as a list (for iteration; excludes nulls). */
  metricsList: WebVitalMetric[];
  /** Recent snapshots for timeline (newest last). */
  history: WebVitalsSnapshot[];
}

const INITIAL_METRICS: Record<WebVitalName, WebVitalMetric | null> = {
  LCP: null,
  FCP: null,
  CLS: null,
  INP: null,
  TTFB: null,
};

/** Library metric shape passed to our handler. */
type ReportMetric = { name: string; value: number; id: string; delta: number; navigationType: string };

/** Singleton: one global registration, forward to the active session handler. Prevents duplicate observers. */
let webVitalsRegistered = false;
let activeHandlerRef: ((metric: ReportMetric) => void) | null = null;

function forwardReport(metric: ReportMetric) {
  const handler = activeHandlerRef;
  if (handler) handler(metric);
}

function registerWebVitalsOnce() {
  if (webVitalsRegistered) return;
  webVitalsRegistered = true;
  onCLS(forwardReport);
  onFCP(forwardReport);
  onINP(forwardReport);
  onLCP(forwardReport);
  onTTFB(forwardReport);
}

/**
 * useWebVitals(enabled?)
 *
 * Subscribes to LCP, FCP, CLS, INP, TTFB via the web-vitals library. Observers are
 * registered only once app-wide (singleton forwarder); this hook sets the active
 * handler so reports are delivered only while the hook is mounted and enabled.
 *
 * - When enabled is true: this instance becomes the active handler; observers run
 *   (if not already registered) and reports update state.
 * - When enabled is false or on unmount: this instance clears itself as handler,
 *   so reports stop being processed (effective stop). No duplicate observers.
 *
 * Use only inside InstrumentationCollector (DemoApp route) so Web Vitals are
 * captured only for the DemoApp session. Normalized metrics are pushed to
 * InstrumentationContext (Analyzer store) by the collector.
 */
export function useWebVitals(enabled: boolean = true): WebVitalsState {
  const [state, setState] = useState<WebVitalsState>({
    metrics: { ...INITIAL_METRICS },
    metricsList: [],
    history: [],
  });

  const isMountedRef = useRef(true);
  const currentSnapshotRef = useRef<Partial<Record<WebVitalName, number>>>({});

  const handleReport = useCallback((metric: ReportMetric) => {
    const name = toVitalName(metric.name);
    if (!name) return;

    const entry: WebVitalMetric = toWebVitalMetric(
      name,
      metric.value,
      metric.id,
      metric.delta,
      metric.navigationType
    );

    setState((prev) => {
      if (!isMountedRef.current) return prev;

      const nextMetrics = { ...prev.metrics, [name]: entry };
      const merged = [...prev.metricsList.filter((m) => m.name !== name), entry];
      const nextList = merged.sort(
        (a: WebVitalMetric, b: WebVitalMetric) =>
          WEB_VITALS_ORDER.indexOf(a.name) - WEB_VITALS_ORDER.indexOf(b.name)
      );
      currentSnapshotRef.current[name] = metric.value;
      const snapshot: WebVitalsSnapshot = {
        LCP: currentSnapshotRef.current.LCP ?? null,
        FCP: currentSnapshotRef.current.FCP ?? null,
        CLS: currentSnapshotRef.current.CLS ?? null,
        INP: currentSnapshotRef.current.INP ?? null,
        TTFB: currentSnapshotRef.current.TTFB ?? null,
        timestamp: Date.now(),
      };

      const nextHistory = [...prev.history, snapshot].slice(-MAX_HISTORY);

      return {
        metrics: nextMetrics,
        metricsList: nextList,
        history: nextHistory,
      };
    });
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      activeHandlerRef = handleReport;
      registerWebVitalsOnce();
    }

    return () => {
      isMountedRef.current = false;
      if (activeHandlerRef === handleReport) {
        activeHandlerRef = null;
      }
    };
  }, [enabled, handleReport]);

  return state;
}
