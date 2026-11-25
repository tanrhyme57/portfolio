import type { RefObject } from 'react';
import { useElementSize } from '@/hooks/useElementSize';
import { coverLineX } from '@/lib/coverFit';
import { PAPER } from './paper';

/**
 * CSS length for where the paper's fold line lands inside `ref`, which
 * draws the paper full-bleed with `cover`. Put it on a parent as `--seam-x`
 * so the background doors and anything aligned to the fold share it.
 */
export function useFoldLine(ref: RefObject<Element | null>): string {
  const size = useElementSize(ref);
  if (size.width === 0) return `${PAPER.foldU * 100}%`;
  return `${coverLineX(size, PAPER, PAPER.foldU)}px`;
}
