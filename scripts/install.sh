#!/usr/bin/env bash
# Installs this library for every tool on this machine that can read it. Safe
# to re-run: entries that already exist and are not links to this repo are left
# alone and reported, and synced files are brought up to date.
#
#   scripts/install.sh
#
#   Claude Code   ~/.claude/skills/<skill> and ~/.claude/agents/<agent>.md links,
#                 ~/.claude/rules/coding -> .claude/rules (path-scoped rules),
#                 ~/.claude/CLAUDE.md imports rules/coding/CODING.md
#   Codex         ~/.agents/skills/<skill> links (Cursor reads them too), and the
#                 always-on blocks in ~/.codex/AGENTS.md between sync markers,
#                 appended once and re-synced on every run
#   Cursor        reads ~/.claude/skills and ~/.agents/skills on its own
set -euo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"

link() {
  local src="$1" dst="$2" name="${2#"${HOME}"/}"
  if [ -L "$dst" ] && [ "$(readlink "$dst")" = "$src" ]; then
    echo "ok       $name"
  elif [ -e "$dst" ]; then
    echo "skipped  $name (already exists and is not ours)"
  else
    ln -s "$src" "$dst"
    echo "linked   $name"
  fi
}

# Appends empty marker pairs for the always-on blocks to FILE once; the sync
# below fills them. Existing content is kept.
ensure_markers() {
  local file="$1"
  if [ -f "$file" ] && grep -qF '<!-- shared:development -->' "$file"; then
    return
  fi
  if [ -s "$file" ]; then printf '\n' >> "$file"; fi
  cat >> "$file" <<'MARKERS'
# Coding rules

Synced from the agents rule library by its scripts/install.sh; edit the blocks
there and re-run it.

# Development

<!-- shared:development -->
<!-- /shared:development -->

<!-- shared:git-workflow -->
<!-- /shared:git-workflow -->

<!-- shared:commits -->
<!-- /shared:commits -->

# Releases

<!-- shared:releases -->
<!-- /shared:releases -->

# Validation

<!-- shared:validation-docs -->
<!-- /shared:validation-docs -->
<!-- shared:validation-reporting -->
<!-- /shared:validation-reporting -->
MARKERS
  echo "added    coding rule markers to ${file#"${HOME}"/}"
}

echo "== Claude Code"
mkdir -p "${HOME}/.claude/skills" "${HOME}/.claude/agents" "${HOME}/.claude/rules"
for d in "$REPO"/skills/*/; do
  link "${d%/}" "${HOME}/.claude/skills/$(basename "$d")"
done
for f in "$REPO"/agents/*.md; do
  link "$f" "${HOME}/.claude/agents/$(basename "$f")"
done
link "$REPO/.claude/rules" "${HOME}/.claude/rules/coding"

USER_CLAUDE="${HOME}/.claude/CLAUDE.md"
IMPORT="@${REPO}/rules/coding/CODING.md"
if [ -f "$USER_CLAUDE" ] && grep -qxF "$IMPORT" "$USER_CLAUDE"; then
  echo "ok       .claude/CLAUDE.md imports coding rules"
else
  printf '%s\n' "$IMPORT" >> "$USER_CLAUDE"
  echo "added    coding rules import to .claude/CLAUDE.md"
fi

echo "== Codex"
if [ -d "${HOME}/.codex" ]; then
  mkdir -p "${HOME}/.agents/skills"
  for d in "$REPO"/skills/*/; do
    link "${d%/}" "${HOME}/.agents/skills/$(basename "$d")"
  done
  CODEX_AGENTS="${HOME}/.codex/AGENTS.md"
  ensure_markers "$CODEX_AGENTS"
  if command -v node >/dev/null; then
    node "$REPO/scripts/sync-rules.mjs" "$CODEX_AGENTS"
  else
    echo "skipped  sync of .codex/AGENTS.md (node not installed)"
  fi
else
  echo "skipped  ~/.codex not found"
fi
