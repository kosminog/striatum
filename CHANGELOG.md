# Changelog

## 2026-10-04 (path-scoped)
- Blocks may carry `description` and `paths` frontmatter. `scripts/emit-rules.mjs`
  writes path-scoped blocks as Claude (`.claude/rules`), Cursor (`.cursor/rules`) or
  Copilot (`.github/instructions`) rule files; `sync-rules.mjs` inlines bodies only.
- New `shell-scripts` block scoped to `**/*.sh`; its Claude rendering is committed
  under `.claude/rules/` and verified by `check.sh`.

## 2026-10-04 (agents-md)
- Project instructions moved from `CLAUDE.md` to `AGENTS.md` with the coding rule
  blocks rendered inline, so tools that do not expand `@` imports get the full text.
  `CLAUDE.md` is now a one-line `@AGENTS.md` import. `check.sh` verifies both
  `AGENTS.md` and `CODING.md` against the blocks.

## 2026-10-04 (ci)
- Added `.github/workflows/ci.yml` and `scripts/check.sh`: shell, Node and Python
  syntax checks, `sync-rules.mjs --check` on `CODING.md`, and `scripts/check-rules.mjs`
  for skill and agent frontmatter and the 300-line `SKILL.md` budget.

## 2026-10-04 (coding)
- Added `rules/coding/`: portable rule blocks (development, git-workflow, commits,
  releases, validation-docs, validation-reporting) migrated from the project-starter
  template, a rendered `CODING.md`, and `scripts/sync-rules.mjs` to write blocks into
  AGENTS.md and .jinja targets.
- validation-reporting: dropped the "browser and visual tests need no separate
  authorization" clause; agents run whichever tests the change needs.
- development: added "run tools through the project's scripts".
- New `commits` block (Conventional Commits, no authorship trailers).
- Added coding-commit-pr, coding-branch-cleanup (with merged-branches.sh) and
  coding-dependency-change skills, and the code-reviewer agent.
- install.sh now imports the coding rules into `~/.claude/CLAUDE.md`.

## 2026-10-04
- Added brand-logo-generation skill (prompt patterns, iteration protocol,
  vectorising reference, contact-sheet script, worked example), logo-critic agent,
  and logo-brief template.
- brand-logo-design: moved image-model prompting out to the new skill; description
  and process now hand off to it.

## 2026-09-29
- Initial scaffold: rule-authoring, brand-logo-design, writing-technical,
  writing-marketing, writing-professional-comms skills; brand-reviewer and
  copy-editor agents; brand profile and skill templates.
