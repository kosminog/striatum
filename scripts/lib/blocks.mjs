// Loads rule blocks from rules/<group>/blocks/*.md.
//
// A block may begin with frontmatter between --- lines holding `description`
// (one line) and `paths` (a YAML list of globs, or a comma-separated string).
// The body is everything after it, trimmed of trailing whitespace. A block
// without `paths` is always-on and belongs inline in AGENTS.md; a block with
// `paths` is path-scoped and is emitted as a tool rule file instead.
import { readdirSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const unquote = (s) => s.trim().replace(/^(["'])(.*)\1$/, "$2");
const splitList = (s) =>
  s.replace(/^\[|\]$/g, "").split(",").map(unquote).filter(Boolean);

export function parseBlock(text, file) {
  let description = "";
  let paths = [];
  let body = text;
  if (text.startsWith("---\n")) {
    const end = text.indexOf("\n---\n", 4);
    if (end === -1) throw new Error(`${file}: frontmatter is not closed with ---`);
    body = text.slice(end + 5);
    let key = null;
    for (const line of text.slice(4, end).split("\n")) {
      const kv = /^([a-z][a-z0-9_-]*):\s*(.*)$/.exec(line);
      if (kv) {
        key = kv[1];
        const value = kv[2].trim();
        if (key === "description") description = unquote(value);
        else if (key === "paths") paths = value ? splitList(value) : [];
        else throw new Error(`${file}: unknown frontmatter key "${key}"`);
      } else if (key === "paths" && /^\s*-\s+\S/.test(line)) {
        paths.push(unquote(line.replace(/^\s*-\s+/, "")));
      } else if (line.trim()) {
        throw new Error(`${file}: malformed frontmatter line ${JSON.stringify(line)}`);
      }
    }
  }
  return { description, paths, body: body.replace(/\s+$/, "") };
}

export function loadBlocks(rulesDir) {
  const dir = resolve(rulesDir, "blocks");
  return new Map(
    readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .sort()
      .map((f) => [
        basename(f, ".md"),
        { file: resolve(dir, f), ...parseBlock(readFileSync(resolve(dir, f), "utf8"), f) },
      ]),
  );
}
