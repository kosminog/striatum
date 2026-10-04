---
name: coding-commit-pr
description: How to turn a working-tree change into commits and a pull request that follow the project's conventions: splitting into logical commits, deriving a Conventional Commits subject from the diff, deciding whether a body is needed, running the right checks before pushing, and writing a PR title and description reviewers can act on. Use this skill whenever the user asks to commit, "write a commit message", push, open or update a PR, prepare a change for review, or asks what to put in a PR description. Trigger it even for a terse "commit this". Do not use it for deleting or pruning branches after a merge (coding-branch-cleanup) or for cutting release tags.
---

# Commits and pull requests

A commit message is read by someone bisecting a regression a year from now; a PR
description is read by someone deciding whether to approve in the next five
minutes. Both readers want the same thing: what changed, why, and how to tell it
works, without having to reconstruct it from the diff. Most weak commits fail by
describing the task instead of the change, by bundling unrelated edits, or by
carrying trailers that say nothing about the code. This skill applies the shared
`commits` and `git-workflow` rules to the concrete steps.

## Before you start

1. Read `CONTRIBUTING.md` and `AGENTS.md` or `CLAUDE.md` in the repository. They
   win over anything here, including the list of allowed types.
2. Inspect the branch and working tree. Separate your task's changes from anything
   unrelated that was already there; the latter is never committed without being
   asked.
3. Find out what the project's pre-push checks are (the manifest scripts, the
   hooks under `.husky/`, CI config) and whether the user has already run them.

## Principles

### 1. The type comes from the diff
`feat` adds behaviour, `fix` corrects behaviour, `docs` touches only prose,
`refactor` changes structure without behaviour, `chore` is housekeeping with no
user-visible effect, `test` is tests only. Read the diff and classify what it
does, not what the ticket said. A task called "fix the dashboard" that adds a new
filter is a `feat`.

### 2. One logical change per commit
If the subject needs "and", split it. Reviewers can approve three small commits
faster than one large one, and `git revert` works on one of them without undoing
the others. Formatting-only changes go in their own commit or not at all.

### 3. The subject is a headline, the body is the why
Imperative, lowercase, no trailing period, under 72 characters, scope only when
the change is clearly local. The body exists only when the diff does not explain
the reasoning: a constraint, a rejected alternative, a bug's root cause. Never
restate the diff in prose, and never add trailers about authorship or tooling.

### 4. Push only what passed
Run the checks the change requires before pushing, through the project's scripts.
If a check cannot run, say which and why in the PR rather than pushing silently.

### 5. The PR description answers three questions
What changed, why, and how the reviewer can verify it. Include anything a reviewer
would otherwise have to discover: migrations, new environment variables, changed
baselines, follow-ups deliberately left out. The structure is in
`references/pr-description.md`.

## Process

1. `git status` and `git diff`. List the logical changes present.
2. Stage one logical change. Write its subject from the staged diff. Decide on a
   body. Commit.
3. Repeat until only unrelated changes remain, which stay uncommitted.
4. Run the pre-push checks. Fix or report.
5. Push to the task branch. Open the PR with the title equal to the primary
   commit's subject (or a summary if several) and the description from the template.
6. Report: commits made, checks run with results, PR link, anything left out.

## Checklist before delivering

- [ ] Every commit subject is imperative, lowercase, no period, under 72 characters
- [ ] Type matches the diff; scope present only when the change is localized
- [ ] No commit mixes unrelated changes or formatting with logic
- [ ] No commit body restates the diff; bodies explain why
- [ ] No mention of any AI tool, model, or the conversation anywhere, including trailers
- [ ] Pre-push checks run through project scripts, results reported
- [ ] PR description states what, why, how to verify, and anything a reviewer must know
- [ ] Unrelated working-tree changes left untouched

## Anti-patterns

- **The task-title commit.** `feat: implement ticket 142`. Says nothing.
- **The everything commit.** One commit with a feature, a refactor and a reformat.
- **The novel.** A body that walks through every file touched.
- **The trailer.** `Co-Authored-By` or `Generated with` lines.
- **The silent skip.** Pushing without running checks and not saying so.

## Example

**Before**

> `Updated auth stuff and fixed some formatting`
>
> Co-Authored-By: ...

**After**

> `fix(auth): reject expired refresh tokens before rotation`
>
> Rotation previously issued a new access token even when the refresh token had
> expired, because the expiry check ran after the database write. Checking first
> closes the window and matches the behaviour documented in docs/auth.md.

The formatting change became its own `style:` commit, the type came from what the
diff does, and the body explains a root cause the diff alone would not show.

## Further reading

- `references/pr-description.md` — the PR description structure and a filled example
