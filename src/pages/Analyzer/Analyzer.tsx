import { useInstrumentation } from '@/contexts/InstrumentationContext';
import { AnalyzerSessionManager } from '@/components/instrumentation';
import { WebVitalsDashboard } from '@/components/performance/WebVitalsDashboard';
import styles from './Analyzer.module.css';

/**
 * Analyzer displays Web Vitals from the instrumentation snapshot (Analyzer store).
 * Metrics are captured only during a Demo App session when recording is started;
 * they are normalized and stored in InstrumentationContext by InstrumentationCollector.
 */
export function Analyzer() {
  const { snapshot } = useInstrumentation();
  const { metricsList, history } = snapshot.webVitals;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Analyzer</h1>
        <p className={styles.subtitle}>
          Web Vitals (LCP, FCP, CLS, INP, TTFB) from the last Demo App recording. Record a session on the Demo App, then view results here.
        </p>
        <div className={styles.sessionSection}>
          <AnalyzerSessionManager mode="summary" showHistory={true} />
        </div>
      </header>
      <div className={styles.content}>
        {metricsList.length === 0 && history.length === 0 ? (
          <div className={styles.empty}>
            <p>No Web Vitals recorded yet.</p>
            <p className={styles.emptyHint}>
              Go to <strong>Demo App</strong>, click <strong>Start</strong>, interact with the page, then <strong>Stop</strong> and return here to see metrics.
            </p>
          </div>
        ) : (
          <WebVitalsDashboard metricsList={metricsList} history={history} />
        )}
      </div>
    </div>
  );
}
