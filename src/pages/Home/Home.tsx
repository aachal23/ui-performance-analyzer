import { Link } from 'react-router-dom';
import styles from './Home.module.css';

export function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="hero-heading">
        <h1 id="hero-heading" className={styles.heroTitle}>
          UI Performance Analyzer
        </h1>
        <p className={styles.heroSubtitle}>
          Visualize Web Vitals, timelines, and network activity using browser Performance APIs.
        </p>
        <nav className={styles.quickNav} aria-label="Quick navigation">
          <Link to="/analyzer" className={styles.quickLink}>Analyzer</Link>
          <Link to="/timeline" className={styles.quickLink}>Timeline</Link>
          <Link to="/network" className={styles.quickLink}>Network</Link>
          <Link to="/suggestions" className={styles.quickLink}>Suggestions</Link>
        </nav>
      </section>
      <section className={styles.features} aria-labelledby="features-heading">
        <h2 id="features-heading" className={styles.srOnly}>Features</h2>
        <ul className={styles.featureList}>
          <li className={styles.featureItem}>
            <span className={styles.featureLabel}>Web Vitals</span>
            <span className={styles.featureDesc}>LCP, FCP, CLS, INP, TTFB</span>
          </li>
          <li className={styles.featureItem}>
            <span className={styles.featureLabel}>Timeline</span>
            <span className={styles.featureDesc}>Performance marks &amp; measures</span>
          </li>
          <li className={styles.featureItem}>
            <span className={styles.featureLabel}>Network</span>
            <span className={styles.featureDesc}>Resource waterfall</span>
          </li>
          <li className={styles.featureItem}>
            <span className={styles.featureLabel}>Suggestions</span>
            <span className={styles.featureDesc}>Actionable improvements</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
