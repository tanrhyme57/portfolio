import { Color } from 'three';

/** Reads a colour custom property as it applies to `element` (tokens inherit). */
export function readCssColor(element: Element, token: string, fallback: string): Color {
  const value = getComputedStyle(element).getPropertyValue(token).trim();
  return new Color(value || fallback);
}
