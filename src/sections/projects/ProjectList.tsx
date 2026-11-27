import { Section } from '@/components/Section';
import type { Project } from '@/config/projects';
import styles from './ProjectList.module.css';

interface ProjectListProps {
  id: string;
  projects: readonly Project[];
}

/**
 * Every project as plain HTML: the real content behind the gallery, and the
 * only view when the 3D walk is skipped.
 */
export function ProjectList({ id, projects }: ProjectListProps) {
  return (
    <Section id={id} className={styles.root} palette="hero" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className={styles.title}>
        All projects
      </h2>
      <ol className={styles.list}>
        {projects.map((project) => (
          <li key={project.id}>
            <article className={styles.card}>
              {project.image && (
                <img className={styles.image} src={project.image} alt="" loading="lazy" />
              )}
              <p className={styles.meta}>
                {project.year} · {project.kind}
              </p>
              <h3 className={styles.name}>{project.title}</h3>
              <p className={styles.summary}>{project.summary}</p>
              {project.tags.length > 0 && (
                <ul className={styles.tags}>
                  {project.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              )}
              {project.links.length > 0 && (
                <p className={styles.links}>
                  {project.links.map((link) => (
                    <a key={link.href} href={link.href}>
                      {link.label}
                    </a>
                  ))}
                </p>
              )}
            </article>
          </li>
        ))}
      </ol>
      <p className={styles.credits}>
        Gallery frame:{' '}
        <a href="https://sketchfab.com/3d-models/picture-frame-1806fe6b8d96461887f21ec3cb9c4878">
          “Picture Frame”
        </a>{' '}
        by Olivia Bultinck, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
      </p>
    </Section>
  );
}
