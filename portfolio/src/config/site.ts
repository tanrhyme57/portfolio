/**
 * Site-wide content. Edit text here, not inside components.
 */
export interface SiteContent {
  /** Name shown big in the hero (Botch), one word per line. */
  name: string;
  /** Short script line under the name (Oneheart). Set to `null` to hide it. */
  tagline: string | null;
  /** Tiny label in the hero corner (Saira). */
  kicker: string;
}

export const site: SiteContent = {
  name: 'Franciszek Adamski',
  tagline: 'Interactive portfolio',
  kicker: 'Portfolio — 2026',
};
