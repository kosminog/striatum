// Loads rule blocks from rules/<group>/blocks/*.md, and holds the two parsers
// every script in scripts/ shares: markdown frontmatter and command-line
// arguments.
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

// Parses a leading --- block as flat `key: value` pairs. Each field is the
// list of its lines: the value on the key's own line first, then every
// indented continuation line, trimmed. Blank lines are skipped; anything else
// is malformed. Returns `fields: null` when the text has no frontmatter.
// `lineCount` is the number of lines in the whole text.
export function parseFrontmatter(text, file) {
  const lines = text.split("\n");
  const lineCount = lines.length - (text.endsWith("\n") ? 1 : 0);
  if (lines[0] !== "---") return { fields: null, body: text, lineCount };
  const end = lines.indexOf("---", 1);
  if (end === -1) throw new Error(`${file}: frontmatter is not closed with ---`);
  const fields = new Map();
  let last = null;
  for (const line of lines.slice(1, end)) {
    const kv = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
    if (kv) {
      if (fields.has(kv[1])) throw new Error(`${file}: duplicate frontmatter key "${kv[1]}"`);
      last = [kv[2].trim()];
      fields.set(kv[1], last);
    } else if (last && /^\s+\S/.test(line)) {
      last.push(line.trim());
    } else if (line.trim()) {
      throw new Error(`${file}: malformed frontmatter line ${JSON.stringify(line)}`);
    }
  }
  return { fields, body: lines.slice(end + 1).join("\n"), lineCount };
}

// A field's lines joined into one string, so a folded description reads as
// one sentence.
export const fold = (field) => (field ?? []).join(" ").trim();

// A field as a list: `key: a, b` or `key: [a, b]` on one line, or a YAML list
// of `- item` continuation lines.
export const list = (field) => {
  if (!field) return [];
  const [value, ...rest] = field;
  if (value) return splitList(value);
  return rest.filter((l) => /^-\s+\S/.test(l)).map((l) => unquote(l.replace(/^-\s+/, "")));
};

export function parseBlock(text, file) {
  const { fields, body } = parseFrontmatter(text, file);
  let description = "";
  let paths = [];
  for (const [key, field] of fields ?? []) {
    if (key === "description") description = unquote(fold(field));
    else if (key === "paths") paths = list(field);
    else throw new Error(`${file}: unknown frontmatter key "${key}"`);
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

// Parses `[--flag...] [--rules DIR] TARGET...`. `flags` names the boolean
// flags the script accepts; each comes back as a property. `--rules` is
// resolved against `repoRoot`, defaulting to rules/coding. Returns null for an
// unknown flag or a `--rules` without a value, so the caller prints usage.
export function parseArgs(argv, { flags = [], repoRoot }) {
  const result = { rulesDir: resolve(repoRoot, "rules/coding"), targets: [] };
  for (const flag of flags) result[flag] = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--rules") {
      if (i + 1 >= argv.length) return null;
      result.rulesDir = resolve(repoRoot, argv[++i]);
    } else if (arg.startsWith("--")) {
      const flag = arg.slice(2);
      if (!flags.includes(flag)) return null;
      result[flag] = true;
    } else {
      result.targets.push(arg);
    }
  }
  return result;
}
