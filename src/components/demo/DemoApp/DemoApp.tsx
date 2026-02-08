import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DemoStressOptions } from '@/types/simulation';
import { DEFAULT_DEMO_STRESS_OPTIONS } from '@/types/simulation';
import styles from './DemoApp.module.css';

const IMAGE_COUNT_NORMAL = 8;
const IMAGE_COUNT_LARGE = 12;
const LIST_SIZE = 40;
const IMAGE_BASE = 'https://picsum.photos/seed/demo';
const API_DELAY_MS = 2500;
const RERENDER_INTERVAL_MS = 50;

export interface DemoAppProps {
  /** Stress options from ControlPanel; when undefined, defaults are used. */
  stress?: Partial<DemoStressOptions>;
}

/** When heavyRerenders is on, this component re-renders frequently to stress the main thread. */
function HeavyRerenderTicker() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((c) => c + 1), RERENDER_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={styles.stressTicker} aria-live="off">
      <span className={styles.stressTickerLabel}>Re-render tick:</span>
      <span className={styles.stressTickerValue}>{tick}</span>
    </div>
  );
}

/** When extraApiDelay is on, simulates slow API and shows data after delay. */
function DelayedApiBlock({ active }: Readonly<{ active: boolean }>) {
  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!active) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setData(null);
    const t = setTimeout(() => {
      setData(`Loaded after ${API_DELAY_MS} ms (simulated delay).`);
      setLoading(false);
    }, API_DELAY_MS);
    return () => clearTimeout(t);
  }, [active]);

  if (!active) return null;

  return (
    <section className={styles.delayedSection} aria-label="Delayed API simulation">
      <h2 className={styles.sectionTitle}>Delayed API</h2>
      <div className={styles.delayedBox}>
        {loading && <p className={styles.delayedLoading}>Waiting {API_DELAY_MS} ms…</p>}
        {data && <p className={styles.delayedData}>{data}</p>}
      </div>
    </section>
  );
}

export function DemoApp({ stress: stressOverride }: Readonly<DemoAppProps>) {
  const stress: DemoStressOptions = { ...DEFAULT_DEMO_STRESS_OPTIONS, ...stressOverride };
  const [loaded, setLoaded] = useState(false);
  const [showList, setShowList] = useState(true);

  const imageCount = stress.largeImages ? IMAGE_COUNT_LARGE : IMAGE_COUNT_NORMAL;
  const imageWidth = stress.largeImages ? 1200 : 300;
  const imageHeight = stress.largeImages ? 800 : 200;
  const lastImageIndex = imageCount - 1;

  const handleLastImageLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <div className={styles.root}>
      {stress.heavyRerenders && <HeavyRerenderTicker />}

      <section className={styles.hero}>
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Demo App
        </motion.h1>
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          Heavy UI for performance testing: images, list, animations.
        </motion.p>
      </section>

      <DelayedApiBlock active={stress.extraApiDelay} />

      <section className={styles.images} aria-label="Image gallery">
        <h2 className={styles.sectionTitle}>
          Images {stress.largeImages && `(${imageWidth}×${imageHeight})`}
        </h2>
        <div className={styles.imageGrid}>
          {Array.from({ length: imageCount }, (_, i) => (
            <motion.div
              key={i}
              className={styles.imageWrap}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <img
                src={`${IMAGE_BASE}/${imageWidth + i}/${imageHeight + i}`}
                alt={`Demo ${i + 1}`}
                width={imageWidth}
                height={imageHeight}
                loading="lazy"
                onLoad={i === lastImageIndex ? handleLastImageLoad : undefined}
                className={styles.img}
              />
            </motion.div>
          ))}
        </div>
        {loaded && (
          <motion.p
            className={styles.loadedHint}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            All images loaded.
          </motion.p>
        )}
      </section>

      <section className={styles.listSection}>
        <div className={styles.listHeader}>
          <h2 className={styles.sectionTitle}>List</h2>
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setShowList((v) => !v)}
            aria-expanded={showList}
          >
            {showList ? 'Hide' : 'Show'} list
          </button>
        </div>
        <AnimatePresence>
          {showList && (
            <motion.ul
              className={styles.list}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {Array.from({ length: LIST_SIZE }, (_, i) => (
                <motion.li
                  key={i}
                  className={styles.listItem}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.2 }}
                  whileHover={{ backgroundColor: 'var(--color-surface-elevated)' }}
                >
                  <span className={styles.listIndex}>{i + 1}</span>
                  <span className={styles.listText}>List item {i + 1}</span>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </section>

      {stress.animations && (
        <section className={styles.animSection}>
          <h2 className={styles.sectionTitle}>Animations</h2>
          <div className={styles.animGrid}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={styles.animBox}
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 0.5,
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
