import { Color } from 'three';

/** Swarm colours. They come from CSS tokens so the palette is edited in one place. */
export interface SwarmColors {
  bot: Color;
  glitch: Color;
  flicker: Color;
}

/** Reads a colour custom property as it applies to `element` (tokens inherit). */
export function readCssColor(element: Element, token: string, fallback: string): Color {
  const value = getComputedStyle(element).getPropertyValue(token).trim();
  return new Color(value || fallback);
}

export function readSwarmColors(element: Element): SwarmColors {
  return {
    bot: readCssColor(element, '--swarm-bot', '#141414'),
    glitch: readCssColor(element, '--swarm-glitch', '#ff4a2b'),
    flicker: readCssColor(element, '--swarm-flicker', '#efe9dc'),
  };
}
