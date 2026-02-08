import { useInstrumentation } from '@/contexts/InstrumentationContext';
import { NetworkWaterfall as NetworkWaterfallChart } from '@/components/performance/NetworkWaterfall';
import styles from './NetworkWaterfall.module.css';

export function NetworkWaterfall() {
  const { snapshot, updateSnapshot } = useInstrumentation();
  const { entries, endTime } = snapshot.network;

  const clearNetwork = () => {
    updateSnapshot({ network: { entries: [], endTime: 0 } });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Network Waterfall</h1>
        <p className={styles.subtitle}>
          Resource timing for the Demo App session (same-origin, from Start to Stop). Times relative to session start.
        </p>
      </header>
      <div className={styles.content}>
        <NetworkWaterfallChart entries={entries} endTime={endTime} onClear={clearNetwork} />
      </div>
    </div>
  );
}
