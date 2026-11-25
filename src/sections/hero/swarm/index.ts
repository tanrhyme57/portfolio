import { lazy } from 'react';

/** Code-split: three.js only downloads once the page itself is on screen. */
export const SwarmCanvas = lazy(() => import('./SwarmCanvas'));
export type { SwarmConfig } from './config';
