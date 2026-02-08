import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TimelineEntry, TimelineModel } from '@/types/timeline';
import styles from './TimelineChart.module.css';

const ROW_HEIGHT = 28;
const MIN_BAR_WIDTH_PX = 4;
const TIME_AXIS_HEIGHT = 32;

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.round(ms)} ms`;
}

function entryTypeColor(type: TimelineEntry['entryType']): string {
  switch (type) {
    case 'paint':
      return 'var(--color-primary)';
    case 'resource':
      return 'var(--color-success)';
    case 'navigation':
      return 'var(--color-warning)';
    case 'layout-shift':
      return 'var(--color-danger)';
    default:
      return 'var(--color-text-muted)';
  }
}

export interface TimelineChartProps {
  model: TimelineModel;
}

export function TimelineChart({ model }: Readonly<TimelineChartProps>) {
  const [tooltip, setTooltip] = useState<{
    entry: TimelineEntry;
    x: number;
    y: number;
  } | null>(null);

  const { scale, totalWidthPx } = useMemo(() => {
    const end = model.endTime || 1;
    const totalWidthPx = 800;
    const scale = totalWidthPx / end;
    return { scale, totalWidthPx };
  }, [model.endTime]);

  const rows = useMemo(() => model.entries, [model.entries]);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.title}>Performance timeline</span>
        <span className={styles.meta}>
          {rows.length} entries · 0 – {formatMs(model.endTime)}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className={styles.empty}>
          <p>Collecting performance entries…</p>
          <p className={styles.emptyHint}>Refresh the page or wait for paint, resource, navigation, and layout-shift events.</p>
        </div>
      ) : (
      <>
      <div className={styles.chartContainer}>
        <div
          className={styles.timeline}
          style={{ width: totalWidthPx + 16 }}
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Time axis */}
          <div className={styles.axis} style={{ height: TIME_AXIS_HEIGHT }}>
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const ms = t * model.endTime;
              const left = t * totalWidthPx;
              return (
                <span
                  key={t}
                  className={styles.axisTick}
                  style={{ left: left + 8 }}
                >
                  {formatMs(ms)}
                </span>
              );
            })}
          </div>

          {/* Rows */}
          <div className={styles.rows}>
            <AnimatePresence initial={false}>
              {rows.map((entry, index) => {
                const leftPx = entry.startTime * scale;
                const widthPx = Math.max(
                  MIN_BAR_WIDTH_PX,
                  entry.duration * scale
                );
                const color = entryTypeColor(entry.entryType);

                return (
                  <motion.div
                    key={entry.id}
                    className={styles.row}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.02,
                    }}
                    style={{ height: ROW_HEIGHT }}
                  >
                    <span className={styles.rowLabel} title={entry.name}>
                      {entry.entryType}
                    </span>
                    <div className={styles.barTrack} style={{ width: totalWidthPx }}>
                      <motion.div
                        role="img"
                        aria-label={`${entry.name}: ${formatMs(entry.startTime)} – ${formatMs(entry.duration)}`}
                        className={styles.bar}
                        style={{
                          left: leftPx,
                          width: widthPx,
                          backgroundColor: color,
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            entry,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseMove={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  x: rect.left + rect.width / 2,
                                  y: rect.top,
                                }
                              : null
                          );
                        }}
                        onMouseLeave={() => setTooltip((prev) => (prev?.entry.id === entry.id ? null : prev))}
                        whileHover={{ scaleY: 1.08 }}
                        transition={{ duration: 0.15 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {tooltip && (
          <motion.div
            className={styles.tooltip}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            style={{
              left: tooltip.x,
              top: tooltip.y - 8,
            }}
          >
            <div className={styles.tooltipTitle}>{tooltip.entry.name}</div>
            <div className={styles.tooltipRow}>
              <span>Type</span>
              <span>{tooltip.entry.entryType}</span>
            </div>
            <div className={styles.tooltipRow}>
              <span>Start</span>
              <span>{formatMs(tooltip.entry.startTime)}</span>
            </div>
            <div className={styles.tooltipRow}>
              <span>Duration</span>
              <span>{formatMs(tooltip.entry.duration)}</span>
            </div>
            {tooltip.entry.detail && (
              <div className={styles.tooltipRow}>
                <span>Detail</span>
                <span>{tooltip.entry.detail}</span>
              </div>
            )}
            {tooltip.entry.value != null && (
              <div className={styles.tooltipRow}>
                <span>Score</span>
                <span>{tooltip.entry.value.toFixed(3)}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.legend}>
        <span className={styles.legendItem} style={{ color: 'var(--color-primary)' }}>
          paint
        </span>
        <span className={styles.legendItem} style={{ color: 'var(--color-success)' }}>
          resource
        </span>
        <span className={styles.legendItem} style={{ color: 'var(--color-warning)' }}>
          navigation
        </span>
        <span className={styles.legendItem} style={{ color: 'var(--color-danger)' }}>
          layout-shift
        </span>
      </div>
      </>
      )}
    </div>
  );
}
