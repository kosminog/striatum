# Coding rules

Tool-agnostic working rules for software projects, kept as plain markdown blocks
so that Claude Code, Codex, Cursor and anything else that reads `AGENTS.md` or
`CLAUDE.md` can consume the same text.

## Layout

```
rules/coding/
  README.md
  CODING.md          rendered bundle of every always-on block; import this from CLAUDE.md
  blocks/
    development.md   dependency and architecture decisions, tooling, style
    git-workflow.md  branches, preservation of unrelated work, PRs, cleanup
    commits.md       Conventional Commits, no authorship trailers
    releases.md      tag safety
    validation-docs.md       what to run for prose-only changes
    validation-reporting.md  tests, baselines, reporting
    shell-scripts.md         path-scoped to **/*.sh: shell script conventions
```

Each block file is the exact text that lands between a pair of markers in a
target file. A block may begin with a heading. Block names are the file names.

## What belongs here

A rule belongs in a block when it would be true in a repository you have never
seen: no paths, no script names, no framework names, no database names. Anything
that names `pnpm check`, `apps/web`, Prisma or a test database is a project rule
and lives in that project's own file, outside the markers.

## Consuming the rules

**Claude Code, every project on this machine.** `scripts/install.sh` adds
`@<repo>/rules/coding/CODING.md` to `~/.claude/CLAUDE.md`. Rules apply on every
turn; nothing to do per project.

**Claude Code, one project.** Add the same import line to the project's `CLAUDE.md`
or `AGENTS.md`; Claude Code expands `@path` imports in both.

**Codex, every project on this machine.** `scripts/install.sh` appends empty
marker pairs for the always-on blocks to `~/.codex/AGENTS.md` once and syncs them
on every run. Codex has no import syntax, so the text is inlined.

**Any project, from npm.** `pnpm add -D @kosminog/agents` and run
`pnpm exec agents-rules sync AGENTS.md`; the blocks come from the installed
package. `agents-rules emit claude=.claude/rules` does the same for path-scoped
blocks. Both accept `--check` for CI.

**AGENTS.md projects (and the project-starter template).** Put empty marker pairs
where each block should appear, then sync:

```
<!-- shared:git-workflow -->
<!-- /shared:git-workflow -->
```

```bash
node scripts/sync-rules.mjs path/to/AGENTS.md
node scripts/sync-rules.mjs --check path/to/AGENTS.md   # CI: fail when stale
```

`.jinja` targets use `{# shared:name -#}` / `{#- /shared:name #}` comment markers,
matching the project-starter template, so the markers vanish on render.

A project opts out of a block by not carrying its markers. A project adds a
project-specific rule by writing it outside the markers.

## Path-scoped blocks

A block whose frontmatter carries `paths` applies only to matching files. It is
not inlined into `AGENTS.md` or `CODING.md`; `scripts/emit-rules.mjs` writes it in
the format each tool reads for file-scoped instructions:

```bash
node scripts/emit-rules.mjs claude=.claude/rules
node scripts/emit-rules.mjs cursor=.cursor/rules copilot=.github/instructions
node scripts/emit-rules.mjs --check claude=.claude/rules   # CI: fail when stale
```

The frontmatter is the only metadata a block carries:

```markdown
---
description: Conventions for shell scripts, applied when a *.sh file is edited
paths:
  - "**/*.sh"
---
```

Claude Code reads `paths` from the emitted file, Cursor gets `globs` with
`alwaysApply: false`, and Copilot gets `applyTo`. Emitted files carry a marker
comment; the script removes a marked file whose block is gone and never touches an
unmarked file. A tool with no file scoping, one that reads only `AGENTS.md`, can
still carry the block inline by adding its markers.

## Editing a rule

1. Edit the block in `blocks/`.
2. Re-render: `node scripts/sync-rules.mjs AGENTS.md rules/coding/CODING.md` for an
   always-on block, `node scripts/emit-rules.mjs claude=.claude/rules` for a
   path-scoped one, plus any other targets you maintain locally (the starter
   template, for one).
3. Add a `CHANGELOG.md` line. Downstream projects generated from the starter
   receive the change through a template release and `copier update`.
