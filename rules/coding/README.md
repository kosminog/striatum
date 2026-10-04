# Coding rules

Tool-agnostic working rules for software projects, kept as plain markdown blocks
so that Claude Code, Codex, Cursor and anything else that reads `AGENTS.md` or
`CLAUDE.md` can consume the same text.

## Layout

```
rules/coding/
  README.md
  CODING.md          rendered bundle of every block; import this from CLAUDE.md
  blocks/
    development.md   dependency and architecture decisions, tooling, style
    git-workflow.md  branches, preservation of unrelated work, PRs, cleanup
    commits.md       Conventional Commits, no authorship trailers
    releases.md      tag safety
    validation-docs.md       what to run for prose-only changes
    validation-reporting.md  tests, baselines, reporting
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

## Editing a rule

1. Edit the block in `blocks/`.
2. Run `node scripts/sync-rules.mjs rules/coding/CODING.md` and any other targets
   you maintain locally (the starter template, for one).
3. Add a `CHANGELOG.md` line. Downstream projects generated from the starter
   receive the change through a template release and `copier update`.
