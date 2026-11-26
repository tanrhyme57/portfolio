import { Suspense, useCallback, useMemo, useRef, type CSSProperties } from 'react';
import { site } from '@/config/site';
import { stats } from '@/config/stats';
import { useInView } from '@/hooks/useInView';
import { useMediaQuery, usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { phase } from '@/lib/scrollProgress';
import {
  backdropOpacity,
  BEATS,
  cameraZAt,
  GalleryCanvas,
  sheetFall,
  wordView,
} from '@/sections/gallery';
import { HeroText, ScrollCue, SwarmCanvas } from '@/sections/hero';
import { StatsSheet } from './experience';
import { FoldingPaper, type FoldingPaperHandle } from './fold';
import { PaperBackdrop, useFoldLine } from './paper';
import { SWARM_HIDDEN_AT, TIMELINE, timelineVars } from './timeline';
import { anchorOffset, splitProgress, trackLength, trackPlan, trackProgress } from './track';
import styles from './OpeningSequence.module.css';

/** Screen heights of scrolling through the gallery (0 skips it). */
const GALLERY_SCREENS = { landscape: 9, portrait: 7 };
/** Opening progress at which the gallery starts loading, well before it is needed. */
const GALLERY_PRELOAD_AT = 0.6;

interface OpeningSequenceProps {
  /** Where "Skip to list" in the gallery jumps to. */
  projectListId: string;
}

/**
 * Home, stats and the projects gallery as one scroll-driven scene on one
 * sticky stage.
 *
 * Opening: the hero (name and bot swarm on folded paper), then the paper
 * folds square by square into "experience" and the stats sheet slides up.
 * Gallery: the plaster fades to black and the stats sheet falls away,
 * leaving "experience" hanging in a dark hallway. The camera walks past it
 * to the stairs and down into the forced-perspective room.
 *
 * Scroll progress is turned into CSS variables and refs (see timeline.ts,
 * track.ts and the gallery's beats.ts), so scrolling never re-renders React.
 *
 * Back to front: 3D gallery → opening art (plaster, stats, paper squares,
 * pinned into the hallway once the gallery starts) → name → bots → cue.
 */
export function OpeningSequence({ projectListId }: OpeningSequenceProps) {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const painting = useRef<HTMLDivElement>(null);
  const seamX = useFoldLine(stage);
  const paper = useRef<FoldingPaperHandle>(null);
  const swarmLift = useRef(0);
  const galleryProgress = useRef(0);
  const galleryInvalidate = useRef<(() => void) | null>(null);

  const reducedMotion = usePrefersReducedMotion();
  const portrait = useMediaQuery('(orientation: portrait)');
  const plan = useMemo(
    () => trackPlan(reducedMotion ? 0 : GALLERY_SCREENS[portrait ? 'portrait' : 'landscape']),
    [reducedMotion, portrait],
  );
  const hasGallery = plan.gallery > 0;

  const applyProgress = useCallback(
    (progress: number) => {
      const element = stage.current;
      if (!element) return;
      const { opening, gallery } = splitProgress(progress, plan);

      for (const [name, value] of Object.entries(timelineVars(opening))) {
        element.style.setProperty(name, value);
      }
      paper.current?.update(phase(opening, TIMELINE.fold));
      swarmLift.current = phase(opening, TIMELINE.swarmUp);

      if (!hasGallery) return;
      const sheet = sheetFall(gallery);
      element.style.setProperty('--backdrop', backdropOpacity(gallery).toFixed(4));
      element.style.setProperty('--sheet-angle', `${sheet.angle.toFixed(2)}deg`);
      element.style.setProperty('--sheet-drop', `${(sheet.drop * 100).toFixed(2)}svh`);

      const word = wordView(cameraZAt(gallery), element.clientHeight, gallery);
      const layer = painting.current;
      if (layer) {
        element.style.perspective = `${word.perspective}px`;
        layer.style.transform =
          word.translateY || word.translateZ
            ? `translate3d(0, ${word.translateY}px, ${word.translateZ}px)`
            : '';
        layer.style.opacity = String(word.opacity);
        layer.style.visibility = word.opacity > 0 ? '' : 'hidden';
      }
      element.dataset.room = gallery >= BEATS.descend[1] ? 'in' : 'out';
      galleryProgress.current = gallery;
      galleryInvalidate.current?.();
    },
    [plan, hasGallery],
  );

  const thresholds = useMemo(
    () => [
      trackProgress('opening', SWARM_HIDDEN_AT, plan),
      trackProgress('opening', GALLERY_PRELOAD_AT, plan),
    ],
    [plan],
  );
  const passed = useScrollProgress(track, applyProgress, thresholds);
  const swarmGone = passed >= 1;
  const galleryNear = hasGallery && passed >= 2;
  const trackInView = useInView(track);

  // Side-nav targets laid over the track.
  const statsAt = anchorOffset(trackProgress('opening', TIMELINE.statsAnchor, plan), plan);
  const projectsAt = hasGallery
    ? anchorOffset(trackProgress('gallery', BEATS.room[0], plan), plan)
    : 1;
  const percent = (share: number) => `${share * 100}%`;

  return (
    <div
      ref={track}
      className={styles.track}
      style={{ '--length': trackLength(plan) } as CSSProperties}
      data-palette="hero"
    >
      <section
        id="home"
        className={styles.anchor}
        style={{ top: 0, height: percent(statsAt) }}
        aria-label="Home"
      />
      <section
        id="stats"
        className={styles.anchor}
        style={{ top: percent(statsAt), height: percent(projectsAt - statsAt) }}
      >
        <h2 className="visually-hidden">Stats</h2>
      </section>
      {hasGallery && (
        <section
          id="projects"
          className={styles.anchor}
          style={{ top: percent(projectsAt), bottom: 0 }}
          aria-label="Projects gallery"
        />
      )}

      <div
        ref={stage}
        className={styles.stage}
        style={{ '--seam-x': seamX } as CSSProperties}
        // The orb replaces the mouse while the bots are out; after that the torn-paper cursor.
        data-cursor={swarmGone ? 'scrap' : 'orb'}
        data-room="out"
      >
        {galleryNear && (
          <Suspense fallback={null}>
            <GalleryCanvas
              active={trackInView}
              progress={galleryProgress}
              invalidateRef={galleryInvalidate}
            />
          </Suspense>
        )}
        <div ref={painting} className={styles.painting}>
          <div className={styles.backdrop}>
            <PaperBackdrop />
          </div>
          <div className={styles.reveal}>
            <h2 className="visually-hidden">{site.revealWord}</h2>
            <StatsSheet stats={stats} />
          </div>
          <FoldingPaper ref={paper} word={site.revealWord} />
        </div>
        <div className={styles.name}>
          <HeroText />
        </div>
        <div className={styles.swarm}>
          <Suspense fallback={null}>
            <SwarmCanvas active={trackInView && !swarmGone} lift={swarmLift} />
          </Suspense>
        </div>
        <div className={styles.cue}>
          <ScrollCue targetId="stats" />
        </div>
        {hasGallery && (
          <a className={styles.skip} href={`#${projectListId}`}>
            Skip to list
          </a>
        )}
      </div>
    </div>
  );
}
