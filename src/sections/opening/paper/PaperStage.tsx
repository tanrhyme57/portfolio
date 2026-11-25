import type { CSSProperties, ReactNode } from 'react';
import { PAPER } from './paper';
import styles from './PaperStage.module.css';

/**
 * The artboard, scaled to cover the screen like `background-size: cover`.
 * Children are positioned in fractions of the artboard.
 */
function Stage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`${styles.stage} ${className ?? ''}`} aria-hidden="true">
      {children}
    </div>
  );
}

/** The dark plaster that is revealed behind the doors. */
export function PaperBackdrop() {
  return (
    <Stage>
      <img className={styles.fill} src={PAPER.backdrop} alt="" decoding="async" />
    </Stage>
  );
}

/**
 * The two halves of the folded paper. They swing open and fold up as
 * `--doors` (0..1, set by the opening timeline) goes up.
 */
export function PaperDoors() {
  return (
    <Stage className={styles.doors}>
      <Door side="left" />
      <Door side="right" />
    </Stage>
  );
}

function Door({ side }: { side: 'left' | 'right' }) {
  const { url, x, width } = PAPER[side];
  const style = { left: `${x * 100}%`, width: `${width * 100}%` } as CSSProperties;
  return <img className={`${styles.door} ${styles[side]}`} style={style} src={url} alt="" />;
}
