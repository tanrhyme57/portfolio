import type { ReactNode } from 'react';
import { PAPER } from './paper';
import styles from './PaperStage.module.css';

/**
 * The artboard, scaled to cover the screen like `background-size: cover`.
 * Children are positioned in fractions of the artboard.
 */
function Stage({ children }: { children: ReactNode }) {
  return (
    <div className={styles.stage} aria-hidden="true">
      {children}
    </div>
  );
}

/** The dark plaster that is revealed as the paper folds away. */
export function PaperBackdrop() {
  return (
    <Stage>
      <img className={styles.fill} src={PAPER.backdrop} alt="" decoding="async" />
    </Stage>
  );
}
