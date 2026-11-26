import type { Color } from 'three';
import { readCssColor } from '@/lib/cssColor';

/** Swarm colours. They come from CSS tokens so the palette is edited in one place. */
export interface SwarmColors {
  bot: Color;
  glitch: Color;
  flicker: Color;
}

export function readSwarmColors(element: Element): SwarmColors {
  return {
    bot: readCssColor(element, '--swarm-bot', '#141414'),
    glitch: readCssColor(element, '--swarm-glitch', '#ff4a2b'),
    flicker: readCssColor(element, '--swarm-flicker', '#efe9dc'),
  };
}
