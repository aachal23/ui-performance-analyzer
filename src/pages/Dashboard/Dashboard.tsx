import styles from './Dashboard.module.css';

export function Dashboard() {
  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>Web Vitals Dashboard</h2>
      <p className={styles.placeholder}>
        LCP, FCP, CLS, INP, TTFB metrics and gauges will appear here.
      </p>
    </div>
  );
}
