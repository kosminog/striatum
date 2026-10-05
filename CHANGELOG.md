# Changelog

Entries are keyed by package version, newest first. Each heading says whether that
version reached npm; a `v<version>` tag marks the commit it was cut from.

## Unreleased

- `scripts/sync-rules.mjs --init` appends an empty marker pair for every always-on
  block a target lacks, under a preamble when the file is new and with a heading
  made from the block name when the block has none, then syncs. `install.sh` uses
  it for `~/.codex/AGENTS.md` instead of a hardcoded marker list, so a new block
  reaches Codex on the next run. `striatum sync` takes the flag too.
- `scripts/lib/blocks.mjs` holds the one frontmatter parser and the one argument
  parser; `check-rules.mjs`, `sync-rules.mjs` and `emit-rules.mjs` share them. An
  unknown flag now prints usage instead of being ignored.
- New `tests/scripts.test.mjs` (`node --test`) covers the block loader and the sync
  and emit scripts against temporary rules and targets; `check.sh` and CI run it.
  `tests/install.sh` gained a Codex case.
- `check-rules.mjs` requires every skill description to name a non-trigger
  ("Do not use it for ..."), as the rule-authoring checklist already asked; the
  `rule-authoring` description gained one.
- One before/after example each for `writing-technical` (runbook),
  `writing-marketing` (launch announcement) and `writing-professional-comms`
  (decline), all with invented names.
- `merged-branches.sh` follows the `shell-scripts` block: `while read` over a
  process substitution and `if` branches instead of `&&` chains.
- `publish.yml` skips a version that is already on npm instead of failing. Both
  earlier tag runs had failed: `v0.1.0` because the package was still scoped to an
  account that is not ours, `v0.1.2` because 0.1.2 had been published by hand first.
- This changelog is keyed by version instead of by date and nickname.
- Dropped the empty `pnpm-lock.yaml`; the package has no dependencies. The README
  describes every check `check.sh` runs.
- `install.sh` repairs an install after the repo has moved. `link()` replaces a
  symlink that dangles or whose target ends with the same repo-relative path (so
  it points at a previous location of this repo) and reports it as `relinked`;
  before, the dangling link made `ln -s` fail with "File exists" and abort the
  run. Entries that exist and are not ours are still skipped.
- The `~/.claude/CLAUDE.md` step rewrites an existing `@<old-path>/rules/coding/CODING.md`
  import in place instead of appending a second one, and only appends when there
  is no import at all.
- New `tests/install.sh` runs install.sh against a temporary HOME (fresh, re-run,
  after a move, after repair); `check.sh` and CI run it.

## 0.1.2 (2026-10-04, on npm, tag `v0.1.2`)

- Project renamed to `striatum`: GitHub repository `kosminog/striatum`, npm package
  `striatum` (unscoped), CLI `striatum`. `octolith` was never published; npm's
  similarity guard rejected it as too close to `octokit`. Published by hand; the
  tag was pushed afterwards.

## 0.1.1 (2026-10-04, never published, no tag)

- Package renamed to `octolith` (unscoped); the CLI is now `octolith` with the same
  `sync`, `emit` and `install` commands.

## 0.1.0 (2026-10-04, never published, tag `v0.1.0`)

- Packaged for npm as `@kosminog/agents`: `package.json` with a `files` whitelist, MIT
  `LICENSE`, and a `bin/agents-rules.mjs` CLI (since renamed) whose `sync`, `emit` and
  `install` commands run the existing scripts against the installed package's blocks.
  Never published: the `@kosminog` npm scope belongs to a different account.
- `.github/workflows/publish.yml` publishes to npm with provenance on a `v*` tag
  through trusted publishing, after re-running `scripts/check.sh` and verifying the
  tag matches `package.json`.
- Repository moved to `kosminog/agents` (since renamed to `kosminog/striatum`).
- install.sh installs per tool: links `~/.claude/rules/coding` to the emitted
  path-scoped rules, links skills into `~/.agents/skills/` for Codex (Cursor reads
  it too), and appends the always-on blocks to `~/.codex/AGENTS.md` between sync
  markers, re-synced on every run. Skips tools whose directory is absent.
- Blocks may carry `description` and `paths` frontmatter. `scripts/emit-rules.mjs`
  writes path-scoped blocks as Claude (`.claude/rules`), Cursor (`.cursor/rules`) or
  Copilot (`.github/instructions`) rule files; `sync-rules.mjs` inlines bodies only.
- New `shell-scripts` block scoped to `**/*.sh`; its Claude rendering is committed
  under `.claude/rules/` and verified by `check.sh`.
- Project instructions moved from `CLAUDE.md` to `AGENTS.md` with the coding rule
  blocks rendered inline, so tools that do not expand `@` imports get the full text.
  `CLAUDE.md` is now a one-line `@AGENTS.md` import. `check.sh` verifies both
  `AGENTS.md` and `CODING.md` against the blocks.
- Added `.github/workflows/ci.yml` and `scripts/check.sh`: shell, Node and Python
  syntax checks, `sync-rules.mjs --check` on `CODING.md`, and `scripts/check-rules.mjs`
  for skill and agent frontmatter and the 300-line `SKILL.md` budget.
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
- Added brand-logo-generation skill (prompt patterns, iteration protocol,
  vectorising reference, contact-sheet script, worked example), logo-critic agent,
  and logo-brief template.
- brand-logo-design: moved image-model prompting out to the new skill; description
  and process now hand off to it.
- Initial scaffold (2026-09-29): rule-authoring, brand-logo-design, writing-technical,
  writing-marketing, writing-professional-comms skills; brand-reviewer and
  copy-editor agents; brand profile and skill templates.
