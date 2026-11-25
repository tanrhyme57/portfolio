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
    hero/            landing screen
      HeroSection.tsx      puts the layers together
      HeroText/            name, tagline, small label
      PaperBackground/     paper backdrop split into two "doors" on the fold line
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
  assets/            bot model (STL) and paper texture
public/fonts/        your own display font goes here (see its README)
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
