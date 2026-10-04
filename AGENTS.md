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

# Coding rules

The blocks below are rendered from `rules/coding/blocks/` by
`scripts/sync-rules.mjs`; edit the blocks, not this file.

# Development

<!-- shared:development -->
- Ask before introducing a dependency or making a consequential architectural choice when the request and existing conventions do not determine the answer. Follow established decisions without reconfirming them.
- Diagnose slow or failed tasks from their output first. Ask about connectivity when evidence points to a connection problem, and report the blocker and practical alternatives.
- Run linters, formatters, type checkers, and test runners through the scripts the project defines (`package.json`, `Makefile`, `pyproject.toml`, or equivalent) rather than invoking the tools directly, so the project's configuration applies.
- Follow existing style and the configured formatter; avoid unrelated formatting changes.
<!-- /shared:development -->

<!-- shared:git-workflow -->
# Git workflow

- Before implementation, inspect the current branch and working tree. Ask once about branching when starting new work and no branch preference has been established. Continue on an existing task branch when appropriate.
- Preserve unrelated changes; do not stash, discard, or commit them without authorization.
- Prepare larger revisions in small, committable chunks. Commit and push when included in the agreed workflow; follow `CONTRIBUTING.md` for commit messages and run relevant local checks before pushing.
- Never mention any LLM, AI assistant, or model name in commit messages, pull request titles or descriptions, or branch names, including co-author trailers and generated-with footers.
- Use the agreed branch and open a PR when included in the requested scope. Require passing CI and resolved review feedback before squash-merging.
- Complete merging and cleanup when included in the requested scope. After confirming the merge, update the local repository default branch from the remote and validate the fresh checkout. Delete only task-created branches, preserving unrelated branches and worktrees.
- When inspecting branches, identify other local branches whose changes are already in the default branch, including squash-merged branches whose remote branch was deleted. List them and offer to delete them and their remote branches; delete only after the user confirms, and never delete a branch with unmerged changes or one checked out in a worktree.
<!-- /shared:git-workflow -->

<!-- shared:commits -->
# Commits

- Follow Conventional Commits: `type(scope): description`. Choose the type from the actual diff, not the task description. Add a lowercase scope only when the change is clearly localized to one area. Write the description in the imperative mood, lowercase, without a trailing period, and keep the subject under 72 characters.
- Add a body only when the why is not obvious from the diff; the diff already shows the what. Never add footers or trailers about authorship, tooling, or the conversation.
<!-- /shared:commits -->

# Releases

<!-- shared:releases -->
- Test release procedures in temporary Git repositories. Create and publish real release tags only when releasing is requested. Never move or overwrite an existing release tag; create a new version.
<!-- /shared:releases -->

# Validation

<!-- shared:validation-docs -->
- For prose-only documentation changes, run the project's formatting and lint check and verify affected paths, links, and commands against the source. Changes to executable examples or validation requirements still require the project's full checks.
<!-- /shared:validation-docs -->
<!-- shared:validation-reporting -->
- Run whichever tests the change needs, including functional browser tests and visual screenshot comparisons for UI changes, and maintain the visual test specifications alongside UI changes.
- Generate missing screenshot baselines. Update existing baselines only for intentional UI changes after reviewing the differences, commit the reviewed baselines with the change, and mention them in the pull request. Never regenerate baselines to hide an unexplained comparison failure; report it instead.
- Report validation results and any required checks that remain unrun or blocked, with the reason.
<!-- /shared:validation-reporting -->

# Working in this repository

- New rules follow the `rule-authoring` skill. Read it before adding or editing a skill.
- Keep `SKILL.md` files under 300 lines. Long material goes to `references/`.
- Never put a real brand's name, colours or copy into a skill. Put it in an example
  under `examples/` and label it as an example, or better, leave it to the brand profile.
- Update `CHANGELOG.md` with every rule change.
- Coding rule blocks live in `rules/coding/blocks/`. After editing one, run
  `node scripts/sync-rules.mjs AGENTS.md rules/coding/CODING.md` and sync any local
  targets.
- Run `./scripts/check.sh` before pushing. CI runs the same script on every push and PR.
