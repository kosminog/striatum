# From raster to vector

## Redraw, do not trace

Open the winning PNG as a locked, dimmed layer in a vector tool (Illustrator,
Affinity Designer, Figma, Inkscape). Draw the mark over it with primitives and
boolean operations: circles, rectangles, straight segments, and as few Bézier
curves as the form allows. Delete the raster layer. A simple mark should need
fewer than 60 anchor points; a geometric one often fewer than 20.

Autotrace is acceptable only as a measurement aid, to read proportions off the
sketch. Never ship its output.

## Fix what the model got wrong

- Snap to a grid (an 8 or 12 unit grid on a 96 or 144 unit artboard works).
- Equalise stroke weights; the model varies them.
- True up symmetry; the model's symmetry is approximate.
- Correct optical alignment: circles and points need to overshoot the baseline
  and cap height slightly to look aligned. Trust the eye over the ruler for this.
- Open or close counters so they survive at 16 px: minimum gap about 1/12 of the
  mark's height.

## Set the wordmark

1. Choose a typeface against the brand profile's voice adjectives. Check the
   licence covers logo use.
2. Set the name in the exact casing from the profile.
3. Kern by eye at large size; then check at 12 px.
4. If a letter is modified to carry the device, convert to outlines and edit the
   path; keep the untouched version too.

## Build the system

Artboards, each exported as SVG and PNG at 1x and 2x:

- `primary` horizontal lockup
- `stacked` lockup
- `symbol`
- `wordmark`
- each of the above in `mono-black`, `mono-white` (reversed), and brand colour if
  defined
- `app-icon` on a rounded square at 1024 px, plus a maskable variant with extra margin
- `favicon` simplified version if the symbol needs it at 16 px

Define clear space as a multiple of a mark feature (the dot's diameter, the x-height).
State minimum sizes: symbol alone, and lockup, in px and mm.

## File naming

```
<brand>-logo-<variant>-<colour>.<ext>
acme-logo-primary-black.svg
acme-logo-symbol-white.svg
acme-logo-appicon-1024.png
```

## SVG hygiene

- Outline all text. No live fonts in the file.
- Remove hidden layers, clipping masks, and metadata.
- Set `viewBox`, drop fixed `width`/`height`.
- Single colour masks use `currentColor` so they can be recoloured in CSS.
- Run through an optimiser (svgo or equivalent) and inspect the result.

## Record provenance

In the brief: the round, prompt, model, seed and file that produced the sketch; the
date of the reverse image search and its result; who redrew it; the typeface and
its licence. This is what you will need when someone asks "where did this come from".
