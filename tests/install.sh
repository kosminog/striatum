#!/usr/bin/env bash
# Runs scripts/install.sh against a temporary HOME and checks that it creates
# the links and import on a fresh run, reports them as ok on a second run, and
# repairs them after the repo has moved: a dangling link, a link to the old
# location and an old-path import are rewritten, while entries that are not
# ours are skipped. Never touches the real home directory.
#
#   tests/install.sh
#
# Reports every failure rather than stopping at the first, so it tracks its
# exit status instead of using -e.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
REPO="$(pwd)"
FAKE_HOME="$(mktemp -d)"
trap 'rm -rf "$FAKE_HOME"' EXIT

status=0
ok()   { echo "ok    $*"; }
fail() { status=1; echo "FAIL  $*"; }

# expect_line OUTPUT LINE: OUTPUT contains a line starting with LINE.
expect_line() {
  if printf '%s\n' "$1" | grep -qF -- "$2"; then ok "$2"; else fail "missing output: $2"; fi
}
# refuse_line OUTPUT TEXT: no line of OUTPUT contains TEXT.
refuse_line() {
  if printf '%s\n' "$1" | grep -qF -- "$2"; then fail "unexpected output: $2"; else ok "no $2"; fi
}
# expect_target LINK PATH: LINK is a symlink to PATH.
expect_target() {
  if [ -L "$1" ] && [ "$(readlink "$1")" = "$2" ]; then
    ok "${1#"${FAKE_HOME}"/} -> ${2#"${REPO}"/}"
  else
    fail "${1#"${FAKE_HOME}"/} -> $(readlink "$1" 2>/dev/null || echo '(not a link)')"
  fi
}
run_install() { HOME="$FAKE_HOME" bash scripts/install.sh 2>&1; }

set -- skills/*/
skill_a="$(basename "${1%/}")"
skill_b="$(basename "${2%/}")"
skill_c="$(basename "${3%/}")"
set -- agents/*.md
agent_a="$(basename "$1")"
CLAUDE_MD="$FAKE_HOME/.claude/CLAUDE.md"
IMPORT="@${REPO}/rules/coding/CODING.md"

echo "== fresh install"
out="$(run_install)" || fail "install.sh exited $?"
expect_line "$out" "linked   .claude/skills/$skill_a"
expect_line "$out" "linked   .claude/agents/$agent_a"
expect_line "$out" "linked   .claude/rules/coding"
expect_line "$out" "added    coding rules import to .claude/CLAUDE.md"
expect_line "$out" "skipped  ~/.codex not found"
expect_target "$FAKE_HOME/.claude/skills/$skill_a" "$REPO/skills/$skill_a"
expect_target "$FAKE_HOME/.claude/rules/coding" "$REPO/.claude/rules"

echo "== second run"
out="$(run_install)" || fail "install.sh exited $?"
expect_line "$out" "ok       .claude/skills/$skill_a"
expect_line "$out" "ok       .claude/CLAUDE.md imports coding rules"
refuse_line "$out" "linked "
refuse_line "$out" "added "
if [ "$(grep -c -- "$IMPORT" "$CLAUDE_MD")" = 1 ]; then
  ok "import appears once"
else
  fail "import appears $(grep -c -- "$IMPORT" "$CLAUDE_MD") times"
fi

echo "== after the repo moved"
OLD_REPO="$FAKE_HOME/old/agents"
mkdir -p "$OLD_REPO/skills/$skill_b" "$FAKE_HOME/elsewhere/skills"
# dangling: the old location is gone
ln -sfn "$FAKE_HOME/gone/skills/$skill_a" "$FAKE_HOME/.claude/skills/$skill_a"
# still resolves, but points at the old location of this repo
ln -sfn "$OLD_REPO/skills/$skill_b" "$FAKE_HOME/.claude/skills/$skill_b"
# a dangling agent link
ln -sfn "$FAKE_HOME/gone/agents/$agent_a" "$FAKE_HOME/.claude/agents/$agent_a"
# the rules link points at the old location
ln -sfn "$OLD_REPO/.claude/rules" "$FAKE_HOME/.claude/rules/coding"
# not ours: a real directory, and a link to an unrelated place
rm "$FAKE_HOME/.claude/skills/$skill_c"
mkdir "$FAKE_HOME/.claude/skills/$skill_c"
ln -sfn "$FAKE_HOME/elsewhere/skills" "$FAKE_HOME/.claude/skills/not-ours"
# an old-path import between other lines
printf '%s\n' "# mine" "@${OLD_REPO}/rules/coding/CODING.md" "" "Keep this." > "$CLAUDE_MD"

out="$(run_install)" || fail "install.sh exited $?"
expect_line "$out" "relinked .claude/skills/$skill_a (was $FAKE_HOME/gone/skills/$skill_a)"
expect_line "$out" "relinked .claude/skills/$skill_b (was $OLD_REPO/skills/$skill_b)"
expect_line "$out" "relinked .claude/agents/$agent_a"
expect_line "$out" "relinked .claude/rules/coding"
expect_line "$out" "skipped  .claude/skills/$skill_c (already exists and is not ours)"
expect_line "$out" "updated  coding rules import in .claude/CLAUDE.md"
refuse_line "$out" "File exists"
expect_target "$FAKE_HOME/.claude/skills/$skill_a" "$REPO/skills/$skill_a"
expect_target "$FAKE_HOME/.claude/skills/$skill_b" "$REPO/skills/$skill_b"
expect_target "$FAKE_HOME/.claude/agents/$agent_a" "$REPO/agents/$agent_a"
expect_target "$FAKE_HOME/.claude/rules/coding" "$REPO/.claude/rules"
expect_target "$FAKE_HOME/.claude/skills/not-ours" "$FAKE_HOME/elsewhere/skills"
if [ -d "$FAKE_HOME/.claude/skills/$skill_c" ] && [ ! -L "$FAKE_HOME/.claude/skills/$skill_c" ]; then
  ok "$skill_c directory left alone"
else
  fail "$skill_c directory was replaced"
fi
expected="$(printf '%s\n' "# mine" "$IMPORT" "" "Keep this.")"
if [ "$(cat "$CLAUDE_MD")" = "$expected" ]; then
  ok ".claude/CLAUDE.md rewritten in place"
else
  fail ".claude/CLAUDE.md content:"; cat "$CLAUDE_MD"
fi

echo "== run after repair"
out="$(run_install)" || fail "install.sh exited $?"
expect_line "$out" "ok       .claude/skills/$skill_a"
expect_line "$out" "ok       .claude/rules/coding"
expect_line "$out" "ok       .claude/CLAUDE.md imports coding rules"
refuse_line "$out" "relinked "
refuse_line "$out" "updated "

echo
if [ "$status" -eq 0 ]; then echo "install.sh tests passed"; else echo "install.sh tests failed"; fi
exit "$status"
