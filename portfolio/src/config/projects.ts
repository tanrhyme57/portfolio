/**
 * Projects, shown both on the gallery walls (first six, in order) and in the
 * plain list after it. PLACEHOLDERS: replace with the real ones.
 */
export interface Project {
  /** Stable id; a slot in the modelled gallery names the project it shows. */
  id: string;
  title: string;
  kind: 'code' | 'robotics';
  year: number;
  summary: string;
  tags: string[];
  /** 1600 × 1000 WebP in public/projects/. */
  image?: string;
  /** Short muted loop, played while the camera holds in front of it. */
  video?: string;
  links: { label: string; href: string }[];
}

export const projects: Project[] = Array.from({ length: 6 }, (_, i) => ({
  id: `project-${i + 1}`,
  title: `Project ${String(i + 1).padStart(2, '0')}`,
  kind: i % 2 === 0 ? 'robotics' : 'code',
  year: 2026,
  summary: 'Placeholder: what it is and what you did, in one line.',
  tags: ['placeholder'],
  links: [],
}));
