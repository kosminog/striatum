---
name: coding-dependency-change
description: How to add, upgrade, replace or remove a dependency safely: deciding whether to ask first, evaluating a candidate package, updating the manifest and lockfile together through the package manager, verifying a frozen install, checking for breaking changes, and recording the change. Use this skill whenever the user asks to install or add a package or library, bump or upgrade versions, fix a vulnerability report, remove an unused dependency, or whenever a task you are doing would be easiest with a new dependency and the project does not already have one for the job. Do not use it for lockfile-only refreshes the project automates, or for application code changes that happen not to touch dependencies.
---

# Dependency changes

Every dependency is code the team did not write and now maintains. Adding one is
an architectural decision disguised as a one-liner, and upgrading one can change
behaviour nobody tested. The shared `development` rule says to ask before
introducing a dependency when the request and conventions do not already decide
it; this skill covers what to check before asking, and how to make the change so
it is reproducible and reviewable once agreed.

## Before you start

1. Check whether the project already has a dependency that does the job, or a
   documented convention for this category (HTTP client, date handling, testing).
   Reuse wins over adding.
2. Identify the package manager and lockfile, and whether the repo documents a
   dependency procedure (the starter has `docs/template-maintenance.md`; others
   have `CONTRIBUTING.md`). That procedure overrides this skill.
3. For an upgrade, read the package's changelog between the current and target
   versions before touching anything.

## Principles

### 1. Ask when it is a choice, proceed when it is not
A missing peer dependency, a security patch within the same major, or a package
the conventions already name: do it and report. A new category of dependency, a
major version bump, or a choice between candidates: present the options with the
trade-offs in three lines and wait.

### 2. Evaluate before proposing
Maintenance (last release, open issues trend), size and transitive count,
licence compatibility, TypeScript or typing support, and whether it does more
than the task needs. One line per criterion when presenting.

### 3. Manifest and lockfile move together, via the package manager
Never hand-edit a lockfile or a version string. Use the manager's add, update or
remove command so the lockfile is regenerated consistently, then verify a frozen
install succeeds from clean.

### 4. An upgrade is a behaviour change until proven otherwise
Run the project's full checks after any upgrade, not just a build. For major
bumps, read the migration guide and grep for every deprecated API it names.

### 5. Record it where the next person will look
The commit body states why this package and what was considered. Update any docs
that list dependencies or setup steps. Removing a dependency also removes its
config files, types and env variables.

## Process

1. Reuse check and convention check. Stop here if an existing dependency fits.
2. Evaluate the candidate(s). Ask if principle 1 says to.
3. Run the manager command. Review the lockfile diff for surprises (unexpected
   transitive additions, duplicate majors).
4. Verify a frozen install in a clean state.
5. Run the project's checks and tests. For upgrades, run everything.
6. Update docs. Commit with a body explaining the why.

## Checklist before delivering

- [ ] No existing dependency or convention already covered the need
- [ ] User asked and agreed where the shared development rule requires it
- [ ] Manifest and lockfile changed in the same commit, by the package manager
- [ ] Frozen install verified
- [ ] Changelog or migration guide read for upgrades; deprecated APIs grepped
- [ ] Project checks and tests run; results reported
- [ ] Commit body states why this package and alternatives considered
- [ ] Docs, config, types and env entries updated or removed accordingly

## Anti-patterns

- **The convenience add.** A 2 MB utility library for one function.
- **The silent major.** Bumping across a major because `latest` resolved there.
- **The hand-edited lock.** Changing a version in the lockfile to make CI pass.
- **The orphan.** Removing a package but leaving its config, types and docs.

## Example

**Before**

> Installed `dayjs` to format the date on the invoice page.

**After**

> The project already uses `date-fns` in four places, so I used
> `formatISO` from it; no new dependency. If you'd prefer a smaller footprint on
> this page, `Intl.DateTimeFormat` covers it with zero dependencies.

The reuse check removed the need to ask at all, and the alternative was offered
in one line rather than acted on.
