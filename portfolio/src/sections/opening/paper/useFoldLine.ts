import type { RefObject } from 'react';
import { useElementSize } from '@/hooks/useElementSize';
import { coverLineX } from '@/lib/coverFit';
import { ARTBOARD, PAPER } from './paper';

/**
 * CSS length for where the fold line lands inside `ref`, which shows the
 * artboard full-bleed (like `cover`). Put it on a parent as `--seam-x` so
 * anything aligned to the fold can use it.
 */
export function useFoldLine(ref: RefObject<Element | null>): string {
  const size = useElementSize(ref);
  if (size.width === 0) return `${PAPER.foldU * 100}%`;
  return `${coverLineX(size, ARTBOARD, PAPER.foldU)}px`;
}
