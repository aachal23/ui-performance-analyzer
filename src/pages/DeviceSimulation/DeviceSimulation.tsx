import styles from './DeviceSimulation.module.css';

export function DeviceSimulation() {
  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>Device Simulation</h2>
      <p className={styles.placeholder}>
        Slow network and CPU throttling controls will appear here.
      </p>
    </div>
  );
}
