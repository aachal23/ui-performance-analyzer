import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { LayoutShiftEntryStored, LayoutShiftSourceStored, Rect } from '@/types/layoutShift';
import styles from './LayoutShiftOverlay.module.css';

export interface LayoutShiftOverlayProps {
  entries: LayoutShiftEntryStored[];
  /** When set, only this entry's boxes are shown at full opacity; others are dimmed. */
  highlightedEntryId: string | null;
  /** Whether the overlay is visible (toggle to enable/disable). */
  visible: boolean;
  /**
   * When set, overlay is rendered relative to this container (DemoApp viewport).
   * Viewport-stored rects are converted to container-relative coordinates so
   * bounding boxes align with the Demo App content. The parent must render this
   * overlay as a child of the container element.
   */
  containerRect?: { x: number; y: number; width: number; height: number } | null;
}

/** Convert viewport rect to container-relative (for overlay inside container). */
function toContainerRelative(
  viewportRect: Rect,
  containerRect: { x: number; y: number; width: number; height: number }
): Rect {
  return {
    x: viewportRect.x - containerRect.x,
    y: viewportRect.y - containerRect.y,
    width: viewportRect.width,
    height: viewportRect.height,
  };
}

function Box({
  rect,
  kind,
  opacity,
  label,
  useAbsolute,
}: Readonly<{
  rect: Rect;
  kind: 'previous' | 'current';
  opacity: number;
  label: string;
  useAbsolute: boolean;
}>) {
  return (
    <motion.div
      className={kind === 'previous' ? styles.boxPrevious : styles.boxCurrent}
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      transition={{ duration: 0.2 }}
      style={{
        left: rect.x,
        top: rect.y,
        width: Math.max(2, rect.width),
        height: Math.max(2, rect.height),
        position: useAbsolute ? 'absolute' : 'fixed',
      }}
      title={label}
      aria-hidden
    />
  );
}

/**
 * LayoutShiftOverlay
 *
 * Renders bounding boxes for each layout-shift source.
 * - When containerRect is set (Demo App): overlay is positioned inside the container
 *   (parent must render it as a child of the container). Viewport-stored rects are
 *   converted to container-relative: relX = viewportX - containerRect.x, relY = viewportY - containerRect.y.
 *   Boxes use position: absolute so they align with the Demo App content.
 * - When containerRect is not set: full-viewport overlay with position: fixed (legacy).
 */
export function LayoutShiftOverlay({
  entries,
  highlightedEntryId,
  visible,
  containerRect,
}: Readonly<LayoutShiftOverlayProps>) {
  const useAbsolute = containerRect != null;

  const items = useMemo(() => {
    const list: Array<{
      entry: LayoutShiftEntryStored;
      source: LayoutShiftSourceStored;
      sourceIndex: number;
      previousRect: Rect;
      currentRect: Rect;
    }> = [];
    for (const entry of entries) {
      entry.sources.forEach((source, sourceIndex) => {
        const previousRect =
          containerRect != null
            ? toContainerRelative(source.previousRect, containerRect)
            : source.previousRect;
        const currentRect =
          containerRect != null
            ? toContainerRelative(source.currentRect, containerRect)
            : source.currentRect;
        list.push({ entry, source, sourceIndex, previousRect, currentRect });
      });
    }
    return list;
  }, [entries, containerRect]);

  if (!visible || items.length === 0) return null;

  return (
    <div
      className={useAbsolute ? styles.overlayScoped : styles.overlay}
      aria-hidden
    >
      {items.map(({ entry, source, sourceIndex, previousRect, currentRect }) => {
        const isHighlighted =
          highlightedEntryId === null || highlightedEntryId === entry.id;
        const opacity = isHighlighted ? 1 : 0.35;
        const label = `${entry.id} · ${source.nodeLabel} (source ${sourceIndex + 1})`;

        return (
          <div key={`${entry.id}-${sourceIndex}`} className={styles.sourceWrap}>
            <Box
              rect={previousRect}
              kind="previous"
              opacity={opacity}
              label={`Previous: ${label}`}
              useAbsolute={useAbsolute}
            />
            <Box
              rect={currentRect}
              kind="current"
              opacity={opacity}
              label={`Current: ${label}`}
              useAbsolute={useAbsolute}
            />
          </div>
        );
      })}
    </div>
  );
}
