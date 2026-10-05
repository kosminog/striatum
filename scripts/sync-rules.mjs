// Writes shared rule blocks from rules/<group>/blocks/*.md into the matching
// marker regions of one or more target files.
//
//   node scripts/sync-rules.mjs [--check] [--rules rules/coding] TARGET...
//
// Markdown targets use <!-- shared:name --> ... <!-- /shared:name -->.
// .jinja targets use {# shared:name -#} ... {#- /shared:name #}, which Copier
// strips on render. Unknown block names fail. --check reports stale targets
// and exits 1 without writing. A block's frontmatter (see lib/blocks.mjs) is
// never inlined; only its body is.
import { readFileSync, writeFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadBlocks, parseArgs } from "./lib/blocks.mjs";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const args = parseArgs(process.argv.slice(2), { flags: ["check"], repoRoot });
if (!args?.targets.length) {
  console.error("usage: sync-rules.mjs [--check] [--rules DIR] TARGET...");
  process.exit(2);
}
const { check, rulesDir, targets } = args;

const blocks = new Map(
  [...loadBlocks(rulesDir)].map(([name, block]) => [name, block.body]),
);

const styles = {
  md: {
    pattern: /^<!-- shared:([a-z-]+) -->\n(?:([\s\S]*?)\n)?<!-- \/shared:\1 -->$/gm,
    wrap: (name, body) => `<!-- shared:${name} -->\n${body}\n<!-- /shared:${name} -->`,
  },
  jinja: {
    pattern: /^\{# shared:([a-z-]+) -#\}\n(?:([\s\S]*?)\n)?\{#- \/shared:\1 #\}$/gm,
    wrap: (name, body) => `{# shared:${name} -#}\n${body}\n{#- /shared:${name} #}`,
  },
};

let failed = false;
for (const target of targets) {
  const path = resolve(process.cwd(), target);
  const style = extname(path) === ".jinja" ? styles.jinja : styles.md;
  const before = readFileSync(path, "utf8");
  const errors = [];
  const stale = [];
  let seen = 0;
  const after = before.replace(style.pattern, (match, name, body = "") => {
    seen++;
    if (!blocks.has(name)) {
      errors.push(`unknown block "${name}"`);
      return match;
    }
    if (body !== blocks.get(name)) stale.push(name);
    return style.wrap(name, blocks.get(name));
  });
  if (!seen) errors.push("no shared markers found");
  if (errors.length) {
    console.error(`${target}: ${errors.join("; ")}`);
    failed = true;
    continue;
  }
  if (!stale.length) {
    console.log(`${target}: up to date (${seen} blocks)`);
    continue;
  }
  if (check) {
    console.error(`${target}: stale blocks: ${stale.join(", ")}`);
    failed = true;
    continue;
  }
  writeFileSync(path, after);
  console.log(`${target}: updated ${stale.join(", ")}`);
}
process.exit(failed ? 1 : 0);
