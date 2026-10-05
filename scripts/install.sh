#!/usr/bin/env bash
# Installs this library for every tool on this machine that can read it. Safe
# to re-run: entries that already exist and are not links to this repo are left
# alone and reported, and synced files are brought up to date. Safe after the
# repo has moved: links that dangle or still point at the old location, and an
# old-path import in ~/.claude/CLAUDE.md, are rewritten to the new one.
#
#   scripts/install.sh
#
#   Claude Code   ~/.claude/skills/<skill> and ~/.claude/agents/<agent>.md links,
#                 ~/.claude/rules/coding -> .claude/rules (path-scoped rules),
#                 ~/.claude/CLAUDE.md imports rules/coding/CODING.md
#   Codex         ~/.agents/skills/<skill> links (Cursor reads them too), and the
#                 always-on blocks in ~/.codex/AGENTS.md between sync markers;
#                 sync-rules.mjs --init adds markers for any block the file
#                 lacks and re-syncs them on every run
#   Cursor        reads ~/.claude/skills and ~/.agents/skills on its own
set -euo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"

# Links SRC (a path inside this repo) at DST. A link that already points at SRC
# is left as is. A link that dangles, or whose target ends with SRC's path
# relative to the repo (so it points at a previous location of this repo), is
# replaced. Anything else that exists is not ours and is left alone.
link() {
  local src="$1" dst="$2" name="${2#"${HOME}"/}" target
  if [ -L "$dst" ]; then
    target="$(readlink "$dst")"
    if [ "$target" = "$src" ]; then
      echo "ok       $name"
    elif [ ! -e "$dst" ] || [ "${target%"${src#"$REPO"}"}" != "$target" ]; then
      ln -sfn "$src" "$dst"
      echo "relinked $name (was $target)"
    else
      echo "skipped  $name (already exists and is not ours)"
    fi
  elif [ -e "$dst" ]; then
    echo "skipped  $name (already exists and is not ours)"
  else
    ln -s "$src" "$dst"
    echo "linked   $name"
  fi
}

# Makes FILE import this repo's CODING.md: the exact line is kept, an import of
# a CODING.md from another location (the repo moved) is replaced in place, and
# the line is appended when there is no import at all. Other content is kept.
ensure_import() {
  local file="$1" import="$2" name="${1#"${HOME}"/}" tmp line found=
  local pattern='^@.*/rules/coding/CODING\.md$'
  if [ -f "$file" ] && grep -qxF "$import" "$file"; then
    echo "ok       $name imports coding rules"
  elif [ -f "$file" ] && grep -qE "$pattern" "$file"; then
    tmp="$(mktemp)"
    while IFS= read -r line || [ -n "$line" ]; do
      if [[ "$line" =~ $pattern ]]; then
        if [ -z "$found" ]; then printf '%s\n' "$import"; fi
        found=1
      else
        printf '%s\n' "$line"
      fi
    done < "$file" > "$tmp"
    cat "$tmp" > "$file"
    rm -f "$tmp"
    echo "updated  coding rules import in $name"
  else
    printf '%s\n' "$import" >> "$file"
    echo "added    coding rules import to $name"
  fi
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
ensure_import "${HOME}/.claude/CLAUDE.md" "@${REPO}/rules/coding/CODING.md"

echo "== Codex"
if [ -d "${HOME}/.codex" ]; then
  mkdir -p "${HOME}/.agents/skills"
  for d in "$REPO"/skills/*/; do
    link "${d%/}" "${HOME}/.agents/skills/$(basename "$d")"
  done
  if command -v node >/dev/null; then
    node "$REPO/scripts/sync-rules.mjs" --init "${HOME}/.codex/AGENTS.md"
  else
    echo "skipped  sync of .codex/AGENTS.md (node not installed)"
  fi
else
  echo "skipped  ~/.codex not found"
fi
