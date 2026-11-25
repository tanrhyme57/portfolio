import { Section } from '@/components/Section';
import styles from './PlaceholderSection.module.css';

interface PlaceholderSectionProps {
  id: string;
  title: string;
}

/** Stand-in for sections we have not designed yet, so the scroll and nav can be tested. */
export function PlaceholderSection({ id, title }: PlaceholderSectionProps) {
  return (
    <Section id={id} className={styles.root}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.note}>Coming next</p>
    </Section>
  );
}
