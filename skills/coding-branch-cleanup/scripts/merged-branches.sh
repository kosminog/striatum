#!/usr/bin/env bash
# Lists local branches and whether their changes are already in the default
# branch, including squash merges. Prints a table; never deletes anything.
#
#   merged-branches.sh [default-branch]
set -euo pipefail

default="${1:-}"
if [ -z "$default" ]; then
  default="$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null | sed 's|^origin/||' || true)"
fi
if [ -z "$default" ]; then
  for c in main master; do
    if git show-ref --verify --quiet "refs/heads/$c"; then
      default="$c"
      break
    fi
  done
fi
if [ -z "$default" ]; then
  echo "cannot determine default branch; pass it as the first argument" >&2
  exit 2
fi

git fetch --prune --quiet origin 2>/dev/null || true
current="$(git branch --show-current || true)"
worktrees="$(git worktree list --porcelain | awk '/^branch /{sub("refs/heads/","",$2); print $2}')"

printf "%-45s %-16s %-8s %s\n" BRANCH STATUS REMOTE NOTE
while IFS= read -r b; do
  if [ "$b" = "$default" ]; then
    continue
  fi
  if git merge-base --is-ancestor "$b" "$default"; then
    status="merged"
  else
    base="$(git merge-base "$default" "$b")"
    tree="$(git rev-parse "$b^{tree}")"
    squash="$(git commit-tree "$tree" -p "$base" -m "_")"
    if [ "$(git cherry "$default" "$squash" | cut -c1)" = "-" ]; then
      status="squash-merged"
    else
      ahead="$(git rev-list --count "$default..$b")"
      status="unmerged (+$ahead)"
    fi
  fi
  remote="gone"
  if git show-ref --verify --quiet "refs/remotes/origin/$b"; then
    remote="present"
  fi
  note=""
  if printf '%s\n' "$worktrees" | grep -qx "$b"; then
    note="checked out in worktree"
  fi
  if [ "$b" = "$current" ]; then
    note="current branch"
  fi
  printf "%-45s %-16s %-8s %s\n" "$b" "$status" "$remote" "$note"
done < <(git for-each-ref --format='%(refname:short)' refs/heads/)
