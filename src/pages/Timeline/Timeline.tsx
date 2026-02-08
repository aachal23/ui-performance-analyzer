import { useInstrumentation } from '@/contexts/InstrumentationContext';
import { TimelineChart } from '@/components/performance/TimelineChart';
import styles from './Timeline.module.css';

/**
 * Timeline displays the performance timeline from the last Demo App recording.
 * Data (paint, resource, navigation, layout-shift) is captured only during the
 * Demo App session; timestamps are normalized to session start and stored in
 * InstrumentationContext.snapshot.timeline.
 */
export function Timeline() {
  const { snapshot } = useInstrumentation();
  const model = snapshot.timeline;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Performance Timeline</h1>
        <p className={styles.subtitle}>
          Paint, resource, navigation, and layout-shift from the last Demo App recording. Timestamps are relative to session start.
        </p>
      </header>
      <div className={styles.content}>
        {model.entries.length === 0 ? (
          <div className={styles.empty}>
            <p>No timeline data recorded yet.</p>
            <p className={styles.emptyHint}>
              Go to <strong>Demo App</strong>, click <strong>Start</strong>, interact with the page, then <strong>Stop</strong> and return here to see the timeline.
            </p>
          </div>
        ) : (
          <TimelineChart model={model} />
        )}
      </div>
    </div>
  );
}
