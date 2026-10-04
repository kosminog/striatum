#!/usr/bin/env bash
# Symlink every skill in this repo into the user-level skills directory and every
# agent into the user-level agents directory. Existing entries that are not links
# to this repo are left alone and reported.
set -euo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"
SKILLS_DST="${HOME}/.claude/skills"
AGENTS_DST="${HOME}/.claude/agents"
mkdir -p "$SKILLS_DST" "$AGENTS_DST"

link() {
  local src="$1" dst="$2"
  if [ -L "$dst" ] && [ "$(readlink "$dst")" = "$src" ]; then
    echo "ok       $(basename "$dst")"
  elif [ -e "$dst" ]; then
    echo "skipped  $(basename "$dst") (already exists and is not ours)"
  else
    ln -s "$src" "$dst"
    echo "linked   $(basename "$dst")"
  fi
}

for d in "$REPO"/skills/*/; do
  link "${d%/}" "$SKILLS_DST/$(basename "$d")"
done
for f in "$REPO"/agents/*.md; do
  link "$f" "$AGENTS_DST/$(basename "$f")"
done
