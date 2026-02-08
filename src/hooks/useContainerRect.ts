import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Returns the bounding rect of the container element, updated on resize and scroll.
 * Used to convert viewport coordinates to container-relative for the layout-shift overlay.
 */
export function useContainerRect(containerRef: RefObject<HTMLElement | null>): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      setRect(null);
      return;
    }

    const update = () => {
      const r = el.getBoundingClientRect();
      setRect({ x: r.x, y: r.y, width: r.width, height: r.height });
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener('scroll', update, true);

    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', update, true);
    };
  }, [containerRef]);

  return rect;
}
