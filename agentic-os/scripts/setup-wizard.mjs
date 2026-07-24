#!/usr/bin/env node
// Agentic OS setup wizard — writes agentic-os.config.json interactively.
// Run with: npm run setup
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });
const root = process.cwd();
const configPath = path.join(root, "agentic-os.config.json");

function expandHome(p) {
  if (p === "~") return os.homedir();
  if (p.startsWith("~/")) return path.join(os.homedir(), p.slice(2));
  return p;
}

const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;

async function ask(question, fallback) {
  const answer = (await rl.question(`${question} ${dim(`(${fallback})`)} `)).trim();
  return answer || fallback;
}

console.log(`\n${cyan("◆ Agentic OS — setup wizard")}\n`);

const defaults = fs.existsSync(configPath)
  ? JSON.parse(fs.readFileSync(configPath, "utf8"))
  : {};

const vaultPath = await ask(
  "Path to your Obsidian vault:",
  defaults.vaultPath || path.join(os.homedir(), "Documents", "ObsidianVault"),
);
const obsidianFolder = await ask(
  "Folder name inside the vault:",
  defaults.obsidianFolder || "Agentic OS",
);
const claudeCli = await ask(
  "Claude Code CLI command:",
  defaults.claudeCli || "claude",
);

const config = { vaultPath, obsidianFolder, claudeCli, claudeExtraArgs: [] };
fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");

// Sanity check the vault path.
const resolved = expandHome(vaultPath);
const exists = fs.existsSync(resolved);

console.log(`\n${green("✓")} Wrote ${path.relative(root, configPath)}`);
console.log(
  exists
    ? `${green("✓")} Vault found at ${resolved}`
    : `\x1b[33m!\x1b[0m Vault not found at ${resolved} — it will be created on first save.`,
);
console.log(`\nNext:  ${cyan("npm run dev")}  →  http://localhost:3000\n`);

await rl.close();
