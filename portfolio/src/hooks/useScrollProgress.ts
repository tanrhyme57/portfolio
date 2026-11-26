import { useEffect, useRef, useState, type RefObject } from 'react';
import { scrollProgress } from '@/lib/scrollProgress';

/**
 * Tracks how far `ref` (a tall element with a sticky child) has been
 * scrolled through, 0..1, and calls `onProgress` once per animation frame
 * while it changes. Nothing re-renders: write the value to CSS variables or
 * refs in the callback.
 *
 * Returns how many of `thresholds` progress has passed, which does
 * re-render, but only when that count changes.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress: (progress: number) => void,
  thresholds: readonly number[] = [],
): number {
  const [passed, setPassed] = useState(0);
  const callback = useRef(onProgress);
  const key = thresholds.join(',');

  useEffect(() => {
    callback.current = onProgress;
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const marks = key ? key.split(',').map(Number) : [];
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const progress = scrollProgress(rect.top, rect.height, window.innerHeight);
      callback.current(progress);
      setPassed(marks.filter((mark) => progress >= mark).length);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [ref, key]);

  return passed;
}
