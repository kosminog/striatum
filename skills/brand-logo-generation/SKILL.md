---
name: brand-logo-generation
description: Workflow for planning, generating and iterating on logos with image-generation models (Midjourney, DALL-E, Imagen, Ideogram, Recraft, Flux, Stable Diffusion or any text-to-image tool): turning a brief into a prompt matrix, running structured rounds, scoring candidates at multiple sizes, steering the next round from the scores, and taking a winner from raster to a clean vector logo system. Use this skill whenever the user wants to generate logo, icon, app-icon, monogram or wordmark concepts with an AI model, asks for logo prompts, pastes or points at AI-generated logo candidates and asks which is best or how to improve them, says a generated logo "looks off" or "looks generic", or wants to clean up an AI logo for real use. Trigger it even when the model is not named ("make me some logo options"). Do not use it for logo work with no image model involved, which belongs to brand-logo-design, or for generating illustrations, hero images or marketing visuals.
---

# Generating logos with image models

Image models are a fast way to see fifty directions before lunch and a slow way to
get one usable logo. They return raster, drift between variants, render text badly,
quietly copy marks they were trained on, and reward whoever prompts most vaguely with
the most generic result. Teams that get value from them treat generation as sketching
inside a disciplined loop: a brief that names one idea, prompts that vary one thing
at a time, scoring at the sizes a logo actually lives at, and a hard hand-off to
vector. This skill is that loop. The design judgement it relies on lives in
`brand-logo-design`; read that skill's principles once before the first round.

## Before you start

1. Read the brand profile (`brand.md` or `.claude/brand.md`): name and casing,
   category, audience, voice adjectives, existing colours or type, and any
   constraints on imagery. Note what is `unknown`.
2. Copy `templates/logo-brief.md` into the project (default `design/logo/brief.md`)
   and fill the **Plan** section with the user. Do not generate until the single
   idea, the usage set and the competitive set are written down. Generation without
   a brief produces pretty images and no logo.
3. Confirm which model and interface the user has, how many images a round costs,
   and where outputs will be saved (default `design/logo/rounds/NN/`).
4. If the profile is missing, state your assumptions for name, category and
   audience in one line, mark them in the brief, and proceed.

## Principles

### 1. The brief does the designing, the model does the drawing
A model given "modern trustworthy fintech logo" returns the average of every fintech
logo it has seen. The brief must supply what the average lacks: one idea, one
visual device, and a list of what to avoid. Every prompt is derived from the brief,
never improvised in the chat box.

### 2. Vary one variable per round
A round that changes idea, style, composition and palette at once teaches nothing.
Fix everything but one axis, generate, score, keep the winners, then move the next
axis. Round order that works: idea → form family → composition → weight and detail
→ wordmark treatment. Colour is last and often skipped entirely at this stage.

### 3. Mono first, always
Prompt for black on white. Colour hides weak form, and the model will happily lean
on a gradient to make a shape feel finished. A candidate that only works in colour
is rejected before scoring.

### 4. Score at 16 px, not at 1024
The model renders at a size no logo is ever seen at. Build a contact sheet of every
candidate at 16, 32, 64 and 256 px beside the competitive set before judging.
Most "stunning" candidates die at 32 px. `scripts/contact_sheet.py` does this.

### 5. Scores steer prompts
Every candidate gets the ten-row score from `brand-logo-design`'s critique checklist.
The next round's prompt changes are written as responses to the lowest-scoring rows,
not as new ideas. "Row 3 failed because the inner detail collapses; next round
remove the inner lines and increase stroke weight." Record this in the brief's
iteration log so the reasoning survives the session.

### 6. Raster is a sketch, vector is the logo
Nothing generated ships. The winner is redrawn in vector, the wordmark is set in a
real typeface, and the system (lockups, mono, reversed, clear space, minimum size)
is built by hand or with a vector tool. Autotracing a PNG produces a logo with 400
anchor points and wobbly curves; budget the redraw from the start.

### 7. Check what the model borrowed
Models reproduce existing marks, especially for common categories. Before any
candidate goes to the client, reverse image search it and compare against the
competitive set and well-known marks. Resemblance is grounds for rejection, however
good the score.

## Process

1. **Plan.** Fill the brief: single idea (pick from three candidates), visual device,
   usage set, competitive set, avoid list. Write the base prompt from
   `references/prompt-patterns.md`.
2. **Round 1, ideas.** One prompt per idea candidate (up to three), mono, 8 to 12
   images each. Contact sheet. Score. Pick one idea. Log it.
3. **Rounds 2 to 4, form.** Hold the idea. Vary form family, then composition, then
   weight and detail, one per round, following `references/iteration-protocol.md`.
   Each round: contact sheet, scores, a one-paragraph read-out, a prompt diff for the
   next round. Stop when the top candidate's score plateaus across two rounds or
   reaches 17 of 20.
4. **Wordmark.** Do not ask the model for lettering. Choose a typeface against the
   brand profile and set the name yourself. If a model-rendered wordmark is
   genuinely the idea (a letterform device), use the model's output only as a sketch.
5. **Audit.** Reverse image search the top two. Check mirrored, rotated,
   silhouetted. Check casing of the name.
6. **Vectorise.** Redraw per `references/vectorising.md`. Build the system and the
   one-page usage note described in `brand-logo-design`.
7. **Hand off for review.** Run the `logo-critic` agent on the final candidate set
   before showing the client; it scores blind and will catch what you have stopped
   seeing after four rounds.

## Checklist before delivering

- [ ] Brief has a single idea, usage set, competitive set and avoid list filled in
- [ ] Every round in the iteration log has: prompt, variable changed, scores, decision
- [ ] All candidates were generated and judged in mono
- [ ] Contact sheet at 16, 32, 64 and 256 px exists for the final round
- [ ] Top candidates reverse image searched; result recorded
- [ ] Winner redrawn in vector; no autotrace artefacts; under 60 anchor points for a simple mark
- [ ] Wordmark set in a named typeface, not model-rendered
- [ ] System delivered: lockups, symbol, wordmark, mono, reversed, clear space, minimum size
- [ ] `logo-critic` run on the final set and its findings addressed or answered

## Anti-patterns

- **Prompt roulette.** Twenty prompts, each a new idea, no scoring. Lots of images,
  no progress.
- **Judging the hero render.** Choosing from the model's 1024 px grid with the
  gradient and the glow on. Check at 32 px first.
- **Model lettering.** Shipping the wordmark the model drew. The kerning is wrong and
  the letters are not from any typeface you can license.
- **The autotrace.** Image Trace on the PNG, export SVG, done. It looks fine until
  someone scales it or opens the paths.
- **Style words as substitute for idea.** "Minimalist, flat, geometric, clean" with no
  device named. The model picks the device, and it picks the obvious one.
- **Forgetting provenance.** No record of which prompt or seed made the winner, so it
  cannot be reproduced or defended.

## Example

**Before**

> Prompt: "minimalist modern logo for a payroll startup called Dotpay, flat design,
> trending on dribbble, vector style, blue and white". Twenty images. The user
> picks a blue circle with a tick, downloads the PNG, autotraces it, ships.

**After**

> Brief: single idea "paid on the dot"; device: a filled circle that reads as a
> full stop; avoid: ticks, coins, arrows, shields, gradients.
> Round 1 prompt: "Flat vector logo mark, black on white, a single bold filled
> circle integrated with a simple geometric shape suggesting a line of text or a
> baseline, no letters, no gradients, no shadow, centred, wide margin." Twelve
> images, contact sheet, scored; two survive at 32 px.
> Round 2 varies composition only (circle on baseline / circle replacing a dot /
> circle inside a rounded square). Round 3 varies stroke weight. Winner at 18/20.
> Wordmark set in a grotesque by hand; the circle replaces the final dot. Redrawn in
> vector with 9 anchor points. Reverse search clean. Critic run; one finding fixed.

What changed: the idea was chosen before the model was opened, each round changed
one thing, judgement happened at small sizes, and the deliverable was vector.

## Further reading

- `references/prompt-patterns.md` — base prompt scaffold, style and form vocabulary,
  avoid list, notes on how model families differ
- `references/iteration-protocol.md` — round structure, read-out format, stopping rules
- `references/vectorising.md` — raster to vector, system build, file naming
- `scripts/contact_sheet.py` — tiles a round's PNGs at logo sizes next to competitors
- `examples/01-worked-project.md` — a full four-round log for an invented brand
- `templates/logo-brief.md` — the planning and iteration document
