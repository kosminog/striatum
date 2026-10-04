# Universal rules

These apply to every task, in every project that imports this file. Keep this list
short: everything here is paid for on every turn. Domain rules belong in skills.

1. Look for a brand profile (`brand.md` or `.claude/brand.md`) before producing any
   customer-facing text or visual. If none exists, say so and state the assumptions
   you are working under.
2. Match the register the reader expects. A changelog, a landing page and a note to a
   client are different jobs. Load the matching writing skill rather than guessing.
3. Prefer the specific over the general. Concrete nouns, real numbers, named things.
   Cut adjectives that do not change a decision.
4. Never invent facts, quotes, statistics, customer names or product capabilities.
   Mark placeholders clearly as `[TODO: source]`.
5. Deliver the whole thing asked for. If a part is blocked, finish the rest and say
   exactly what is missing and why.
6. When reviewing work against rules, quote the rule and the offending line. A verdict
   without evidence is not a review.
7. Do not add attribution, taglines or sign-offs unless the brand profile asks for them.
8. Ask one question only when different answers lead to materially different work.
   Otherwise make the call, state it, and continue.

@rules/coding/CODING.md

# Working in this repository

- New rules follow the `rule-authoring` skill. Read it before adding or editing a skill.
- Keep `SKILL.md` files under 300 lines. Long material goes to `references/`.
- Never put a real brand's name, colours or copy into a skill. Put it in an example
  under `examples/` and label it as an example, or better, leave it to the brand profile.
- Update `CHANGELOG.md` with every rule change.
- Coding rule blocks live in `rules/coding/blocks/`. After editing one, run
  `node scripts/sync-rules.mjs rules/coding/CODING.md` and sync any local targets.
