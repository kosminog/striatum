// Validates the structure of the rule library:
//   - every skills/<name>/ has a SKILL.md with frontmatter whose name is <name>
//   - every agents/<name>.md has frontmatter whose name is <name>
//   - every skill and agent has a non-empty description
//   - every skill description names a non-trigger ("Do not use ..."), as the
//     rule-authoring checklist requires, so neighbouring skills stay apart
//   - every SKILL.md is under the line budget set in AGENTS.md
//
//   node scripts/check-rules.mjs
//
// Prints one line per problem and exits 1 if there are any.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fold, parseFrontmatter } from "./lib/blocks.mjs";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const MAX_SKILL_LINES = 300;
const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const NON_TRIGGER = /\bdo not use\b/i;
const errors = [];
const fail = (file, message) => errors.push(`${file}: ${message}`);

function frontmatter(file) {
  const text = readFileSync(resolve(repoRoot, file), "utf8");
  let parsed;
  try {
    parsed = parseFrontmatter(text, file);
  } catch (error) {
    errors.push(error.message);
    return null;
  }
  if (!parsed.fields) {
    fail(file, "must start with a --- frontmatter line");
    return null;
  }
  const fields = Object.fromEntries([...parsed.fields].map(([k, v]) => [k, fold(v)]));
  return { fields, lineCount: parsed.lineCount };
}

function checkRule(file, expectedName, { maxLines = 0, nonTrigger = false } = {}) {
  const parsed = frontmatter(file);
  if (!parsed) return;
  const { fields, lineCount } = parsed;
  if (fields.name !== expectedName) {
    fail(file, `name must be "${expectedName}", got ${JSON.stringify(fields.name ?? null)}`);
  }
  if (!fields.description) fail(file, "description is required");
  else if (nonTrigger && !NON_TRIGGER.test(fields.description)) {
    fail(file, 'description must name a non-trigger ("Do not use it for ...")');
  }
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
  checkRule(file, name, { maxLines: MAX_SKILL_LINES, nonTrigger: true });
}

const agentsDir = resolve(repoRoot, "agents");
for (const entry of readdirSync(agentsDir).sort()) {
  if (!entry.endsWith(".md")) continue;
  const name = basename(entry, ".md");
  if (!NAME.test(name)) fail(`agents/${entry}`, "file name must be lowercase words joined by hyphens");
  checkRule(`agents/${entry}`, name);
}

for (const error of errors) console.error(error);
if (errors.length) {
  console.error(`${errors.length} problem${errors.length === 1 ? "" : "s"}`);
  process.exit(1);
}
console.log("skills and agents: ok");
