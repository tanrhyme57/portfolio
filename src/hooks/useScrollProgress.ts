import { useEffect, useRef, useState, type RefObject } from 'react';
import { scrollProgress } from '@/lib/scrollProgress';

/**
 * Tracks how far `ref` (a tall element with a sticky child) has been
 * scrolled through, 0..1, and calls `onProgress` once per animation frame
 * while it changes. Nothing re-renders: write the value to CSS variables or
 * refs in the callback.
 *
 * Returns whether progress has passed `threshold`, which does re-render, but
 * only when it flips.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress: (progress: number) => void,
  threshold = 1,
): boolean {
  const [past, setPast] = useState(false);
  const callback = useRef(onProgress);

  useEffect(() => {
    callback.current = onProgress;
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const progress = scrollProgress(rect.top, rect.height, window.innerHeight);
      callback.current(progress);
      setPast(progress >= threshold);
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
  }, [ref, threshold]);

  return past;
}
