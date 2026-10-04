---
name: rule-authoring
description: House format and method for writing or editing a rule in the agents rule library (a skill under skills/, a reviewer agent under agents/, or the brand profile template). Use this skill whenever the user asks to add a rule, create a new skill, write guidelines for Claude, capture a style guide as a skill, edit an existing SKILL.md in this repo, or turn a document of standards into something Claude follows. Trigger it even if the user just says "add rules for X" or "make Claude always do Y" while in the agents repository.
---

# Writing a rule for this library

A rule here will run thousands of times, across projects and brands the author never
saw. It has to generalise, load cheaply, and be checkable. Most bad rules fail in one
of three ways: they are so vague that Claude already did that, they are so specific
that they only fit the example they came from, or they are so long that they crowd
out the actual task. This skill exists to avoid all three.

## Before you start

1. Read `templates/SKILL-template.md` and one existing skill in `skills/` for the shape.
2. Ask what the rule is *for*: which bad outcome it prevents, and who notices when it
   is broken. If the answer is "it just feels better", push for a concrete failure.
3. Check whether the rule is really a fact about one brand. If it is, it belongs in
   `templates/brand-profile.md` as a field, not in a skill.
4. Check for overlap with an existing skill. Extending one beats creating a near twin.

## Principles

### 1. Rules are generic, facts are per project
Never write a brand name, a hex code, a tagline or a real customer into a skill.
Write the method, and have the skill read the fact from the brand profile. When a
skill needs a fact the profile does not yet have, add the field to the template.

### 2. The description is the trigger. Make it pushy.
Claude under-triggers skills. The description must say what the skill does and list
the concrete situations, phrasings and artefact types that should invoke it,
including ones where the user does not name it. Then name the nearest neighbour
that should *not* trigger it. Everything about "when to use" goes in the description,
not the body.

### 3. Explain why, then what
A principle with its reasoning transfers to cases the author did not foresee. A bare
MUST does not. If you find yourself writing ALWAYS or NEVER in capitals, rewrite it
as a reason.

### 4. Checklists are for checkable things
Items must be verifiable by reading the output: "every heading is a noun phrase",
"no sentence over 30 words", "the CTA appears once". "Sounds professional" is not a
checklist item; it is a principle.

### 5. One example beats three paragraphs
Every skill carries at least one before/after pair. Keep it short and realistic,
and say in one sentence what changed. More pairs go in `examples/`.

### 6. Budget the context
`SKILL.md` stays under 300 lines. The body loads on every matching task, so every
line competes with the user's work. Move reference tables, long lists and
edge-case handling to `references/` and say in the body when to open each file.

## Process

1. Draft the description first, then the failure it prevents, then principles.
2. Write the checklist and anti-patterns from real failures, not imagined ones.
3. Write the before/after example. If you cannot write a convincing "before", the
   rule may not be needed.
4. Read the whole thing as if you were Claude mid-task with no other context. Cut
   anything that a competent writer or designer already does unprompted.
5. Test the trigger: write three prompts that should load it and three near misses
   that should not. Run them if the skill-creator tooling is available.
6. Add a `CHANGELOG.md` line. Update the README's layout tree if a folder was added.

## Checklist before delivering

- [ ] Description names concrete situations and one explicit non-trigger
- [ ] No brand-specific facts in the body
- [ ] Every principle states a reason
- [ ] Every checklist item is verifiable from the output
- [ ] At least one before/after example
- [ ] `SKILL.md` under 300 lines; longer material in `references/` with a pointer
- [ ] `CHANGELOG.md` updated

## Anti-patterns

- **The style guide dump.** Pasting a 40-page guide into `SKILL.md`. Split it: method in
  the body, tables in references, brand facts in the profile.
- **The imagined user.** Rules for cases nobody has hit. Wait for the failure.
- **The twin skill.** `writing-blog` next to `writing-marketing` with 80% overlap.
  Add a section or a reference file instead.
- **The polite vagueness.** "Be clear and engaging." Claude was already trying.

## Example

**Before**

> description: Guidelines for writing.

**After**

> description: Style and structure rules for technical documents such as READMEs,
> API references, runbooks, architecture notes and how-to guides. Use whenever the
> user asks to write, rewrite or review documentation, explain a system in writing,
> or produce anything an engineer will read to get a task done. Do not use for
> marketing pages or customer emails, which have their own skills.

The second version names artefacts, phrasings and the boundary, so it triggers on
"write me a README" and stays out of the way for "draft the launch email".
