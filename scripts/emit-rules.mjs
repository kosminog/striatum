// Writes every path-scoped block (one with `paths` in its frontmatter) as a
// rule file in the format a tool reads for file-scoped instructions:
//
//   node scripts/emit-rules.mjs [--check] [--rules rules/coding] FORMAT=DIR...
//
//   claude=.claude/rules           <name>.md                paths: list
//   cursor=.cursor/rules           <name>.mdc               globs + alwaysApply
//   copilot=.github/instructions   <name>.instructions.md   applyTo
//
// Always-on blocks are not emitted; they belong inline in AGENTS.md through
// sync-rules.mjs. Every emitted file carries a marker comment. A marked file
// whose block no longer exists, or lost its paths, is removed; files without
// the marker are never touched. --check reports missing, stale and orphaned
// files and exits 1 without writing.
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadBlocks } from "./lib/blocks.mjs";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);
const check = args.includes("--check");
const rulesIdx = args.indexOf("--rules");
const rulesDir = resolve(
  repoRoot,
  rulesIdx === -1 ? "rules/coding" : args[rulesIdx + 1],
);
const targets = args.filter(
  (a, i) => !a.startsWith("--") && !(rulesIdx !== -1 && i === rulesIdx + 1),
);

const quote = (s) => JSON.stringify(s);
const formats = {
  claude: {
    ext: ".md",
    frontmatter: (b) => ["paths:", ...b.paths.map((p) => `  - ${quote(p)}`)],
  },
  cursor: {
    ext: ".mdc",
    frontmatter: (b) => [
      b.description ? `description: ${quote(b.description)}` : null,
      `globs: ${b.paths.join(", ")}`,
      "alwaysApply: false",
    ].filter(Boolean),
  },
  copilot: {
    ext: ".instructions.md",
    frontmatter: (b) => [`applyTo: ${quote(b.paths.join(","))}`],
  },
};

if (!targets.length || !targets.every((t) => /^[a-z]+=.+$/.test(t))) {
  console.error("usage: emit-rules.mjs [--check] [--rules DIR] FORMAT=DIR...");
  console.error(`formats: ${Object.keys(formats).join(", ")}`);
  process.exit(2);
}

const MARKER = "by scripts/emit-rules.mjs";
const scoped = [...loadBlocks(rulesDir)].filter(([, b]) => b.paths.length);

function render(format, name, block) {
  const source = relative(repoRoot, block.file);
  return [
    "---",
    ...format.frontmatter(block),
    "---",
    `<!-- Generated from ${source} ${MARKER}. Edit the block, then re-run it. -->`,
    "",
    block.body,
    "",
  ].join("\n");
}

let failed = false;
for (const target of targets) {
  const [formatName, dirArg] = target.split(/=(.*)/s);
  const format = formats[formatName];
  if (!format) {
    console.error(`${target}: unknown format "${formatName}"`);
    failed = true;
    continue;
  }
  const dir = resolve(process.cwd(), dirArg);
  const expected = new Map(
    scoped.map(([name, block]) => [`${name}${format.ext}`, render(format, name, block)]),
  );
  const missing = [];
  const stale = [];
  const wrote = [];
  for (const [file, content] of expected) {
    const path = join(dir, file);
    if (!existsSync(path)) missing.push(file);
    else if (readFileSync(path, "utf8") !== content) stale.push(file);
    else continue;
    if (!check) {
      mkdirSync(dir, { recursive: true });
      writeFileSync(path, content);
      wrote.push(file);
    }
  }
  const orphaned = existsSync(dir)
    ? readdirSync(dir).filter((f) => {
        const path = join(dir, f);
        return (
          !expected.has(f) &&
          f.endsWith(format.ext) &&
          readFileSync(path, "utf8").includes(MARKER)
        );
      })
    : [];
  if (!check) for (const f of orphaned) unlinkSync(join(dir, f));

  const problems = [
    missing.length && `missing: ${missing.join(", ")}`,
    stale.length && `stale: ${stale.join(", ")}`,
    orphaned.length && `orphaned: ${orphaned.join(", ")}`,
  ].filter(Boolean);
  if (!problems.length) {
    console.log(`${target}: up to date (${expected.size} file${expected.size === 1 ? "" : "s"})`);
  } else if (check) {
    console.error(`${target}: ${problems.join("; ")}`);
    failed = true;
  } else {
    const actions = [
      wrote.length && `wrote ${wrote.join(", ")}`,
      orphaned.length && `removed ${orphaned.join(", ")}`,
    ].filter(Boolean);
    console.log(`${target}: ${actions.join("; ")}`);
  }
}
process.exit(failed ? 1 : 0);
