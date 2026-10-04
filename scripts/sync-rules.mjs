// Writes shared rule blocks from rules/<group>/blocks/*.md into the matching
// marker regions of one or more target files.
//
//   node scripts/sync-rules.mjs [--check] [--rules rules/coding] TARGET...
//
// Markdown targets use <!-- shared:name --> ... <!-- /shared:name -->.
// .jinja targets use {# shared:name -#} ... {#- /shared:name #}, which Copier
// strips on render. Unknown block names fail. --check reports stale targets
// and exits 1 without writing.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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

if (!targets.length) {
  console.error("usage: sync-rules.mjs [--check] [--rules DIR] TARGET...");
  process.exit(2);
}

const blocks = new Map(
  readdirSync(resolve(rulesDir, "blocks"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => [
      basename(f, ".md"),
      readFileSync(resolve(rulesDir, "blocks", f), "utf8").replace(/\s+$/, ""),
    ]),
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
