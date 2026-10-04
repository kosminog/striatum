---
paths:
  - "**/*.sh"
---
<!-- Generated from rules/coding/blocks/shell-scripts.md by scripts/emit-rules.mjs. Edit the block, then re-run it. -->

# Shell scripts

- Start with `#!/usr/bin/env bash`, a comment block stating what the script does and how it is invoked, then `set -euo pipefail`. A script that must report every failure rather than stop at the first drops `-e` and exits with a status it tracks explicitly.
- Keep scripts shellcheck-clean: quote every expansion, iterate over files with `while IFS= read -r` and a process substitution rather than `for f in $(...)`, and branch with `if cmd; then` rather than `cmd && a || b`.
- Never begin an ordinary comment with the word shellcheck; the linter parses such a comment as a directive and fails on it.
- Print one line per item with a fixed-width status word first (`ok`, `skipped`, `FAIL`) so output can be scanned and grepped.
