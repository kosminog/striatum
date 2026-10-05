// Writes shared rule blocks from rules/<group>/blocks/*.md into the matching
// marker regions of one or more target files.
//
//   node scripts/sync-rules.mjs [--check] [--init] [--rules rules/coding] TARGET...
//
// Markdown targets use <!-- shared:name --> ... <!-- /shared:name -->.
// .jinja targets use {# shared:name -#} ... {#- /shared:name #}, which Copier
// strips on render. Unknown block names fail. --check reports stale targets
// and exits 1 without writing. A block's frontmatter (see lib/blocks.mjs) is
// never inlined; only its body is.
//
// --init first appends an empty marker pair for every always-on block the
// target lacks, creating the target under a short preamble when it does not
// exist, so a file picks up new blocks as they are added; with --check it
// reports the missing markers instead. A block whose body does not start with
// a heading gets one made from its name above the markers, as CODING.md does.
// Existing content is kept.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadBlocks, parseArgs } from "./lib/blocks.mjs";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const args = parseArgs(process.argv.slice(2), { flags: ["check", "init"], repoRoot });
if (!args?.targets.length) {
  console.error("usage: sync-rules.mjs [--check] [--init] [--rules DIR] TARGET...");
  process.exit(2);
}
const { check, init, rulesDir, targets } = args;

const all = loadBlocks(rulesDir);
const blocks = new Map([...all].map(([name, block]) => [name, block.body]));
const alwaysOn = [...all].filter(([, block]) => !block.paths.length).map(([name]) => name);
const heading = (name) => `# ${name[0].toUpperCase()}${name.slice(1).replace(/-/g, " ")}`;
const markers = (style, name) =>
  blocks.get(name).startsWith("#")
    ? style.empty(name)
    : `${heading(name)}\n\n${style.empty(name)}`;

const PREAMBLE = [
  "# Coding rules",
  "",
  "Synced from the striatum rule library (scripts/sync-rules.mjs); edit the",
  "blocks there and re-sync.",
].join("\n");

const styles = {
  md: {
    pattern: /^<!-- shared:([a-z-]+) -->\n(?:([\s\S]*?)\n)?<!-- \/shared:\1 -->$/gm,
    wrap: (name, body) => `<!-- shared:${name} -->\n${body}\n<!-- /shared:${name} -->`,
    empty: (name) => `<!-- shared:${name} -->\n<!-- /shared:${name} -->`,
  },
  jinja: {
    pattern: /^\{# shared:([a-z-]+) -#\}\n(?:([\s\S]*?)\n)?\{#- \/shared:\1 #\}$/gm,
    wrap: (name, body) => `{# shared:${name} -#}\n${body}\n{#- /shared:${name} #}`,
    empty: (name) => `{# shared:${name} -#}\n{#- /shared:${name} #}`,
  },
};

let failed = false;
for (const target of targets) {
  const path = resolve(process.cwd(), target);
  const style = extname(path) === ".jinja" ? styles.jinja : styles.md;
  let before = existsSync(path) ? readFileSync(path, "utf8") : "";
  if (init) {
    const present = new Set([...before.matchAll(style.pattern)].map((m) => m[1]));
    const missing = alwaysOn.filter((name) => !present.has(name));
    if (missing.length && check) {
      console.error(`${target}: missing markers: ${missing.join(", ")}`);
      failed = true;
      continue;
    }
    if (missing.length) {
      const parts = present.size ? [] : [PREAMBLE];
      parts.push(...missing.map((name) => markers(style, name)));
      const sep = before ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
      before = `${before}${sep}${parts.join("\n\n")}\n`;
      writeFileSync(path, before);
      console.log(`${target}: added markers for ${missing.join(", ")}`);
    }
  }
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
