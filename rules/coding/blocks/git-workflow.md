# Git workflow

- Before implementation, inspect the current branch and working tree. Ask once about branching when starting new work and no branch preference has been established. Continue on an existing task branch when appropriate.
- Preserve unrelated changes; do not stash, discard, or commit them without authorization.
- Prepare larger revisions in small, committable chunks. Commit and push when included in the agreed workflow; follow `CONTRIBUTING.md` for commit messages and run relevant local checks before pushing.
- Never mention any LLM, AI assistant, or model name in commit messages, pull request titles or descriptions, or branch names, including co-author trailers and generated-with footers.
- Use the agreed branch and open a PR when included in the requested scope. Require passing CI and resolved review feedback before squash-merging.
- Complete merging and cleanup when included in the requested scope. After confirming the merge, update the local repository default branch from the remote and validate the fresh checkout. Delete only task-created branches, preserving unrelated branches and worktrees.
- When inspecting branches, identify other local branches whose changes are already in the default branch, including squash-merged branches whose remote branch was deleted. List them and offer to delete them and their remote branches; delete only after the user confirms, and never delete a branch with unmerged changes or one checked out in a worktree.
