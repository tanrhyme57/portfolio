import { useEffect, useRef, type RefObject } from 'react';

export type PointerKind = 'mouse' | 'touch';

export interface PointerSnapshot {
  clientX: number;
  clientY: number;
  kind: PointerKind;
  /** Mouse is over the page, or a finger is down. */
  engaged: boolean;
  /** `performance.now()` in seconds when it last stopped being engaged. */
  releasedAt: number;
}

const nowSeconds = () => performance.now() / 1000;

/**
 * Tracks the mouse or a finger anywhere on the page without causing renders.
 * Read `.current` inside an animation frame.
 *
 * Touch uses passive touch events instead of pointer events, so the bots keep
 * following the finger while the page scrolls under it.
 */
export function usePointerTracker(): RefObject<PointerSnapshot> {
  const pointer = useRef<PointerSnapshot>({
    clientX: 0,
    clientY: 0,
    kind: 'mouse',
    engaged: false,
    releasedAt: -Infinity,
  });

  useEffect(() => {
    const state = pointer.current;

    const release = () => {
      if (!state.engaged) return;
      state.engaged = false;
      state.releasedAt = nowSeconds();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      state.kind = 'mouse';
      state.clientX = event.clientX;
      state.clientY = event.clientY;
      state.engaged = true;
    };

    const onTouch = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return release();
      state.kind = 'touch';
      state.clientX = touch.clientX;
      state.clientY = touch.clientY;
      state.engaged = true;
    };

    const onMouseOut = (event: MouseEvent) => {
      // `relatedTarget` is null when the mouse leaves the window.
      if (event.relatedTarget === null) release();
    };

    const passive = { passive: true } as const;
    window.addEventListener('pointermove', onPointerMove, passive);
    window.addEventListener('touchstart', onTouch, passive);
    window.addEventListener('touchmove', onTouch, passive);
    window.addEventListener('touchend', onTouch, passive);
    window.addEventListener('touchcancel', onTouch, passive);
    document.addEventListener('mouseout', onMouseOut);
    window.addEventListener('blur', release);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchend', onTouch);
      window.removeEventListener('touchcancel', onTouch);
      document.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('blur', release);
    };
  }, []);

  return pointer;
}

export function secondsSince(timestamp: number): number {
  return nowSeconds() - timestamp;
}
