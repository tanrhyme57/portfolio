/**
 * Order of the single-scroll page. The side nav and the page layout
 * both read from this list, so adding a section is a one-line change here
 * plus its component in `App.tsx`.
 */
export const sections = [
  { id: 'home', label: 'Home' },
  { id: 'stats', label: 'Stats' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
] as const;

export type SectionId = (typeof sections)[number]['id'];
