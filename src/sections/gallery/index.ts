import { lazy } from 'react';

/** Code-split: three.js and the scene only download as the stats sheet comes in. */
export const GalleryCanvas = lazy(() => import('./GalleryCanvas'));
export { BEATS } from './beats';
export { cameraZAt, sheetFall, wordView } from './handoff';
