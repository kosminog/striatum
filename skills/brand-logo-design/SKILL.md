---
name: brand-logo-design
description: Method and quality bar for logo and brand-mark work: briefing, concept generation, critique, refinement, and delivery of a logo system (wordmark, symbol, lockups, mono and reversed versions, clear space, minimum sizes). Use this skill whenever the user asks to design, sketch, generate, critique, compare, refine or choose a logo, icon, app icon, brand mark, monogram or wordmark, asks "does this logo work", or is naming a brand and wants a mark to go with it. When concepts will be generated with an image model, use this skill for the design judgement and brand-logo-generation for the prompting and iteration loop. Do not use it for full visual identity systems beyond the mark (typography, colour palettes, layouts), UI icons inside a product, or illustration.
---

# Logo and brand mark design

A logo is the smallest, most repeated artefact a brand owns. It is seen at 16 pixels
in a browser tab and 16 metres on a building, in one colour on an invoice and full
colour on a launch page. Most logo failures come from designing for one of those
contexts and discovering the others too late, or from mistaking decoration for
distinctiveness. This skill front-loads the constraints and gives a shared vocabulary
for critique so choices are argued, not felt.

## Before you start

1. Read the brand profile (`brand.md` or `.claude/brand.md`). You need at minimum:
   name and casing, category, audience, voice adjectives, and any existing colours
   or type. Note what is `unknown`.
2. Ask for or infer the **usage set**: favicon, app icon, social avatar, website
   header, print, merchandise, embroidery, signage. Each adds a constraint.
3. Collect the **competitive set**: five to eight marks the audience will see next to
   this one. Distinctiveness is measured against them, not in a vacuum.
4. If the profile is missing, state your assumptions for the four items above in
   one line and proceed.

## Principles

### 1. Reduce to one idea
A mark that says two things says neither. Pick one concept the audience should get
in under a second, and let the name carry the rest. When a brief lists five values,
ask which one the competitors do not already own.

### 2. Form before colour, mono before full colour
Design in black on white first. If it does not work in a single colour it does not
work; colour is applied later and will be stripped by fax machines, embroidery,
dark mode and partners' slide templates. Deliver the mono version as a first-class
asset, never as an afterthought.

### 3. Design for the smallest size, check at the largest
Start at favicon scale. Detail that vanishes at 16 px is detail the brand does not
own. Then check at large scale for wobble, uneven optical weight and kerning that
was invisible when small.

### 4. Distinctive over decorative
The question is not "is it beautiful" but "would you recognise it half-covered, in
grey, from across the room, next to its competitors". Gradients, glows and 3D bevels
add surface without adding memorability and date fast. Prefer a shape or a letter
treatment that could be drawn from memory.

### 5. Build a system, not a picture
Deliver the mark as a kit: primary lockup, horizontal and stacked variants, symbol
alone, wordmark alone, positive, reversed, mono, clear-space rule, minimum size,
and a short list of things not to do. A single PNG is not a logo.

### 6. Audit for accidents
Look at the mark upside down, mirrored, squinted at, and as a silhouette. Search
for unfortunate readings, hidden letters, and resemblance to existing marks in the
same category. Do this before the client does.

## Process

1. **Brief in one page.** Name, one-line description, audience, the single idea, the
   usage set, competitive set, hard constraints (existing colours, required elements).
2. **Diverge.** Produce 8 to 12 rough directions across at least three families:
   wordmark-only, symbol plus wordmark, abstract monogram. Mono only. One line of
   rationale each. If generating with an image model, switch to the
   `brand-logo-generation` skill for the rounds and come back here for the cull.
3. **Cull to three.** Score each against `references/critique-checklist.md`. Show the
   survivors at 16 px, 64 px and 512 px, mono, side by side with the competitive set.
4. **Refine one.** Fix optical weight, alignment and spacing on a grid. Set the
   wordmark type deliberately: choose or modify a face, adjust kerning by eye.
5. **Systemise.** Produce the kit from principle 5. Write usage notes in plain
   language, one page.
6. **Deliver.** SVG master, PNG at standard sizes, a one-page usage sheet, and a short
   note on what the mark means and why it beat the alternatives.

## Checklist before delivering

- [ ] Reads clearly at 16 px in one colour
- [ ] Works in positive, reversed and mono without redrawing
- [ ] No gradients, glows, drop shadows or bevels in the master mark
- [ ] Compared side by side with the competitive set and visibly different
- [ ] Checked mirrored, rotated and as a silhouette for accidental readings
- [ ] Wordmark casing matches the brand profile exactly
- [ ] Clear space and minimum size stated
- [ ] Delivered as SVG plus the variant set, not a single raster
- [ ] One paragraph explains the single idea behind it

## Anti-patterns

- **The Swoosh-of-the-week.** Abstract swooshes, globes, and interlocking shapes that
  belong to no one.
- **The literal pun.** A cloud for a cloud company, a bee for "busy". The audience
  gets it in a second and is bored in two.
- **Trend surface.** Whatever gradient or letterform is current on design feeds. It
  dates the brand to the month it launched.
- **Colour doing the work.** A mark that only reads because of its two colours.
- **Icon-only delivery.** A symbol with no wordmark, no clear-space rule and no
  mono version.

## Example

**Before**

> Brief: "A logo for a payroll app. Modern, trustworthy, friendly, innovative,
> global." Output: a blue gradient circle with a white tick and a swoosh, wordmark
> in a geometric sans, delivered as one PNG.

**After**

> Single idea: "paid on the dot". Mark: the wordmark set in a sturdy grotesque with
> the final letter's dot replaced by a filled circle sitting exactly on the baseline.
> Works in mono, reads at 16 px as a distinctive dot, scales to signage. Delivered
> as SVG with symbol-only (the dot on a rounded square for app icon), reversed and
> mono, clear space equal to the dot's diameter, minimum height 12 px.

What changed: five adjectives collapsed to one idea the name could carry, colour
stopped doing the work, and the deliverable became a system.

## Further reading

- `references/critique-checklist.md` — the scoring sheet used to cull directions
- `brand-logo-generation` skill — prompting, rounds and vectorising when an image model is involved
- `examples/` — annotated before/after critiques; its README gives the folder
  layout, and no case is committed yet
