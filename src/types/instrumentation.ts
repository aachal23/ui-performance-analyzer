/**
 * Snapshot of all metrics collected during a single recording session.
 * Used by the Instrumentation layer to isolate DemoApp analysis from the Analyzer UI.
 */

import type { WebVitalMetric } from './webVitals';
import type { TimelineModel } from './timeline';
import type { NetworkResourceEntry } from './network';
import type { LayoutShiftEntryStored } from './layoutShift';

export interface InstrumentationSnapshot {
  webVitals: {
    metricsList: WebVitalMetric[];
    history: Array<{ LCP: number | null; FCP: number | null; CLS: number | null; INP: number | null; TTFB: number | null; timestamp: number }>;
  };
  timeline: TimelineModel;
  network: { entries: NetworkResourceEntry[]; endTime: number };
  layoutShift: { entries: LayoutShiftEntryStored[]; totalCls: number };
}

export function getEmptySnapshot(): InstrumentationSnapshot {
  return {
    webVitals: { metricsList: [], history: [] },
    timeline: { entries: [], timeOrigin: 0, endTime: 0 },
    network: { entries: [], endTime: 0 },
    layoutShift: { entries: [], totalCls: 0 },
  };
}

/** Summary of a single run for history (derived from snapshot). */
export interface RunSummary {
  totalCls: number;
  lcp: number | null;
  fcp: number | null;
  networkCount: number;
  timelineEntryCount: number;
}

/** Record of a completed session run (stored in runs history). */
export interface RunRecord {
  sessionId: string;
  startedAt: number;
  stoppedAt: number;
  summary: RunSummary;
}

/** Generate a short unique session id (time-based + random suffix). */
export function generateSessionId(): string {
  const t = typeof Date.now === 'function' ? Date.now() : 0;
  const r = Math.random().toString(36).slice(2, 8);
  return `session-${t}-${r}`;
}

/** Derive RunSummary from an InstrumentationSnapshot. */
export function getRunSummary(snapshot: InstrumentationSnapshot): RunSummary {
  const lcp = snapshot.webVitals.metricsList.find((m) => m.name === 'LCP')?.value ?? null;
  const fcp = snapshot.webVitals.metricsList.find((m) => m.name === 'FCP')?.value ?? null;
  return {
    totalCls: snapshot.layoutShift.totalCls,
    lcp: lcp != null ? lcp : null,
    fcp: fcp != null ? fcp : null,
    networkCount: snapshot.network.entries.length,
    timelineEntryCount: snapshot.timeline.entries.length,
  };
}
