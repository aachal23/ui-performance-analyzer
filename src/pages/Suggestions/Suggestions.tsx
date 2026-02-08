import { useMemo } from 'react';
import { useInstrumentation } from '@/contexts/InstrumentationContext';
import { analyzeDemoPerformance } from '@/lib/analyzeDemoPerformance';
import { SuggestionsPanel } from '@/components/performance/SuggestionsPanel';
import styles from './Suggestions.module.css';

export function Suggestions() {
  const { snapshot } = useInstrumentation();
  const suggestions = useMemo(() => analyzeDemoPerformance(snapshot), [snapshot]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Suggestions</h1>
        <p className={styles.subtitle}>
          Rule-based performance suggestions from your Demo App session. Issues are prioritized by severity with improvement hints.
        </p>
      </header>
      <div className={styles.content}>
        <SuggestionsPanel
          suggestions={suggestions}
          emptyMessage="No suggestions yet. Record a Demo App session (Start → interact → Stop), then view results here."
        />
      </div>
    </div>
  );
}
