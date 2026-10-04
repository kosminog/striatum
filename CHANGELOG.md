# Changelog

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
