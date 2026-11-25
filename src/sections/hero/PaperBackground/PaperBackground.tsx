import type { CSSProperties } from 'react';
import { PAPER } from './paper';
import styles from './PaperBackground.module.css';

interface PaperBackgroundProps {
  /**
   * 0 = closed, 1 = fully open. The two halves slide apart along the fold
   * line to reveal what is behind. Driven by scroll in the next step.
   */
  openness?: number;
}

/**
 * The folded paper backdrop, built as two "doors" that meet exactly on the
 * fold line drawn in the image. Expects `--seam-x` from a parent (see `useFoldLine`).
 */
export function PaperBackground({ openness = 0 }: PaperBackgroundProps) {
  const style = {
    '--paper-image': `url(${PAPER.url})`,
    '--openness': openness,
  } as CSSProperties;

  return (
    <div className={styles.root} style={style} aria-hidden="true">
      <div className={`${styles.door} ${styles.left}`} />
      <div className={`${styles.door} ${styles.right}`} />
    </div>
  );
}
