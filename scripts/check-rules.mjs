// Validates the structure of the rule library:
//   - every skills/<name>/ has a SKILL.md with frontmatter whose name is <name>
//   - every agents/<name>.md has frontmatter whose name is <name>
//   - every skill and agent has a non-empty description
//   - every SKILL.md is under the line budget set in AGENTS.md
//
//   node scripts/check-rules.mjs
//
// Prints one line per problem and exits 1 if there are any.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const MAX_SKILL_LINES = 300;
const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const errors = [];
const fail = (file, message) => errors.push(`${file}: ${message}`);

// Parses the leading --- block as flat key: value pairs. Indented lines continue
// the previous value, so a folded description still parses.
function frontmatter(file) {
  const text = readFileSync(resolve(repoRoot, file), "utf8");
  const lines = text.split("\n");
  if (lines[0] !== "---") {
    fail(file, "must start with a --- frontmatter line");
    return null;
  }
  const end = lines.indexOf("---", 1);
  if (end === -1) {
    fail(file, "frontmatter is not closed with ---");
    return null;
  }
  const fields = {};
  let last = null;
  for (const line of lines.slice(1, end)) {
    const kv = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
    if (kv) {
      if (kv[1] in fields) fail(file, `duplicate frontmatter key "${kv[1]}"`);
      fields[kv[1]] = kv[2].trim();
      last = kv[1];
    } else if (last && /^\s+\S/.test(line)) {
      fields[last] = `${fields[last]} ${line.trim()}`.trim();
    } else {
      fail(file, `malformed frontmatter line ${JSON.stringify(line)}`);
    }
  }
  const lineCount = lines.length - (text.endsWith("\n") ? 1 : 0);
  return { fields, lineCount };
}

function checkRule(file, expectedName, maxLines) {
  const parsed = frontmatter(file);
  if (!parsed) return;
  const { fields, lineCount } = parsed;
  if (fields.name !== expectedName) {
    fail(file, `name must be "${expectedName}", got ${JSON.stringify(fields.name ?? null)}`);
  }
  if (!fields.description) fail(file, "description is required");
  if (maxLines && lineCount > maxLines) {
    fail(file, `${lineCount} lines; the limit is ${maxLines} (move material to references/)`);
  }
}

const skillsDir = resolve(repoRoot, "skills");
for (const name of readdirSync(skillsDir).sort()) {
  const dir = join(skillsDir, name);
  if (!statSync(dir).isDirectory()) continue;
  const file = `skills/${name}/SKILL.md`;
  if (!NAME.test(name)) fail(`skills/${name}`, "folder name must be lowercase words joined by hyphens");
  if (!existsSync(join(dir, "SKILL.md"))) {
    fail(file, "missing");
    continue;
  }
  checkRule(file, name, MAX_SKILL_LINES);
}

const agentsDir = resolve(repoRoot, "agents");
for (const entry of readdirSync(agentsDir).sort()) {
  if (!entry.endsWith(".md")) continue;
  const name = basename(entry, ".md");
  if (!NAME.test(name)) fail(`agents/${entry}`, "file name must be lowercase words joined by hyphens");
  checkRule(`agents/${entry}`, name, 0);
}

for (const error of errors) console.error(error);
if (errors.length) {
  console.error(`${errors.length} problem${errors.length === 1 ? "" : "s"}`);
  process.exit(1);
}
console.log("skills and agents: ok");
