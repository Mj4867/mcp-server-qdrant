# ✳️ Agentic OS — Mission Control

A **local-first, dopamine-inducing operating system** for driving Claude and
your whole AI agent fleet from one screen. Dark neon-sovereignty theme, real
chat-app feel, voice input everywhere, and everything auto-saved to Obsidian as
markdown. No cloud. No accounts. Runs on `http://localhost:3000`.

Built with **Next.js 14 · Tailwind CSS · Framer Motion**.

---

## ✨ What's inside

| Page | What it does |
| --- | --- |
| **Mission Control** (`/`) | Live status grid for every agent (🟢 LIVE / 🟡 BUSY / 🟡 DEGRADED / 🔴 OFFLINE), fleet stats, clock, Obsidian link status. |
| **Agent pages** (`/agents/[slug]`) | A real chat app per agent — avatars, typing indicator, message history, voice input. Talks to the **Claude Code CLI bridge** or a gateway (OpenClaw / Hermes). |
| **Goals** (`/goals`) | Checkbox tasks with a progress ring. Every add & completion is saved to your vault. |
| **Journal** (`/journal`) | One markdown file per day. Type or speak your log. |

Every chat, goal, and journal entry is **auto-saved to Obsidian** as markdown,
one file per day, under `<vault>/Agentic OS/`.

---

## 🚀 Quick start

```bash
cd agentic-os
npm install
npm run setup      # interactive: point it at your Obsidian vault
npm run dev        # → http://localhost:3000
```

No vault yet? Skip `npm run setup` and just `npm run dev` — everything works;
saving is simply skipped until you set a vault path.

---

## ⚙️ Configuration

Two ways, checked in this order (env wins):

**1. `.env`** (copy from `.env.example`)

```bash
OBSIDIAN_VAULT_PATH=~/Documents/ObsidianVault
OBSIDIAN_FOLDER=Agentic OS
CLAUDE_CLI=claude
AGENTIC_OS_DEMO=0        # set to 1 to force every agent LIVE (screenshots)
```

**2. `agentic-os.config.json`** (copy from `agentic-os.config.example.json`, or run `npm run setup`)

```json
{
  "vaultPath": "~/Documents/ObsidianVault",
  "obsidianFolder": "Agentic OS",
  "claudeCli": "claude",
  "claudeExtraArgs": []
}
```

`~` expands to your home directory. Both files are git-ignored.

---

## 🤖 Wiring in real agents

Agents are defined in [`lib/agents.ts`](./lib/agents.ts). Each has a `kind` that
decides how the chat bridge routes messages:

- **`claude-cli`** — spawns the Claude Code CLI (`claude -p "<msg>" --output-format json`).
  Make sure `claude` is installed and you've logged in once.
- **`openclaw` / `hermes` / `fleet`** — POSTs `{ agent, message }` to the agent's
  `endpoint` and reads back `reply` / `result` / `text`. Point these at your
  OpenClaw gateway.

Add your own agent by appending to the `AGENTS` array — avatar, gradient,
model, and endpoint are all just data.

### The stack (optional)

```bash
# Node 22.16+ (or 24)

# OpenClaw — the gateway/router
npm install -g openclaw@latest
openclaw onboard --install-daemon     # installs the background service
# paste your Anthropic API key when asked

# Hermes — github.com/NousResearch/hermes-agent
# install, connect it to your OpenClaw gateway; it shows up in Mission Control
```

### First-run health check

Open the dashboard — each agent shows a status dot:

- 🟢 **LIVE** — ready. (🟡 **BUSY** = working, also fine.)
- 🟡 **DEGRADED** → `openclaw doctor` then `openclaw gateway restart`
- 🔴 **OFFLINE** → `openclaw gateway restart` (still stuck? `openclaw doctor --fix`)

The Claude agent shows **LIVE** as soon as the `claude` CLI is on your PATH.

---

## 🎙️ Voice input

Every chat box, the Goals input, and the Journal editor have a **mic button**.
Click to talk — speech becomes text via the browser's built-in Web Speech API.
**No API keys.** Works in Chrome, Edge, and Safari.

---

## 🎨 Theme

"Neon sovereignty" — near-black base, glassmorphism panels, violet→cyan neon
gradients, glowing status rings, Framer Motion throughout. Tokens live in
[`tailwind.config.ts`](./tailwind.config.ts) and
[`app/globals.css`](./app/globals.css) — tweak the `neon` palette and the
`neon-gradient` to reskin the whole OS.

---

## 🗂️ Project map

```
agentic-os/
├─ app/
│  ├─ page.tsx              # Mission Control dashboard
│  ├─ agents/[slug]/        # per-agent chat pages
│  ├─ goals/ · journal/     # Goals & Journal
│  └─ api/
│     ├─ chat/              # Claude Code CLI + gateway bridge
│     ├─ obsidian/          # markdown auto-save
│     ├─ agents/            # live status polling
│     └─ store/             # local JSON persistence
├─ components/              # Sidebar, ChatBox, AgentCard, MicButton, …
├─ lib/                     # agents registry, config, obsidian writer, hooks
└─ scripts/setup-wizard.mjs # npm run setup
```

---

*Local-first · Transparent · Private · Yours. — Shadow*
