import type { InstrumentationSnapshot } from '@/types/instrumentation';
import type { Suggestion, SuggestionPriority, SuggestionSeverity } from '@/types/suggestions';
import type { WebVitalName } from '@/types/webVitals';
import { WEB_VITALS_THRESHOLDS, WEB_VITALS_UNITS } from '@/types/webVitals';

const PRIORITY_ORDER: SuggestionPriority[] = ['high', 'medium', 'low'];
const SEVERITY_ORDER: SuggestionSeverity[] = ['error', 'warning', 'info'];

const LCP_HINT =
  'Optimize LCP: reduce server response time, use a CDN, preload the LCP image or font, and minimize render-blocking resources.';
const FCP_HINT =
  'Improve FCP: minimize critical path length, reduce render-blocking CSS/JS, and optimize server response.';
const CLS_HINT =
  'Reduce layout shifts: set explicit width/height on images and embeds, avoid inserting content above existing content, and reserve space for dynamic content.';
const INP_HINT =
  'Improve interactivity: break up long JavaScript tasks, reduce main-thread work, and avoid heavy execution during user input.';
const TTFB_HINT =
  'Improve TTFB: optimize server response, use a CDN, enable caching, and reduce server-side work.';

const METRIC_HINTS: Record<WebVitalName, string> = {
  LCP: LCP_HINT,
  FCP: FCP_HINT,
  CLS: CLS_HINT,
  INP: INP_HINT,
  TTFB: TTFB_HINT,
};

function ratingToPriorityAndSeverity(
  rating: 'good' | 'needs-improvement' | 'poor'
): { priority: SuggestionPriority; severity: SuggestionSeverity } {
  if (rating === 'poor') return { priority: 'high', severity: 'error' };
  if (rating === 'needs-improvement') return { priority: 'medium', severity: 'warning' };
  return { priority: 'low', severity: 'info' };
}

function formatValue(name: WebVitalName, value: number): string {
  const unit = WEB_VITALS_UNITS[name];
  if (name === 'CLS') return value.toFixed(3);
  if (unit === 'ms') return `${Math.round(value)} ms`;
  return `${value}${unit}`;
}

function addVitalSuggestions(snapshot: InstrumentationSnapshot, out: Suggestion[]): void {
  const thresholds = WEB_VITALS_THRESHOLDS;
  for (const metric of snapshot.webVitals.metricsList) {
    if (metric.rating === 'good') continue;
    const { priority, severity } = ratingToPriorityAndSeverity(metric.rating);
    const limit = metric.rating === 'poor' ? thresholds[metric.name].poor : thresholds[metric.name].good;
    out.push({
      id: `vital-${metric.name}-${metric.id}`,
      title: `Improve ${metric.name}`,
      description: `${metric.name} is ${metric.rating.replace('-', ' ')} (${formatValue(metric.name, metric.value)}; threshold ${formatValue(metric.name, limit)}).`,
      priority,
      severity,
      metric: metric.name,
      improvementHint: METRIC_HINTS[metric.name],
      docUrl: 'https://web.dev/vitals/',
    });
  }
}

/**
 * Rule-based analysis of Demo App collected metrics.
 * Returns suggestions prioritized by issue severity (high/error first) with improvement hints.
 */
export function analyzeDemoPerformance(snapshot: InstrumentationSnapshot): Suggestion[] {
  const suggestions: Suggestion[] = [];
  addVitalSuggestions(snapshot, suggestions);

  // --- Layout shift rules ---
  const clsEntries = snapshot.layoutShift.entries.length;
  const totalCls = snapshot.layoutShift.totalCls;
  if (totalCls > 0.25 || clsEntries > 8) {
    const severity: SuggestionSeverity = totalCls > 0.25 ? 'error' : 'warning';
    const priority: SuggestionPriority = totalCls > 0.25 ? 'high' : 'medium';
    suggestions.push({
      id: 'layout-shift-summary',
      title: 'Reduce cumulative layout shift',
      description: `Total CLS is ${totalCls.toFixed(3)} with ${clsEntries} shift event${clsEntries === 1 ? '' : 's'}. This can hurt user experience.`,
      priority,
      severity,
      metric: 'CLS',
      improvementHint: CLS_HINT,
      action: 'Review the Layout Shift heatmap to find affected elements.',
    });
  } else if (clsEntries > 3 && totalCls <= 0.1) {
    suggestions.push({
      id: 'layout-shift-count',
      title: 'Monitor layout shift count',
      description: `CLS score is good (${totalCls.toFixed(3)}) but ${clsEntries} shift events were recorded. Consider reducing shifts to improve stability.`,
      priority: 'low',
      severity: 'info',
      metric: 'CLS',
      improvementHint: CLS_HINT,
    });
  }

  // --- Network rules ---
  const networkCount = snapshot.network.entries.length;
  if (networkCount > 40) {
    suggestions.push({
      id: 'network-count',
      title: 'Reduce number of network requests',
      description: `${networkCount} requests were captured during the session. Fewer requests can improve load time.`,
      priority: 'medium',
      severity: 'warning',
      metric: 'general',
      improvementHint: 'Combine resources, use lazy loading for below-the-fold content, and leverage caching.',
      action: 'Review the Network waterfall for optimization opportunities.',
    });
  }

  // --- Timeline / general ---
  const timelineCount = snapshot.timeline.entries.length;
  const hasNoSuggestionsYet = suggestions.length === 0;
  if (hasNoSuggestionsYet && timelineCount > 60) {
    suggestions.push({
      id: 'timeline-activity',
      title: 'High timeline activity',
      description: `Many timeline entries (${timelineCount}) were recorded. Consider profiling to find long tasks or heavy paint.`,
      priority: 'low',
      severity: 'info',
      metric: 'general',
      improvementHint: 'Use the Timeline view to identify long tasks and optimize critical path.',
    });
  }

  // --- Prioritize: high/error first, then medium/warning, then low/info ---
  suggestions.sort((a, b) => {
    const p = PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority);
    if (p !== 0) return p;
    return SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
  });

  return suggestions;
}
