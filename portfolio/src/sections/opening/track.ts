import { phase } from '@/lib/scrollProgress';
import { TIMELINE } from './timeline';

/**
 * The opening and the gallery after it share one tall scroll track with one
 * sticky stage, so the stats sheet never unmounts on its way into the
 * painting. This module shares the track's scroll out between the two.
 */
export interface TrackPlan {
  /** Screen heights of scrolling for each part. A gallery of 0 skips it. */
  opening: number;
  gallery: number;
}

export type TrackPart = keyof TrackPlan;

export function trackPlan(galleryScreens: number): TrackPlan {
  return { opening: TIMELINE.scroll, gallery: Math.max(0, galleryScreens) };
}

const scrollOf = (plan: TrackPlan) => plan.opening + plan.gallery;

/** Height of the track in screen heights: the first screen plus all the scrolling. */
export function trackLength(plan: TrackPlan): number {
  return 1 + scrollOf(plan);
}

/** Each part's own 0..1 progress at the given progress through the whole track. */
export function splitProgress(progress: number, plan: TrackPlan): Record<TrackPart, number> {
  const scrolled = progress * scrollOf(plan);
  return {
    opening: phase(scrolled, [0, plan.opening]),
    gallery: plan.gallery > 0 ? phase(scrolled, [plan.opening, scrollOf(plan)]) : 0,
  };
}

/** Progress through the whole track at which `part` reaches its own `local` progress. */
export function trackProgress(part: TrackPart, local: number, plan: TrackPlan): number {
  const start = part === 'opening' ? 0 : plan.opening;
  return (start + local * plan[part]) / scrollOf(plan);
}

/**
 * Where to put a scroll target so that jumping to it (its top at the top of
 * the screen) lands at track `progress`, as a share of the track's height.
 */
export function anchorOffset(progress: number, plan: TrackPlan): number {
  return (progress * scrollOf(plan)) / trackLength(plan);
}
