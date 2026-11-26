import type { CSSProperties } from 'react';
import type { Stat } from '@/config/stats';
import { PAPER } from '../paper';
import styles from './StatsSheet.module.css';

interface StatsSheetProps {
  stats: readonly Stat[];
}

/** The big sheet of paper under the word, holding the numbers. Slides up as `--stats` goes 0..1, later swings and falls with `--sheet-angle` and `--sheet-drop`. */
export function StatsSheet({ stats }: StatsSheetProps) {
  return (
    <div className={styles.sheet} style={{ '--paper': `url(${PAPER.light})` } as CSSProperties}>
      <dl className={styles.grid}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <dt className={styles.label}>{stat.label}</dt>
            <dd className={styles.value}>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
