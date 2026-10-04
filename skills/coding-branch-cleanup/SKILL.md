---
name: coding-branch-cleanup
description: Safe identification and removal of local and remote branches whose work is already in the default branch, including squash-merged branches whose remote was deleted, and the post-merge routine of updating the local default branch and validating the fresh checkout. Use this skill whenever the user asks to clean up, prune or delete branches, says "which branches can go", asks what to do after a PR merged, or when a merge you performed is confirmed and cleanup is within scope. Do not use it for creating branches, committing, or opening PRs (coding-commit-pr).
---

# Branch cleanup

Stale branches accumulate because deleting one feels riskier than keeping it, and
because squash merges leave branches that Git does not recognise as merged. The
risk is real: a branch with unmerged commits or one checked out in a worktree must
never be removed. The fix is to classify every branch with evidence, show the list,
and delete only what the user confirms. `scripts/merged-branches.sh` does the
classification; this skill does the rest.

## Before you start

1. Confirm the default branch (`origin/HEAD`, or `main`/`master` if unset).
2. Fetch with prune so remote-deleted branches show as gone.
3. Note the current branch and every branch checked out in a worktree. Those are
   never candidates.

## Principles

### 1. Classify, then show, then delete
Run the script. It labels each branch merged, squash-merged or unmerged, says
whether the remote still exists, and flags worktree checkouts. Present the table.
Propose deleting only merged and squash-merged branches that are not checked out.
Wait for an explicit yes.

### 2. Squash-merged means "the tree is already there"
A squash merge leaves no shared commit, so `git branch --merged` misses it. The
script checks whether a single commit containing the branch's whole diff would be
a no-op against the default branch. That is the evidence; cite it.

### 3. Unmerged is unmerged, whatever the name
A branch called `old-experiment` with one unmerged commit stays. Mention it, say
how many commits it has beyond the default branch, and let the user decide
separately with a `-D` they type themselves or an explicit instruction.

### 4. After a merge, refresh and verify
Switch to the default branch, pull from the remote, and run the project's quick
check so the fresh checkout is known good before anything else starts. Then
delete the task branch locally and remotely if it was created for the task.

## Process

1. `scripts/merged-branches.sh [default]` and read the table.
2. Present it. Separate: safe to delete (merged or squash-merged, no worktree, not
   current), keep (unmerged), excluded (worktree or current).
3. On confirmation, delete the safe set locally with `git branch -d` (or `-D` for
   squash-merged, since Git will refuse `-d`), and remotely with
   `git push origin --delete <branch>` only where the remote still exists.
4. Report what was deleted, what was kept and why.

## Checklist before delivering

- [ ] Table shown before any deletion, with status and remote state per branch
- [ ] No deletion without an explicit confirmation in this conversation
- [ ] No branch with unmerged commits deleted
- [ ] No branch checked out in any worktree, or the current branch, deleted
- [ ] Remote deletions attempted only for branches whose remote still exists
- [ ] After a merge: default branch updated from remote and quick check run

## Anti-patterns

- **The sweep.** `git branch | grep -v main | xargs git branch -D`.
- **Trusting the name.** Deleting `wip-*` or `tmp-*` without classification.
- **Forgetting the remote.** Local branch gone, remote lingering, or the reverse.
- **Pruning mid-task.** Cleaning branches while the working tree is dirty.

## Example

**Before**

> "Deleted 7 old branches for you."

**After**

> | branch | status | remote | note |
> |---|---|---|---|
> | feat/export-csv | squash-merged | gone | |
> | fix/login-redirect | merged | present | |
> | spike/graph-layout | unmerged (3 commits) | gone | |
> | feat/billing | unmerged | present | checked out in worktree |
>
> Safe to delete: `feat/export-csv`, `fix/login-redirect` (also remote). Keeping
> `spike/graph-layout` (unmerged) and `feat/billing` (worktree). Delete the two?

Evidence per branch, a proposal, and a question, instead of an announcement.

## Further reading

- `scripts/merged-branches.sh` — classification; lists only, never deletes
