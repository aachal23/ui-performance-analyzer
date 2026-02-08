import { useState } from 'react';
import { useInstrumentation } from '@/contexts/InstrumentationContext';
import { CLSDetailPanel } from '@/components/performance/CLSDetailPanel';
import styles from './LayoutShiftHeatmap.module.css';

export function LayoutShiftHeatmap() {
  const { snapshot, updateSnapshot } = useInstrumentation();
  const { entries, totalCls } = snapshot.layoutShift;
  const [highlightedEntryId, setHighlightedEntryId] = useState<string | null>(null);

  const clearLayoutShift = () => {
    updateSnapshot({ layoutShift: { entries: [], totalCls: 0 } });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Layout Shift Heatmap</h1>
        <p className={styles.subtitle}>
          CLS contributors from PerformanceObserver (layout-shift), scoped to Demo App. Use the Demo page overlay to see bounding boxes.
        </p>
      </header>
      <div className={styles.content}>
        <CLSDetailPanel
          entries={entries}
          totalCls={totalCls}
          onClear={clearLayoutShift}
          highlightedEntryId={highlightedEntryId}
          onHighlightEntry={setHighlightedEntryId}
        />
      </div>
    </div>
  );
}
