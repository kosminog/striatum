#!/usr/bin/env bash
# Runs the checks CI runs, so a change that passes here passes there:
#   - bash -n and shellcheck on every tracked *.sh
#   - node --check on every tracked *.mjs / *.js
#   - a parse of every tracked *.py
#   - sync-rules.mjs --check: AGENTS.md and rules/coding/CODING.md match their blocks
#   - emit-rules.mjs --check: .claude/rules matches the path-scoped blocks
#   - check-rules.mjs: skill and agent frontmatter, a non-trigger in every skill
#     description, SKILL.md line budget
#   - node --test on tests/*.test.mjs: the block loader, sync-rules.mjs and
#     emit-rules.mjs against temporary rules and targets
#   - tests/install.sh: install.sh against a temporary HOME, including repair
#     after the repo has moved
#
#   scripts/check.sh
#
# When shellcheck is not installed it is skipped with a notice, except in CI
# (CI=true), where it is required.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

status=0
ok()    { echo "ok    $*"; }
fail()  { status=1; echo "FAIL  $*"; }
files() { git ls-files -- "$@"; }

echo "== shell syntax"
while IFS= read -r f; do
  if bash -n "$f"; then ok "$f"; else fail "$f"; fi
done < <(files '*.sh')

echo "== shellcheck"
if command -v shellcheck >/dev/null; then
  if files '*.sh' | xargs shellcheck; then ok "shellcheck"; else fail "shellcheck"; fi
elif [ "${CI:-}" = "true" ]; then
  fail "shellcheck is not installed"
else
  echo "skip  shellcheck not installed (brew install shellcheck)"
fi

echo "== node syntax"
while IFS= read -r f; do
  if node --check "$f"; then ok "$f"; else fail "$f"; fi
done < <(files '*.mjs' '*.js')

echo "== python syntax"
while IFS= read -r f; do
  if python3 -c 'import ast, sys; ast.parse(open(sys.argv[1], encoding="utf-8").read(), sys.argv[1])' "$f"; then
    ok "$f"
  else
    fail "$f"
  fi
done < <(files '*.py')

echo "== rendered coding rules"
if node scripts/sync-rules.mjs --check AGENTS.md rules/coding/CODING.md; then
  ok "AGENTS.md rules/coding/CODING.md"
else
  fail "rendered rules are stale; run: node scripts/sync-rules.mjs AGENTS.md rules/coding/CODING.md"
fi

echo "== path-scoped rule files"
if node scripts/emit-rules.mjs --check claude=.claude/rules; then
  ok ".claude/rules"
else
  fail "path-scoped rule files are stale; run: node scripts/emit-rules.mjs claude=.claude/rules"
fi

echo "== skill and agent frontmatter"
if node scripts/check-rules.mjs; then ok "frontmatter"; else fail "frontmatter"; fi

echo "== node tests"
if node --test "tests/*.test.mjs" >/dev/null 2>&1; then ok "tests/*.test.mjs"; else fail "node --test tests/*.test.mjs (run it for details)"; fi

echo "== install.sh in a temporary HOME"
if tests/install.sh >/dev/null; then ok "tests/install.sh"; else fail "tests/install.sh (run it for details)"; fi

echo
if [ "$status" -eq 0 ]; then echo "all checks passed"; else echo "some checks failed"; fi
exit "$status"
