import type { Suggestion, SuggestionSeverity } from '@/types/suggestions';
import styles from './SuggestionsPanel.module.css';

export interface SuggestionsPanelProps {
  suggestions: Suggestion[];
  /** Optional empty state message when there are no suggestions. */
  emptyMessage?: string;
}

const SEVERITY_LABELS: Record<SuggestionSeverity, string> = {
  error: 'Critical',
  warning: 'Warning',
  info: 'Info',
};

function getSeverityClass(severity: SuggestionSeverity): string {
  if (severity === 'error') return styles.severityError ?? '';
  if (severity === 'warning') return styles.severityWarning ?? '';
  return styles.severityInfo ?? '';
}

function SuggestionCard({ suggestion }: Readonly<{ suggestion: Suggestion }>) {
  const severityClass = getSeverityClass(suggestion.severity);

  return (
    <article
      className={styles.card}
      data-severity={suggestion.severity}
      aria-labelledby={`suggestion-title-${suggestion.id}`}
    >
      <div className={styles.cardHeader}>
        <span
          className={`${styles.severityBadge} ${severityClass}`}
          aria-label={`Severity: ${SEVERITY_LABELS[suggestion.severity]}`}
        >
          {SEVERITY_LABELS[suggestion.severity]}
        </span>
        <span className={styles.metricTag}>{suggestion.metric}</span>
      </div>
      <h3 id={`suggestion-title-${suggestion.id}`} className={styles.title}>
        {suggestion.title}
      </h3>
      <p className={styles.description}>{suggestion.description}</p>
      {suggestion.improvementHint && (
        <div className={styles.hint}>
          <span className={styles.hintLabel}>Improvement</span>
          <p className={styles.hintText}>{suggestion.improvementHint}</p>
        </div>
      )}
      {(suggestion.action || suggestion.docUrl) && (
        <div className={styles.actions}>
          {suggestion.action && <span className={styles.actionText}>{suggestion.action}</span>}
          {suggestion.docUrl && (
            <a
              href={suggestion.docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.docLink}
            >
              Learn more →
            </a>
          )}
        </div>
      )}
    </article>
  );
}

export function SuggestionsPanel({
  suggestions,
  emptyMessage = 'No suggestions. Record a Demo App session to get rule-based recommendations.',
}: Readonly<SuggestionsPanelProps>) {
  if (suggestions.length === 0) {
    return (
      <div className={styles.panel}>
        <output className={styles.empty} aria-live="polite">
          {emptyMessage}
        </output>
      </div>
    );
  }

  const suggestionLabel = suggestions.length === 1 ? 'suggestion' : 'suggestions';
  return (
    <div className={styles.panel}>
      <div className={styles.summary}>
        {suggestions.length} {suggestionLabel} (prioritized by severity)
      </div>
      <ul className={styles.list} aria-label="Performance suggestions">
        {suggestions.map((s) => (
          <li key={s.id}>
            <SuggestionCard suggestion={s} />
          </li>
        ))}
      </ul>
    </div>
  );
}
