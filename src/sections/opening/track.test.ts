import { describe, expect, it } from 'vitest';
import { anchorOffset, splitProgress, trackLength, trackPlan, trackProgress } from './track';

const plan = trackPlan(9);

describe('splitProgress', () => {
  it('plays the opening first, then the gallery', () => {
    expect(splitProgress(0, plan)).toEqual({ opening: 0, gallery: 0 });
    const handoff = trackProgress('opening', 1, plan);
    expect(splitProgress(handoff, plan).opening).toBeCloseTo(1);
    expect(splitProgress(handoff, plan).gallery).toBeCloseTo(0);
    expect(splitProgress(1, plan)).toEqual({ opening: 1, gallery: 1 });
  });

  it('round-trips with trackProgress', () => {
    const at = trackProgress('gallery', 0.4, plan);
    expect(splitProgress(at, plan).gallery).toBeCloseTo(0.4);
  });

  it('skips the gallery when it has no scroll', () => {
    const noGallery = trackPlan(0);
    expect(splitProgress(1, noGallery)).toEqual({ opening: 1, gallery: 0 });
    expect(trackLength(noGallery)).toBeCloseTo(1 + noGallery.opening);
  });
});

describe('anchorOffset', () => {
  it('lands a jump at the requested progress', () => {
    const screens = trackLength(plan);
    // Scrolling the anchor to the top scrolls anchorOffset * screens screens,
    // and progress is that divided by the scrollable distance.
    const progress = (anchorOffset(0.85, plan) * screens) / (screens - 1);
    expect(progress).toBeCloseTo(0.85);
  });
});
