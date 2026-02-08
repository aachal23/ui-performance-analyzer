import { useState } from 'react';
import type { LayoutShiftEntryStored } from '@/types/layoutShift';
import styles from './CLSDetailPanel.module.css';

export interface CLSDetailPanelProps {
  entries: LayoutShiftEntryStored[];
  totalCls: number;
  onClear: () => void;
  highlightedEntryId: string | null;
  onHighlightEntry: (id: string | null) => void;
  /** When provided, shows overlay toggle (used on Demo page; Layout Shift page omits it). */
  overlayVisible?: boolean;
  onOverlayVisibleChange?: (visible: boolean) => void;
}

function formatTime(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.round(ms)} ms`;
}

export function CLSDetailPanel({
  entries,
  totalCls,
  onClear,
  highlightedEntryId,
  onHighlightEntry,
  overlayVisible,
  onOverlayVisibleChange,
}: Readonly<CLSDetailPanelProps>) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const showOverlayToggle = overlayVisible !== undefined && onOverlayVisibleChange !== undefined;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>CLS contributors</h2>
        <div className={styles.actions}>
          {showOverlayToggle && (
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={overlayVisible}
                onChange={(e) => onOverlayVisibleChange?.(e.target.checked)}
                aria-label="Show overlay"
              />
              <span>Overlay</span>
            </label>
          )}
          <button
            type="button"
            className={styles.clearBtn}
            onClick={onClear}
            disabled={entries.length === 0}
          >
            Clear
          </button>
        </div>
      </div>

      <div className={styles.summary}>
        <span className={styles.totalLabel}>Total CLS</span>
        <span className={styles.totalValue}>{totalCls.toFixed(3)}</span>
        <span className={styles.count}>{entries.length} shift{entries.length !== 1 ? 's' : ''}</span>
      </div>

      {entries.length === 0 ? (
        <p className={styles.empty}>
          No layout shifts recorded yet. Interact with the page or refresh to capture shifts.
        </p>
      ) : (
        <ul className={styles.list}>
          {entries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const isHighlighted = highlightedEntryId === entry.id;

            return (
              <li key={entry.id} className={styles.item}>
                <div
                  className={styles.entryHeader}
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedId((id) => (id === entry.id ? null : entry.id))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setExpandedId((id) => (id === entry.id ? null : entry.id));
                    }
                  }}
                  aria-expanded={isExpanded}
                  aria-label={`Shift ${entry.id}, score ${entry.value.toFixed(3)}`}
                >
                  <span className={styles.entryScore} title="CLS score">
                    {entry.value.toFixed(3)}
                  </span>
                  <span className={styles.entryMeta}>
                    @ {formatTime(entry.startTime)}
                    {entry.hadRecentInput && ' · after input'}
                  </span>
                  <span className={styles.entrySources}>{entry.sources.length} source{entry.sources.length !== 1 ? 's' : ''}</span>
                </div>

                {isExpanded && (
                  <div className={styles.sources}>
                    {entry.sources.map((source, i) => (
                      <div key={`${entry.id}-${source.nodeLabel}-${i}`} className={styles.source}>
                        <div className={styles.sourceLabel} title={source.nodeLabel}>
                          {source.nodeLabel || `Source ${i + 1}`}
                        </div>
                        <div className={styles.sourceRects}>
                          <span>Previous: {source.previousRect.width.toFixed(0)}×{source.previousRect.height.toFixed(0)} @ ({source.previousRect.x.toFixed(0)}, {source.previousRect.y.toFixed(0)})</span>
                          <span>Current: {source.currentRect.width.toFixed(0)}×{source.currentRect.height.toFixed(0)} @ ({source.currentRect.x.toFixed(0)}, {source.currentRect.y.toFixed(0)})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.entryActions}>
                  <button
                    type="button"
                    className={isHighlighted ? styles.highlightActive : styles.highlightBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onHighlightEntry(isHighlighted ? null : entry.id);
                    }}
                    aria-pressed={isHighlighted}
                  >
                    {isHighlighted ? 'Highlighted' : 'Highlight on overlay'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
