#!/usr/bin/env node
// CLI of the published package. Each command runs the matching script in
// scripts/, which defaults to this package's own rule blocks, so a project that
// installs the package can sync and emit rules without cloning the repo.
//
//   striatum sync [--check] [--init] [--rules DIR] TARGET...  scripts/sync-rules.mjs
//   striatum emit [--check] [--rules DIR] FORMAT=DIR...       scripts/emit-rules.mjs
//   striatum install                                          scripts/install.sh
//
// install links skills, agents and rules into the tool directories under $HOME
// and points them at this package, so run it from a global install, never from
// an npx cache that may be pruned.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const commands = {
  sync: "scripts/sync-rules.mjs",
  emit: "scripts/emit-rules.mjs",
  install: "scripts/install.sh",
};

const usage = [
  "usage: striatum <command> [args]",
  "",
  "  sync [--check] [--init] [--rules DIR] TARGET...  write rule blocks into marker regions;",
  "                                                   --init adds markers for blocks the file lacks",
  "  emit [--check] [--rules DIR] FORMAT=DIR...       write path-scoped blocks as tool rule files",
  "  install                                          link skills, agents and rules for the tools on this machine",
].join("\n");

const [command, ...args] = process.argv.slice(2);
if (!command || command === "--help" || command === "-h") {
  console.log(usage);
  process.exit(command ? 0 : 2);
}
if (!(command in commands)) {
  console.error(`striatum: unknown command "${command}"\n\n${usage}`);
  process.exit(2);
}

const script = fileURLToPath(new URL(`../${commands[command]}`, import.meta.url));
const shell = script.endsWith(".sh");
const result = spawnSync(shell ? "bash" : process.execPath, [script, ...args], {
  stdio: "inherit",
});
if (result.error) {
  console.error(`striatum: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
