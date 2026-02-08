import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { NetworkResourceEntry } from '@/types/network';
import styles from './NetworkWaterfall.module.css';

export type SortField = 'startTime' | 'duration' | 'name' | 'type';
export type SortDir = 'asc' | 'desc';

export interface NetworkWaterfallProps {
  entries: NetworkResourceEntry[];
  endTime: number;
  onClear?: () => void;
}

const ROW_HEIGHT = 24;
const LABEL_WIDTH = 220;
const MIN_TIMELINE_WIDTH = 600;
const PIXELS_PER_MS = 0.15;

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.round(ms)} ms`;
}

function formatSize(bytes: number | null): string {
  if (bytes == null || bytes === 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function typeColor(type: string): string {
  const t = type.toLowerCase();
  if (t === 'script') return 'var(--color-warning)';
  if (t === 'link') return 'var(--color-primary)';
  if (t === 'img') return 'var(--color-success)';
  if (t === 'fetch' || t === 'xmlhttprequest') return 'var(--color-text-muted)';
  if (t === 'iframe') return '#a371f7';
  return 'var(--color-text-muted)';
}

export function NetworkWaterfall({
  entries,
  endTime,
  onClear,
}: Readonly<NetworkWaterfallProps>) {
  const [sortField, setSortField] = useState<SortField>('startTime');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [nameFilter, setNameFilter] = useState('');

  const typeOptions = useMemo(() => {
    const set = new Set(entries.map((e) => e.type));
    return ['all', ...Array.from(set).sort()];
  }, [entries]);

  const filteredAndSorted = useMemo(() => {
    let list = entries;
    if (typeFilter !== 'all') {
      list = list.filter((e) => e.type === typeFilter);
    }
    if (nameFilter.trim()) {
      const q = nameFilter.trim().toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q));
    }
    const dir = sortDir === 'asc' ? 1 : -1;
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'startTime') cmp = a.startTime - b.startTime;
      else if (sortField === 'duration') cmp = a.duration - b.duration;
      else if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortField === 'type') cmp = a.type.localeCompare(b.type);
      return cmp * dir;
    });
    return list;
  }, [entries, typeFilter, nameFilter, sortField, sortDir]);

  const timelineWidthPx = Math.max(MIN_TIMELINE_WIDTH, endTime * PIXELS_PER_MS);
  const scale = timelineWidthPx / (endTime || 1);

  const [tooltip, setTooltip] = useState<{
    entry: NetworkResourceEntry;
    x: number;
    y: number;
  } | null>(null);

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <label className={styles.filterLabel}>
            Type
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={styles.select}
              aria-label="Filter by type"
            >
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.filterLabel}>
            Name
            <input
              type="search"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Filter by name…"
              className={styles.search}
              aria-label="Filter by name"
            />
          </label>
        </div>
        <div className={styles.sortRow}>
          <span className={styles.sortLabel}>Sort</span>
          {(['startTime', 'duration', 'name', 'type'] as const).map((field) => (
            <button
              key={field}
              type="button"
              className={sortField === field ? styles.sortBtnActive : styles.sortBtn}
              onClick={() => {
                if (sortField === field) {
                  setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                } else {
                  setSortField(field);
                  setSortDir('asc');
                }
              }}
              aria-pressed={sortField === field}
              aria-label={`Sort by ${field} ${sortField === field ? sortDir : ''}`}
            >
              {field === 'startTime' ? 'Start' : field === 'duration' ? 'Duration' : field}
              {sortField === field && (sortDir === 'asc' ? ' ↑' : ' ↓')}
            </button>
          ))}
        </div>
        {onClear && (
          <button type="button" className={styles.clearBtn} onClick={onClear}>
            Clear
          </button>
        )}
      </div>

      <div className={styles.summary}>
        {filteredAndSorted.length} resource{filteredAndSorted.length !== 1 ? 's' : ''}
        {endTime > 0 && ` · 0 – ${formatMs(endTime)}`}
      </div>

      {filteredAndSorted.length === 0 ? (
        <div className={styles.empty}>
          {entries.length === 0
            ? 'No resources captured yet. Refresh the page or trigger network requests.'
            : 'No resources match the current filters.'}
        </div>
      ) : (
        <div className={styles.waterfallWrap}>
          <div className={styles.axisRow}>
            <div className={styles.axisLabel} style={{ width: LABEL_WIDTH }} />
            <div className={styles.axisTrack} style={{ width: timelineWidthPx }}>
              {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                <span
                  key={t}
                  className={styles.axisTick}
                  style={{ left: `${t * 100}%` }}
                >
                  {formatMs(t * endTime)}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.rows} onMouseLeave={() => setTooltip(null)}>
            {filteredAndSorted.map((entry, index) => {
              const leftPx = entry.startTime * scale;
              const widthPx = Math.max(2, entry.duration * scale);
              const color = typeColor(entry.type);

              return (
                <motion.div
                  key={entry.id}
                  className={styles.row}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.01 }}
                  style={{ height: ROW_HEIGHT }}
                >
                  <div
                    className={styles.rowLabel}
                    style={{ width: LABEL_WIDTH }}
                    title={entry.name}
                  >
                    <span className={styles.rowType}>{entry.type}</span>
                    <span className={styles.rowName}>{entry.name}</span>
                  </div>
                  <div
                    className={styles.barTrack}
                    style={{ width: timelineWidthPx }}
                  >
                    <motion.div
                      role="img"
                      aria-label={`${entry.name}: ${formatMs(entry.duration)}`}
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
                          prev?.entry.id === entry.id
                            ? { ...prev, x: rect.left + rect.width / 2, y: rect.top }
                            : prev
                        );
                      }}
                      onMouseLeave={() =>
                        setTooltip((prev) => (prev?.entry.id === entry.id ? null : prev))
                      }
                      whileHover={{ opacity: 0.9 }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {tooltip && (
        <motion.div
          className={styles.tooltip}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            left: Math.min(tooltip.x, typeof globalThis.window !== 'undefined' ? globalThis.window.innerWidth - 260 : tooltip.x),
            top: tooltip.y - 8,
          }}
        >
          <div className={styles.tooltipTitle} title={tooltip.entry.name}>
            {tooltip.entry.name}
          </div>
          <div className={styles.tooltipRow}>
            <span>Type</span>
            <span>{tooltip.entry.type}</span>
          </div>
          <div className={styles.tooltipRow}>
            <span>Start</span>
            <span>{formatMs(tooltip.entry.startTime)}</span>
          </div>
          <div className={styles.tooltipRow}>
            <span>Duration</span>
            <span>{formatMs(tooltip.entry.duration)}</span>
          </div>
          <div className={styles.tooltipRow}>
            <span>Size</span>
            <span>{formatSize(tooltip.entry.size)}</span>
          </div>
          {tooltip.entry.timing && (
            <>
              {tooltip.entry.timing.dns != null && (
                <div className={styles.tooltipRow}>
                  <span>DNS</span>
                  <span>{formatMs(tooltip.entry.timing.dns)}</span>
                </div>
              )}
              {tooltip.entry.timing.connect != null && (
                <div className={styles.tooltipRow}>
                  <span>Connect</span>
                  <span>{formatMs(tooltip.entry.timing.connect)}</span>
                </div>
              )}
              {tooltip.entry.timing.request != null && (
                <div className={styles.tooltipRow}>
                  <span>Request</span>
                  <span>{formatMs(tooltip.entry.timing.request)}</span>
                </div>
              )}
              {tooltip.entry.timing.response != null && (
                <div className={styles.tooltipRow}>
                  <span>Response</span>
                  <span>{formatMs(tooltip.entry.timing.response)}</span>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
