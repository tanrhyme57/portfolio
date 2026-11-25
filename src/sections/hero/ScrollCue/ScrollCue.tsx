import styles from './ScrollCue.module.css';

interface ScrollCueProps {
  /** Id of the section the cue scrolls to. */
  targetId: string;
}

/** Small "scroll" hint sitting on the fold line, where the page will open. */
export function ScrollCue({ targetId }: ScrollCueProps) {
  return (
    <a className={styles.root} href={`#${targetId}`}>
      <span className={styles.label}>Scroll to open</span>
      <span className={styles.line} aria-hidden="true" />
    </a>
  );
}
