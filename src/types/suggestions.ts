/**
 * Suggestions engine output and rules.
 */

import type { WebVitalName } from './webVitals';

export type SuggestionPriority = 'high' | 'medium' | 'low';

export type SuggestionSeverity = 'error' | 'warning' | 'info';

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  priority: SuggestionPriority;
  severity: SuggestionSeverity;
  metric: WebVitalName | 'general';
  /** Short improvement hint for the user. */
  improvementHint?: string;
  action?: string;
  docUrl?: string;
}
