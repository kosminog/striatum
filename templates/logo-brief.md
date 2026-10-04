# Logo brief and iteration log

Copy to `design/logo/brief.md` in the project. Fill **Plan** before generating
anything. Append to **Rounds** as you go. Finish **Decision** before vectorising.
Lines left as `unknown` will be flagged by the skills.

## Plan

### Brand facts (from the brand profile)

- **Name, exact casing:**
- **One-line description:**
- **Category:**
- **Audience, one sentence:**
- **Voice adjectives (with "but not"):**
- **Existing colours / typefaces to respect:** none / …

### Usage set

Tick every place the mark will live. Each one adds a constraint.

- [ ] favicon (16 px)
- [ ] app icon (iOS / Android, rounded square, maskable)
- [ ] social avatar (circle crop)
- [ ] web header (horizontal, ~32 px tall)
- [ ] print, mono (invoices, documents)
- [ ] embroidery / merch (no fine detail)
- [ ] signage / large format
- [ ] other:

### Competitive set

Five to eight marks the audience will see next to this one. Save them to
`design/logo/competitors/` for the contact sheet.

| Brand | What their mark is | Motif they own |
|-------|--------------------|----------------|
| | | |

Motifs that are therefore off the table:

### The single idea

Three candidates, then choose one. Write each as a phrase the audience would say.

1. 
2. 
3. 

**Chosen idea:**
**Why this one and not the others:**

### Visual device

Describe the device as shapes, not meaning. This is what goes in the prompt.

**Device:**
**Form family to start with:** solid geometric (default) / monoline / humanist / negative space / letterform
**Avoid list** (category clichés + competitor motifs + the literal pun):

### Generation setup

- **Model and interface:**
- **Images per round:** 8–12
- **Output folder:** `design/logo/rounds/NN/`
- **Budget / limit:** rounds or images

### Base prompt

```
Flat vector logo mark, black on white.
Subject: 
Form: 
Composition: centred, single mark, wide margin.
Constraints: no letters, no text, no gradients, no shadows, no 3D, no background shape.
Avoid: 
```

## Rounds

Copy this block per round.

### Round N — <variable varied>

- **Hypothesis:**
- **Prompt / diff:**
- **Model, settings, seed:**
- **Images:** `rounds/NN/`
- **Contact sheet:** `rounds/NN/contact-sheet.png`
- **Culled:** file — reason

| Candidate | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | | |

- **Read-out:**
- **Decision:** continue / branch / stop / back to round …
- **Next diff and why:**

## Decision

- **Winner:** file, round, score
- **Provenance:** model, prompt, seed, date
- **Reverse image search:** date, tool, result
- **Accident audit:** mirrored / rotated / silhouette findings
- **Critic verdict:** link to the run or paste the verdict line
- **Typeface for wordmark and licence:**
- **Redrawn by, date, anchor count:**
- **Delivered variants:** list, or link to `design/logo/final/`
- **Clear space rule:**
- **Minimum sizes:**
- **Approved by, date:**
