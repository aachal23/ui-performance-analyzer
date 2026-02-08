import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInstrumentation } from '@/contexts/InstrumentationContext';
import { useContainerRect } from '@/hooks/useContainerRect';
import { InstrumentationCollector, AnalyzerSessionManager } from '@/components/instrumentation';
import { DemoApp } from '@/components/demo/DemoApp';
import { ControlPanel } from '@/components/demo/ControlPanel';
import { LayoutShiftOverlay } from '@/components/performance/LayoutShiftOverlay';
import { DEFAULT_DEMO_STRESS_OPTIONS } from '@/types/simulation';
import styles from './Demo.module.css';

export function Demo() {
  const { snapshot } = useInstrumentation();
  const containerRef = useRef<HTMLDivElement>(null);
  const containerRect = useContainerRect(containerRef);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [stressOptions, setStressOptions] = useState(DEFAULT_DEMO_STRESS_OPTIONS);

  return (
    <div className={styles.page}>
      <InstrumentationCollector containerRef={containerRef}>
        <header className={styles.toolbar}>
          <span className={styles.toolbarTitle}>Demo App · Instrumentation</span>
          <div className={styles.actions}>
            <AnalyzerSessionManager mode="full" showHistory={false}>
              <label className={styles.overlayToggle}>
                <input
                  type="checkbox"
                  checked={overlayVisible}
                  onChange={(e) => setOverlayVisible(e.target.checked)}
                  aria-label="Toggle layout shift overlay"
                />
                <span>Overlay</span>
              </label>
              <Link to="/analyzer" className={styles.link}>
                View results →
              </Link>
            </AnalyzerSessionManager>
          </div>
        </header>
        <main ref={containerRef} className={styles.main}>
          <ControlPanel options={stressOptions} onChange={setStressOptions} />
          <DemoApp stress={stressOptions} />
          <LayoutShiftOverlay
            entries={snapshot.layoutShift.entries}
            highlightedEntryId={null}
            visible={overlayVisible}
            containerRect={containerRect}
          />
        </main>
      </InstrumentationCollector>
    </div>
  );
}
