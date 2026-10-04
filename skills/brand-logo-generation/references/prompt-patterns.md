# Prompt patterns for logo generation

## Base scaffold

Fill every bracket from the brief. Omit nothing; vagueness is where generic comes from.

```
Flat vector logo mark, black on white.
Subject: [the visual device, described as shapes, not as a concept]
  e.g. "a single filled circle sitting on a short horizontal bar"
  not  "a symbol representing punctuality"
Form: [geometric | humanist | monoline | solid | negative-space], [stroke weight if monoline]
Composition: [centred | left-aligned | symbol only | symbol above wordmark area]
Constraints: no letters, no text, no gradients, no shadows, no 3D, no outline glow,
  no background shape, wide margin, single mark only.
Avoid: [competitor motifs], [literal pun], [category clichés from the brief]
```

Describe shapes, not meanings. The model cannot draw "trust"; it can draw "two
overlapping rounded squares offset by half their width".

## Form family vocabulary

Use these words deliberately; each pulls the model toward a recognisable family.

| Family | Words that work | What you get |
|--------|-----------------|--------------|
| Geometric | geometric, circle, square, equilateral, grid-based, hard corners | Bauhaus-adjacent, scales well, risks being anonymous |
| Humanist | hand-drawn, slightly irregular, brush, organic curve, single stroke | Warmer, harder to systemise |
| Monoline | monoline, uniform stroke, 8 px stroke, rounded caps, continuous line | Friendly, breaks at small size if detailed |
| Solid | solid fill, silhouette, heavy, bold, no interior detail | Best at 16 px |
| Negative space | negative space, counter-form, figure-ground, cut-out | Memorable when it works, often unreadable small |
| Letterform | monogram, single letter, ligature, custom letterform | Needs manual redraw; model lettering is unreliable |

## Composition variables

Vary one per round: scale of device within frame, symmetry, orientation, number of
elements (one is almost always right), relationship to an implied baseline, and
whether the mark sits inside a container (avoid containers unless it is an app icon).

## Negative prompting

Models differ in how they take exclusions. Where a negative prompt field exists, put
the category clichés there. Where it does not, add "avoid" to the main prompt and
repeat the hard constraints at the end; recency matters.

Standard avoid list for most categories: swoosh, globe, orbit, lightbulb, rocket,
handshake, shield, checkmark, arrow, leaf, gradient, 3D, glossy, mascot, text.

## Model families

Generic notes; verify against the current version of whatever you are using.

- **Diffusion models with style presets** (Midjourney, Flux, SD): respond to
  "flat vector" and "black on white" well; drift toward decoration at high
  stylisation settings. Turn stylisation down. Use seeds to hold a direction while
  varying one word.
- **Models with strong text rendering** (Ideogram, Recraft, newer DALL-E/Imagen):
  tempting for wordmarks; still redraw. Useful for seeing letterform ideas quickly.
- **Vector-native outputs** (Recraft vector mode and similar): cleaner paths than
  autotrace but still need manual simplification and a real typeface.
- **Reference or style images**: feed the competitive set as negative references
  where supported, or as "not like this" context. Never feed a competitor as a
  positive reference.

## Prompt diff format

When moving to the next round, write the change as a diff so it is reviewable:

```
Round 3 (from round 2 winner, seed 4471):
- "uniform 6 px stroke"
+ "solid fill, no interior lines"
Reason: rows 2 and 3 scored 1; the interior lines merge at 32 px.
```
