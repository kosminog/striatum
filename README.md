# striatum — a rule library for Claude Code

A single source of truth for how Claude should behave on recurring kinds of work:
brand and logo design, technical writing, marketing copy, professional communication,
and whatever groups get added next. Install once, use in every project.

## How it works

Rules live as **skills**. A skill is a folder with a `SKILL.md` whose description
tells Claude when to load it. Only the description sits in context permanently;
the body loads when a matching task shows up. That keeps coding sessions cheap and
still gives brand work the full guidance.

Three other layers sit around the skills:

- `agents/` holds **reviewer personas**. Run one after the work is done to check it
  against the rules from a fresh context.
- `AGENTS.md` holds the **universal rules** that apply on every turn, with the coding
  rule blocks rendered inline so any tool that reads `AGENTS.md` gets the full text.
  `CLAUDE.md` is a one-line `@AGENTS.md` import for Claude Code. Projects can import
  either.
- `rules/` holds **tool-agnostic rule blocks** for things that must be always-on
  and readable by any agent, such as the git workflow. They are synced into
  `AGENTS.md` files and the project-starter template, and imported by Claude. See
  `rules/coding/README.md`.

### Rules are generic, facts are per project

No skill in this repo hardcodes a brand name, palette or tone. Every skill reads
project facts from a **brand profile** in the project it is running in
(`brand.md` at the project root, or `.claude/brand.md`). The template is in
`templates/brand-profile.md`. One library therefore serves every client and product.

## Layout

```
striatum/
  README.md
  package.json                     npm manifest for striatum; bin striatum
  LICENSE                          MIT
  bin/striatum.mjs                 CLI: sync, emit, install, each running a script below
  AGENTS.md                        universal rules + coding blocks, importable by projects
  CLAUDE.md                        one-line @AGENTS.md import for Claude Code
  .claude/rules/                   path-scoped rules emitted from blocks (Claude Code)
  CHANGELOG.md
  skills/
    rule-authoring/                how to write a rule in this repo (meta-rule)
    brand-logo-design/
    brand-logo-generation/         LLM image-model loop: brief, rounds, scoring, vector
    writing-technical/
    writing-marketing/
    writing-professional-comms/
    coding-commit-pr/              commits, PR descriptions, pre-push checks
    coding-branch-cleanup/         safe pruning incl. squash-merged branches
    coding-dependency-change/      add/upgrade/remove dependencies safely
      SKILL.md                     triggers, principles, checklist  (<300 lines)
      references/                  long material, loaded on demand
      examples/                    before/after pairs
      scripts/                     deterministic helpers (e.g. contact sheets)
  agents/
    brand-reviewer.md
    copy-editor.md
    logo-critic.md                 blind scorer for logo candidates
    code-reviewer.md               conventions review of a diff or PR
  rules/
    coding/                        portable rule blocks + rendered CODING.md
  templates/
    brand-profile.md               facts each project supplies
    logo-brief.md                  plan + iteration log for a logo project
    SKILL-template.md              house format for new rules
  scripts/
    install.sh                     symlinks skills and agents, imports coding rules
    sync-rules.mjs                 writes rule blocks into AGENTS.md / .jinja targets
    check.sh                       every CI check: script syntax, rules in sync, frontmatter
    check-rules.mjs                skill and agent frontmatter, SKILL.md line budget
    emit-rules.mjs                 writes path-scoped blocks as Claude, Cursor or Copilot rule files
    lib/blocks.mjs                 block loader shared by sync-rules and emit-rules
  .github/workflows/ci.yml         runs scripts/check.sh on push and pull request
  .github/workflows/publish.yml    publishes to npm with provenance on a v* tag
```

## Install

**Personal (every tool on this machine).** `scripts/install.sh` installs for each
tool it finds. It is safe to re-run: links it did not create are left alone and
reported, and synced files are brought up to date, so run it again after editing
a rule block.

| Tool | What it installs |
| :- | :- |
| Claude Code | skills and agents linked into `~/.claude/`, `~/.claude/rules/coding` linked to the emitted path-scoped rules, and an import of `rules/coding/CODING.md` in `~/.claude/CLAUDE.md` |
| Codex | skills linked into `~/.agents/skills/`, and the always-on coding blocks appended once to `~/.codex/AGENTS.md` between sync markers, then re-synced on every run |
| Cursor | nothing extra; it reads `~/.claude/skills/` and `~/.agents/skills/` on its own |

```bash
./scripts/install.sh
```

**Any project, from npm.** The library is published as `striatum`. Install
it as a dev dependency and run the `striatum` CLI against the project's own
files; the blocks come from the installed package, so no clone is needed.

```bash
pnpm add -D striatum
pnpm exec striatum sync AGENTS.md
pnpm exec striatum emit claude=.claude/rules cursor=.cursor/rules
```

Add `striatum sync --check AGENTS.md` to the project's check script so CI
fails when a dependency bump changes a rule and `AGENTS.md` was not re-synced.
Skills and agents ship in the package too: symlink
`node_modules/striatum/skills/<name>` into `.claude/skills/`. A global
install (`pnpm add -g striatum`) can run `striatum install`, which
is `scripts/install.sh` pointed at the installed package.

**One project only.** Symlink or copy the skills you want into that project's
`.claude/skills/`, and the agents into `.claude/agents/`.

**A team.** Add a `.claude-plugin/plugin.json` at the root and publish the repo as
a plugin marketplace. The folder layout above is already plugin-shaped; nothing moves.

## Use in a project

1. Copy `templates/brand-profile.md` to the project as `brand.md` and fill it in.
2. Optionally add `@~/dev/striatum/AGENTS.md` to the project's `CLAUDE.md` to import
   the universal rules.
3. Ask for the work in plain language. The matching skill loads on its own.
4. For a second opinion, ask for the reviewer: "have the brand reviewer check this".

## Add a rule

Ask Claude to add a rule in this repo and the `rule-authoring` skill takes over.
Doing it by hand: copy `templates/SKILL-template.md` into `skills/<domain>-<topic>/SKILL.md`,
write a pushy description, then principles, then a checklist, then one before/after
example. Keep `SKILL.md` under 300 lines and push detail into `references/`.
Add a line to `CHANGELOG.md`.

## Checks

`scripts/check.sh` runs everything CI runs: `bash -n` and shellcheck on shell
scripts, `node --check` on Node scripts, a parse of Python scripts, a check that
`AGENTS.md`, `rules/coding/CODING.md` and `.claude/rules/` match their blocks, and a
check that every skill and agent
has frontmatter with a `name` matching its path, a `description`, and a `SKILL.md`
under 300 lines. The workflow in `.github/workflows/ci.yml` runs the same script on
every push to `main` and every pull request.

```bash
pnpm check
```

## Release

Bump `version` in `package.json`, add the `CHANGELOG.md` entry, merge, then tag
the merge commit `v<version>` and push the tag. `.github/workflows/publish.yml`
re-runs the checks, verifies the tag matches the version, and publishes to npm
through trusted publishing with provenance. Never move an existing tag; cut a new
version instead.

## Planned rule groups

Brand system (type, color, imagery, voice matrix) · product naming · UX writing ·
accessibility · release notes · help center · transactional email · social ·
executive summaries · slide decks · engineering conventions · document types
(README, ADR, runbook, PRD) · legal and claims · localization · research reports.
