// Unit tests for the block loader and the sync and emit scripts, run with
// `node --test "tests/*.test.mjs"`. Each test builds its own rules directory and targets
// under a temporary folder; the repository's real blocks are never touched.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { fold, list, parseArgs, parseBlock, parseFrontmatter } from "../scripts/lib/blocks.mjs";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const script = (name) => resolve(repoRoot, "scripts", name);

let tmp;
before(() => {
  tmp = mkdtempSync(join(tmpdir(), "striatum-"));
});
after(() => {
  rmSync(tmp, { recursive: true, force: true });
});

// A rules dir with one headed block, one heading-less block and one
// path-scoped block.
function makeRules(name) {
  const dir = join(tmp, name);
  mkdirSync(join(dir, "blocks"), { recursive: true });
  writeFileSync(join(dir, "blocks", "alpha.md"), "# Alpha\n\n- first alpha rule\n");
  writeFileSync(join(dir, "blocks", "beta.md"), "- first beta rule\n- second beta rule\n\n\n");
  writeFileSync(
    join(dir, "blocks", "shell.md"),
    '---\ndescription: Shell conventions\npaths:\n  - "**/*.sh"\n---\n# Shell\n\n- quote everything\n',
  );
  return dir;
}

function run(name, args, cwd = tmp) {
  const result = spawnSync(process.execPath, [script(name), ...args], { cwd, encoding: "utf8" });
  return { status: result.status, out: result.stdout + result.stderr };
}

describe("parseFrontmatter", () => {
  it("returns null fields when the text has no frontmatter", () => {
    const parsed = parseFrontmatter("# Title\n\nbody\n", "f");
    assert.equal(parsed.fields, null);
    assert.equal(parsed.body, "# Title\n\nbody\n");
    assert.equal(parsed.lineCount, 3);
  });

  it("folds continuation lines and keeps list items", () => {
    const text = "---\nname: x\ndescription: one\n  two\npaths:\n  - 'a/**'\n  - b\n\n---\nbody\n";
    const { fields, body, lineCount } = parseFrontmatter(text, "f");
    assert.equal(fold(fields.get("description")), "one two");
    assert.deepEqual(list(fields.get("paths")), ["a/**", "b"]);
    assert.deepEqual(list(fields.get("name")), ["x"]);
    assert.equal(body, "body\n");
    assert.equal(lineCount, 10);
  });

  it("rejects duplicate keys, unclosed and malformed frontmatter", () => {
    assert.throws(() => parseFrontmatter("---\na: 1\na: 2\n---\n", "f"), /duplicate frontmatter key "a"/);
    assert.throws(() => parseFrontmatter("---\na: 1\n", "f"), /not closed/);
    assert.throws(() => parseFrontmatter("---\nnot a field\n---\n", "f"), /malformed frontmatter line/);
  });
});

describe("parseBlock", () => {
  it("reads description and paths, and trims the body", () => {
    const block = parseBlock('---\ndescription: "Quoted"\npaths: a, "b"\n---\n# H\n\n- rule\n\n\n', "f");
    assert.deepEqual(block, { description: "Quoted", paths: ["a", "b"], body: "# H\n\n- rule" });
  });

  it("treats a block without frontmatter as always-on", () => {
    assert.deepEqual(parseBlock("- rule\n", "f"), { description: "", paths: [], body: "- rule" });
  });

  it("rejects unknown keys", () => {
    assert.throws(() => parseBlock("---\nglobs: x\n---\nbody\n", "f"), /unknown frontmatter key "globs"/);
  });
});

describe("parseArgs", () => {
  it("separates flags, --rules and targets", () => {
    const args = parseArgs(["--check", "a.md", "--rules", "custom", "b.md"], { flags: ["check", "init"], repoRoot: "/r" });
    assert.deepEqual(args, { check: true, init: false, rulesDir: resolve("/r", "custom"), targets: ["a.md", "b.md"] });
  });

  it("defaults --rules to rules/coding", () => {
    assert.equal(parseArgs([], { repoRoot: "/r" }).rulesDir, resolve("/r", "rules/coding"));
  });

  it("returns null for an unknown flag or a --rules without a value", () => {
    assert.equal(parseArgs(["--nope"], { flags: ["check"], repoRoot: "/r" }), null);
    assert.equal(parseArgs(["a.md", "--rules"], { flags: [], repoRoot: "/r" }), null);
  });
});

describe("sync-rules.mjs", () => {
  let rules;
  before(() => {
    rules = makeRules("sync-rules");
  });

  it("fills markers, then reports the target up to date", () => {
    const target = join(tmp, "sync.md");
    writeFileSync(target, "# Mine\n\n<!-- shared:alpha -->\n<!-- /shared:alpha -->\n");
    let r = run("sync-rules.mjs", ["--rules", rules, target]);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /updated alpha/);
    assert.equal(
      readFileSync(target, "utf8"),
      "# Mine\n\n<!-- shared:alpha -->\n# Alpha\n\n- first alpha rule\n<!-- /shared:alpha -->\n",
    );
    r = run("sync-rules.mjs", ["--rules", rules, target]);
    assert.equal(r.status, 0);
    assert.match(r.out, /up to date \(1 blocks\)/);
  });

  it("--check fails on a stale target without writing", () => {
    const target = join(tmp, "stale.md");
    const before = "<!-- shared:alpha -->\nold\n<!-- /shared:alpha -->\n";
    writeFileSync(target, before);
    const r = run("sync-rules.mjs", ["--check", "--rules", rules, target]);
    assert.equal(r.status, 1);
    assert.match(r.out, /stale blocks: alpha/);
    assert.equal(readFileSync(target, "utf8"), before);
  });

  it("fails on unknown blocks and on targets without markers", () => {
    const unknown = join(tmp, "unknown.md");
    writeFileSync(unknown, "<!-- shared:gamma -->\n<!-- /shared:gamma -->\n");
    let r = run("sync-rules.mjs", ["--rules", rules, unknown]);
    assert.equal(r.status, 1);
    assert.match(r.out, /unknown block "gamma"/);
    const none = join(tmp, "none.md");
    writeFileSync(none, "# Nothing here\n");
    r = run("sync-rules.mjs", ["--rules", rules, none]);
    assert.equal(r.status, 1);
    assert.match(r.out, /no shared markers found/);
  });

  it("uses Jinja comment markers for .jinja targets", () => {
    const target = join(tmp, "AGENTS.md.jinja");
    writeFileSync(target, "{# shared:beta -#}\n{#- /shared:beta #}\n");
    const r = run("sync-rules.mjs", ["--rules", rules, target]);
    assert.equal(r.status, 0, r.out);
    assert.equal(
      readFileSync(target, "utf8"),
      "{# shared:beta -#}\n- first beta rule\n- second beta rule\n{#- /shared:beta #}\n",
    );
  });

  it("--init appends markers for missing always-on blocks only, with a heading when the block has none", () => {
    const target = join(tmp, "init.md");
    writeFileSync(target, "# Mine\n\n<!-- shared:alpha -->\n<!-- /shared:alpha -->\n");
    const r = run("sync-rules.mjs", ["--init", "--rules", rules, target]);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /added markers for beta/);
    const text = readFileSync(target, "utf8");
    assert.ok(text.startsWith("# Mine\n"), "existing content kept");
    assert.doesNotMatch(text, /# Coding rules/, "no preamble when markers already existed");
    assert.match(text, /\n# Beta\n\n<!-- shared:beta -->\n- first beta rule\n- second beta rule\n<!-- \/shared:beta -->\n$/);
    assert.doesNotMatch(text, /shared:shell/, "path-scoped blocks are not appended");
  });

  it("--init creates a missing target under a preamble", () => {
    const target = join(tmp, "fresh.md");
    const r = run("sync-rules.mjs", ["--init", "--rules", rules, target]);
    assert.equal(r.status, 0, r.out);
    const text = readFileSync(target, "utf8");
    assert.ok(text.startsWith("# Coding rules\n"));
    assert.match(text, /<!-- shared:alpha -->\n# Alpha\n/);
    assert.match(text, /# Beta\n\n<!-- shared:beta -->/);
  });

  it("--init --check reports missing markers without writing", () => {
    const target = join(tmp, "init-check.md");
    const before = "<!-- shared:alpha -->\n# Alpha\n\n- first alpha rule\n<!-- /shared:alpha -->\n";
    writeFileSync(target, before);
    const r = run("sync-rules.mjs", ["--init", "--check", "--rules", rules, target]);
    assert.equal(r.status, 1);
    assert.match(r.out, /missing markers: beta/);
    assert.equal(readFileSync(target, "utf8"), before);
  });

  it("prints usage without targets or with an unknown flag", () => {
    assert.equal(run("sync-rules.mjs", []).status, 2);
    assert.equal(run("sync-rules.mjs", ["--bogus", "x.md"]).status, 2);
  });
});

describe("emit-rules.mjs", () => {
  let rules;
  before(() => {
    rules = makeRules("emit-rules");
  });

  it("writes path-scoped blocks in each format and skips always-on ones", () => {
    const out = join(tmp, "emit");
    const r = run("emit-rules.mjs", [
      "--rules", rules,
      `claude=${join(out, "claude")}`, `cursor=${join(out, "cursor")}`, `copilot=${join(out, "copilot")}`,
    ]);
    assert.equal(r.status, 0, r.out);
    const claude = readFileSync(join(out, "claude", "shell.md"), "utf8");
    assert.match(claude, /^---\npaths:\n {2}- "\*\*\/\*\.sh"\n---\n<!-- Generated from .*blocks\/shell\.md by scripts\/emit-rules\.mjs\./);
    assert.match(claude, /\n# Shell\n\n- quote everything\n$/);
    const cursor = readFileSync(join(out, "cursor", "shell.mdc"), "utf8");
    assert.match(cursor, /^---\ndescription: "Shell conventions"\nglobs: \*\*\/\*\.sh\nalwaysApply: false\n---\n/);
    const copilot = readFileSync(join(out, "copilot", "shell.instructions.md"), "utf8");
    assert.match(copilot, /^---\napplyTo: "\*\*\/\*\.sh"\n---\n/);
    assert.equal(existsSync(join(out, "claude", "alpha.md")), false);
  });

  it("--check reports missing and stale files without writing", () => {
    const dir = join(tmp, "emit-check");
    let r = run("emit-rules.mjs", ["--check", "--rules", rules, `claude=${dir}`]);
    assert.equal(r.status, 1);
    assert.match(r.out, /missing: shell\.md/);
    assert.equal(existsSync(dir), false);
    mkdirSync(dir);
    writeFileSync(join(dir, "shell.md"), "old");
    r = run("emit-rules.mjs", ["--check", "--rules", rules, `claude=${dir}`]);
    assert.equal(r.status, 1);
    assert.match(r.out, /stale: shell\.md/);
    assert.equal(readFileSync(join(dir, "shell.md"), "utf8"), "old");
  });

  it("removes orphaned marked files and leaves unmarked files alone", () => {
    const dir = join(tmp, "emit-orphans");
    mkdirSync(dir);
    writeFileSync(join(dir, "gone.md"), "---\npaths: x\n---\n<!-- Generated by scripts/emit-rules.mjs. -->\n");
    writeFileSync(join(dir, "mine.md"), "# hand-written\n");
    const r = run("emit-rules.mjs", ["--rules", rules, `claude=${dir}`]);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /wrote shell\.md; removed gone\.md/);
    assert.equal(existsSync(join(dir, "gone.md")), false);
    assert.equal(readFileSync(join(dir, "mine.md"), "utf8"), "# hand-written\n");
  });

  it("rejects unknown formats and malformed targets", () => {
    let r = run("emit-rules.mjs", ["--rules", rules, `zed=${join(tmp, "zed")}`]);
    assert.equal(r.status, 1);
    assert.match(r.out, /unknown format "zed"/);
    r = run("emit-rules.mjs", ["--rules", rules, "no-equals"]);
    assert.equal(r.status, 2);
    assert.equal(run("emit-rules.mjs", []).status, 2);
  });
});
