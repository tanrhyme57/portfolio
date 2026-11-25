import { site } from '@/config/site';
import styles from './HeroText.module.css';

/** Name, tagline and the small labels. Content comes from `config/site.ts`. */
export function HeroText() {
  return (
    <div className={styles.root}>
      <p className={styles.kicker}>{site.kicker}</p>
      <h1 className={styles.name}>
        {site.name.split(' ').map((word) => (
          <span key={word} className={styles.word}>
            {word}
          </span>
        ))}
      </h1>
      {site.tagline && <p className={styles.tagline}>{site.tagline}</p>}
    </div>
  );
}
