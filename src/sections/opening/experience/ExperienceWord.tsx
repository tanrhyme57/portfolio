import type { CSSProperties } from 'react';
import { PAPER } from '../paper';
import styles from './ExperienceWord.module.css';

interface ExperienceWordProps {
  word: string;
}

/**
 * The word the paper folds into: each letter is cut from the same paper and
 * folds up from the bottom, one after another, as `--word` goes 0..1.
 */
export function ExperienceWord({ word }: ExperienceWordProps) {
  const letters = [...word];
  const style = {
    '--paper': `url(${PAPER.light})`,
    '--letters': letters.length,
  } as CSSProperties;

  return (
    <h2 className={styles.word} style={style} aria-label={word}>
      {letters.map((letter, index) => (
        <span
          key={index}
          className={styles.letter}
          style={{ '--i': index } as CSSProperties}
          aria-hidden="true"
        >
          {letter}
        </span>
      ))}
    </h2>
  );
}
