# Fonts

Only the display font (the big name) lives here, and only once you have one.
Saira and Pinyon Script are installed from npm, so there is nothing to add
for them.

To use your own display font, export it and save it here as:

`display.woff2`

then uncomment the `@font-face` block in `src/styles/fonts.css`. Until then
the name uses a stand-in.
To convert `.otf`/`.ttf` to `.woff2` you can use any font converter
(for example https://cloudconvert.com/otf-to-woff2).

Font names and fallbacks are set in `src/styles/fonts.css` and the
`--font-*` tokens in `src/styles/tokens.css`.
