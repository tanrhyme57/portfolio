# Portfolio

A single-scroll portfolio. The landing screen is a swarm of small bots that
drop in from the top of the screen and build a writhing column down to a
glowing orb that replaces the cursor (or follows your finger), holding it
from above.

## Run it

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install     # once, downloads the libraries
npm run dev     # starts the site at http://localhost:5173 and reloads on save
```

Other scripts:

| Command           | What it does                                    |
| ----------------- | ----------------------------------------------- |
| `npm run build`   | Type-checks and builds the site into `dist/`    |
| `npm run preview` | Serves the built site locally                   |
| `npm test`        | Runs the unit tests (swarm maths, layout maths) |
| `npm run lint`    | Checks code for mistakes                        |
| `npm run format`  | Formats every file with Prettier                |

## Stack

Vite, React 19, TypeScript (strict), three.js through `@react-three/fiber`,
CSS Modules, Vitest.

## Where things live

```
src/
  config/            content you edit: name, tagline, section list
  styles/            design tokens (colours, fonts, spacing), fonts, base CSS
  hooks/             small reusable React hooks (media queries, in-view, etc.)
  lib/               plain helper functions, no React
  components/        shared UI: Section wrapper, SectionNav (side nav)
  sections/
    opening/         the scroll-driven opening: hero → paper opens → "experience" + stats
      OpeningSequence.tsx  puts the layers together, turns scroll into CSS variables
      timeline.ts          when each part happens (ranges of scroll progress)
      track.ts             how the opening and the gallery share one scroll track
      paper/               the artwork layers (plaster backdrop, paper halves)
      fold/                the paper squares folding into "experience" (choreography.ts = the maths)
      experience/          the stats sheet
    gallery/         after the stats: the black hallway past "experience", stairs and illusion room (greybox)
      dimensions.ts        every size and position in metres; tune the blockout here
      beats.ts             when each camera move and hold happens
      handoff.ts           plaster fades, stats sheet falls, word pinned into the 3D hallway (no three.js)
      cameraPath.ts        the camera's walk, scrubbed by scroll (pure maths, tested)
      illusion.ts          forced perspective: the flat "projects" drawing, scattered in depth
      scene/               the boxes: hallway, stairs, illusion pieces, room
    projects/        the plain "All projects" list (always there, also the no-3D fallback)
    hero/            what is on the first screen
      HeroText/            name, tagline, small label
      ScrollCue/           "scroll to open" hint on the fold line
      swarm/               the bots
        config.ts          every tunable number (counts, speeds, glitch)
        formation.ts       where each bot should be (pure maths, tested)
        simulation.ts      springs that move bots there (pure maths, tested)
        glitch.ts          glitch bursts
        idlePath.ts        where the swarm wanders when nobody points
        usePointerTracker  mouse and touch input
        useBotGeometry     loads the bot model
        Swarm.tsx          connects all of the above to one instanced mesh
        SwarmCanvas.tsx    the 3D canvas, lights, camera
    placeholder/     stand-ins for sections not built yet
  assets/            bot model (STL) and the opening artwork layers
public/fonts/        Paperfold, and your own display font (see its README)
tools/paperfold/     Paperfold font source and the letter-to-squares generator
```

The rule of thumb: maths and logic go in plain `.ts` files that know nothing
about React, so they can be tested; components only wire things together.

## Changing things

- **Name / tagline:** `src/config/site.ts` (set `tagline: null` to hide it).
- **Colours:** `src/styles/tokens.css`. Each section has its own
  `[data-palette]` block, and the bot colours (`--swarm-*`) are there too.
- **Fonts:** all in `src/styles/fonts.css` plus the `--font-*` tokens. Your own
  display font goes in `public/fonts/` (see its README).
- **Bot model:** replace `src/assets/models/bot.stl` (keep it low-poly).
- **Swarm feel:** `src/sections/hero/swarm/config.ts`.
- **Opening timing:** `src/sections/opening/timeline.ts`.
- **Stats:** `src/config/stats.ts` (placeholders for now).
- **Projects:** `src/config/projects.ts` (placeholders; the first six hang in the gallery).
- **Gallery timing / layout:** `src/sections/gallery/beats.ts` and `dimensions.ts`.
