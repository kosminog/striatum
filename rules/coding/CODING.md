# Coding rules

Portable working rules for software projects. This file is rendered from
`blocks/` by `scripts/sync-rules.mjs`; edit the blocks, not this file.
Import it from a `CLAUDE.md` with `@/path/to/agents/rules/coding/CODING.md`,
or sync the same blocks into an `AGENTS.md` for other tools.

# Development

<!-- shared:development -->
- Ask before introducing a dependency or making a consequential architectural choice when the request and existing conventions do not determine the answer. Follow established decisions without reconfirming them.
- Diagnose slow or failed tasks from their output first. Ask about connectivity when evidence points to a connection problem, and report the blocker and practical alternatives.
- Run linters, formatters, type checkers, and test runners through the scripts the project defines (`package.json`, `Makefile`, `pyproject.toml`, or equivalent) rather than invoking the tools directly, so the project's configuration applies.
- Follow existing style and the configured formatter; avoid unrelated formatting changes.
<!-- /shared:development -->

<!-- shared:git-workflow -->
# Git workflow

- Before implementation, inspect the current branch and working tree. Ask once about branching when starting new work and no branch preference has been established. Continue on an existing task branch when appropriate.
- Preserve unrelated changes; do not stash, discard, or commit them without authorization.
- Prepare larger revisions in small, committable chunks. Commit and push when included in the agreed workflow; follow `CONTRIBUTING.md` for commit messages and run relevant local checks before pushing.
- Never mention any LLM, AI assistant, or model name in commit messages, pull request titles or descriptions, or branch names, including co-author trailers and generated-with footers.
- Use the agreed branch and open a PR when included in the requested scope. Require passing CI and resolved review feedback before squash-merging.
- Complete merging and cleanup when included in the requested scope. After confirming the merge, update the local repository default branch from the remote and validate the fresh checkout. Delete only task-created branches, preserving unrelated branches and worktrees.
- When inspecting branches, identify other local branches whose changes are already in the default branch, including squash-merged branches whose remote branch was deleted. List them and offer to delete them and their remote branches; delete only after the user confirms, and never delete a branch with unmerged changes or one checked out in a worktree.
<!-- /shared:git-workflow -->

<!-- shared:commits -->
# Commits

- Follow Conventional Commits: `type(scope): description`. Choose the type from the actual diff, not the task description. Add a lowercase scope only when the change is clearly localized to one area. Write the description in the imperative mood, lowercase, without a trailing period, and keep the subject under 72 characters.
- Add a body only when the why is not obvious from the diff; the diff already shows the what. Never add footers or trailers about authorship, tooling, or the conversation.
<!-- /shared:commits -->

# Releases

<!-- shared:releases -->
- Test release procedures in temporary Git repositories. Create and publish real release tags only when releasing is requested. Never move or overwrite an existing release tag; create a new version.
<!-- /shared:releases -->

# Validation

<!-- shared:validation-docs -->
- For prose-only documentation changes, run the project's formatting and lint check and verify affected paths, links, and commands against the source. Changes to executable examples or validation requirements still require the project's full checks.
<!-- /shared:validation-docs -->
<!-- shared:validation-reporting -->
- Run whichever tests the change needs, including functional browser tests and visual screenshot comparisons for UI changes, and maintain the visual test specifications alongside UI changes.
- Generate missing screenshot baselines. Update existing baselines only for intentional UI changes after reviewing the differences, commit the reviewed baselines with the change, and mention them in the pull request. Never regenerate baselines to hide an unexplained comparison failure; report it instead.
- Report validation results and any required checks that remain unrun or blocked, with the reason.
<!-- /shared:validation-reporting -->
