/**
 * Site-wide content. Edit text here, not inside components.
 */
export interface SiteContent {
  /** Name shown big in the hero (display font), one word per line. */
  name: string;
  /** Short line under the name, in the nav font. Set to `null` to hide it. */
  tagline: string | null;
  /** Tiny label in the hero corner (Saira). */
  kicker: string;
  /** Word the paper folds into when the page opens (Paperfold font, lowercase). */
  revealWord: string;
}

export const site: SiteContent = {
  name: 'Franciszek Adamski',
  tagline: 'Intentive portfolio',
  kicker: 'Portfolio — 2026',
  revealWord: 'experience',
};
