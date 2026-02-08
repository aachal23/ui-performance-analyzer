import { useEffect, useMemo, type ReactNode, type RefObject } from 'react';
import { useInstrumentation } from '@/contexts/InstrumentationContext';
import { useWebVitals } from '@/hooks/useWebVitals';
import { usePerformanceTimeline } from '@/hooks/usePerformanceTimeline';
import { useNetworkMetrics } from '@/hooks/useNetworkMetrics';
import { useLayoutShift } from '@/hooks/useLayoutShift';
import type { NetworkResourceEntry } from '@/types/network';

interface InstrumentationCollectorProps {
  children: ReactNode;
  /** DemoApp container ref; when set, layout-shift capture is scoped to nodes inside this element. */
  containerRef?: RefObject<HTMLElement | null>;
}

/**
 * InstrumentationCollector mounts the performance hooks (Web Vitals, timeline,
 * network, layout shift) and pushes their output into InstrumentationContext
 * only while isRecording is true. This component must be mounted only on the
 * /demo route so that:
 * - Observers start when DemoApp (route) mounts and stop when it unmounts.
 * - No duplicate observers (useWebVitals uses a singleton forwarder).
 * - LCP, FCP, CLS, INP, TTFB are captured for the Demo App session and
 *   normalized into the Analyzer store (InstrumentationContext.snapshot).
 * - Timeline (paint, resource, navigation, layout-shift) is captured and
 *   timestamps normalized to session start; fed into snapshot.timeline.
 * - Layout shift: when containerRef is set, only sources whose node is inside
 *   the container are captured (DemoApp viewport only).
 * Renders children only; no DOM of its own.
 */
export function InstrumentationCollector({ children, containerRef }: Readonly<InstrumentationCollectorProps>) {
  const { isRecording, sessionStartTime, updateSnapshot } = useInstrumentation();
  /** Only place that runs useWebVitals; observers run while this is mounted (on /demo). */
  const webVitals = useWebVitals(true);
  /** Timeline: sessionStartTime normalizes timestamps to 0 = session start; only runs on /demo. */
  const timeline = usePerformanceTimeline(sessionStartTime);
  const network = useNetworkMetrics();
  /** Layout shift: containerRef scopes capture to nodes inside DemoApp container. */
  const layoutShift = useLayoutShift({ containerRef });

  /** DemoApp-scoped network: only entries after session start, same-origin, startTime normalized to 0 = session start. */
  const sessionNetwork = useMemo(() => {
    if (!isRecording || sessionStartTime == null) return { entries: [] as NetworkResourceEntry[], endTime: 0 };
    const filtered = network.entries.filter((e) => {
      if (e.startTime < sessionStartTime) return false;
      try {
        return new URL(e.url).origin === window.location.origin;
      } catch {
        return false;
      }
    });
    const normalized = filtered.map((e) => ({
      ...e,
      startTime: e.startTime - sessionStartTime,
    }));
    const endTime =
      normalized.length === 0 ? 0 : Math.max(...normalized.map((e) => e.startTime + e.duration));
    return { entries: normalized, endTime };
  }, [
    isRecording,
    sessionStartTime,
    network.entries,
  ]);

  useEffect(() => {
    if (!isRecording) return;
    updateSnapshot({
      webVitals: {
        metricsList: webVitals.metricsList,
        history: webVitals.history,
      },
      timeline: {
        entries: timeline.entries,
        timeOrigin: timeline.timeOrigin,
        endTime: timeline.endTime,
      },
      network: {
        entries: sessionNetwork.entries,
        endTime: sessionNetwork.endTime,
      },
      layoutShift: {
        entries: layoutShift.entries,
        totalCls: layoutShift.totalCls,
      },
    });
  }, [
    isRecording,
    updateSnapshot,
    webVitals.metricsList,
    webVitals.history,
    timeline.entries,
    timeline.endTime,
    sessionNetwork.entries,
    sessionNetwork.endTime,
    layoutShift.entries,
    layoutShift.totalCls,
  ]);

  return <>{children}</>;
}
