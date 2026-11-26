# Paperfold tools

`build.py` is the source of the Paperfold font: every glyph is drawn on a
grid where 1 unit = one stroke = one paper square.

- Rebuild the font files: `python tools/paperfold/build.py <out-dir>`
  (copy the `.woff2` to `public/fonts/`).
- Rebuild the square-by-square letter data used by the opening animation:
  `python tools/paperfold/cells.py src/sections/opening/fold/glyphCells.ts`

Both need `pip install fonttools shapely` (and `brotli` for woff2).
