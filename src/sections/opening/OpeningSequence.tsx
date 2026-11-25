import { Suspense, useCallback, useRef, type CSSProperties } from 'react';
import { stats } from '@/config/stats';
import { site } from '@/config/site';
import { useInView } from '@/hooks/useInView';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { HeroText, ScrollCue, SwarmCanvas } from '@/sections/hero';
import { ExperienceWord, StatsSheet } from './experience';
import { PaperBackdrop, PaperDoors, useFoldLine } from './paper';
import { anchorOffset, SWARM_HIDDEN_AT, TIMELINE, timelineVars } from './timeline';
import styles from './OpeningSequence.module.css';

/**
 * The first two "sections" as one scroll-driven scene: the hero (name and
 * bot swarm on folded paper), then the paper opens along its fold, folds up
 * into "experience", and the stats sheet slides up underneath.
 *
 * A tall track scrolls past a sticky, screen-sized stage. Scroll progress is
 * turned into CSS variables (see timeline.ts) and every layer animates from
 * those in CSS, so scrolling never re-renders React.
 *
 * Back to front: plaster backdrop → word + stats → paper doors → name → bots → cue.
 */
export function OpeningSequence() {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const seamX = useFoldLine(stage);

  const applyProgress = useCallback((progress: number) => {
    const element = stage.current;
    if (!element) return;
    for (const [name, value] of Object.entries(timelineVars(progress))) {
      element.style.setProperty(name, value);
    }
  }, []);
  const swarmGone = useScrollProgress(track, applyProgress, SWARM_HIDDEN_AT);
  const trackInView = useInView(track);

  const trackStyle = { '--length': TIMELINE.length } as CSSProperties;
  const statsAt = `${anchorOffset(TIMELINE.statsAnchor) * 100}%`;
  const homeAnchorStyle = { height: statsAt } as CSSProperties;
  const statsAnchorStyle = { top: statsAt } as CSSProperties;

  return (
    <div ref={track} className={styles.track} style={trackStyle} data-palette="hero">
      {/* Targets for the side nav. */}
      <section id="home" className={styles.anchor} style={homeAnchorStyle} aria-label="Home" />
      <section
        id="stats"
        className={`${styles.anchor} ${styles.statsAnchor}`}
        style={statsAnchorStyle}
      >
        <h2 className="visually-hidden">Stats</h2>
      </section>

      <div ref={stage} className={styles.stage} style={{ '--seam-x': seamX } as CSSProperties}>
        <PaperBackdrop />
        <div className={styles.reveal}>
          <ExperienceWord word={site.revealWord} />
          <StatsSheet stats={stats} />
        </div>
        <PaperDoors />
        <div className={styles.hero}>
          <HeroText />
          <Suspense fallback={null}>
            <SwarmCanvas active={trackInView && !swarmGone} />
          </Suspense>
          <ScrollCue targetId="stats" />
        </div>
      </div>
    </div>
  );
}
