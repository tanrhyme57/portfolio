import { useActiveSection } from '@/hooks/useActiveSection';
import styles from './SectionNav.module.css';

interface NavItem {
  id: string;
  label: string;
}

interface SectionNavProps {
  items: readonly NavItem[];
}

/** Small fixed nav on the right edge for jumping between sections. */
export function SectionNav({ items }: SectionNavProps) {
  const active = useActiveSection(items.map((item) => item.id));

  return (
    <nav className={styles.root} aria-label="Sections">
      <ol className={styles.list}>
        {items.map((item, index) => (
          <li key={item.id}>
            <a
              className={styles.link}
              href={`#${item.id}`}
              aria-current={item.id === active ? 'location' : undefined}
            >
              <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
              <span className={styles.label}>{item.label}</span>
              <span className={styles.tick} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
