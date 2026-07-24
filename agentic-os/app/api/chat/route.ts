import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { getAgent } from "@/lib/agents";
import { loadConfig } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatBody {
  agent: string;
  message: string;
}

/** Run the Claude Code CLI as a one-shot and capture its reply. */
function runClaudeCli(prompt: string): Promise<{ text: string; ok: boolean }> {
  const cfg = loadConfig();
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(
        cfg.claudeCli,
        ["-p", prompt, "--output-format", "json", ...cfg.claudeExtraArgs],
        { stdio: ["ignore", "pipe", "pipe"] },
      );
    } catch (err: any) {
      return resolve({
        ok: false,
        text: bridgeHint(err?.message || String(err)),
      });
    }

    let out = "";
    let errOut = "";
    child.stdout?.on("data", (d) => (out += d.toString()));
    child.stderr?.on("data", (d) => (errOut += d.toString()));

    child.on("error", (err: any) => {
      resolve({ ok: false, text: bridgeHint(err?.message || String(err)) });
    });

    child.on("close", (code) => {
      if (code !== 0 && !out.trim()) {
        return resolve({ ok: false, text: bridgeHint(errOut || `exit ${code}`) });
      }
      // Claude Code --output-format json returns { result, ... }.
      try {
        const parsed = JSON.parse(out);
        const text =
          parsed.result ?? parsed.text ?? parsed.content ?? out.trim();
        resolve({ ok: true, text: String(text) });
      } catch {
        resolve({ ok: true, text: out.trim() });
      }
    });
  });
}

function bridgeHint(detail: string): string {
  return (
    "⚠️ Claude Code CLI bridge unavailable.\n\n" +
    "Make sure the `claude` CLI is installed and on your PATH " +
    "(or set `CLAUDE_CLI` in agentic-os.config.json). " +
    "Then log in once with `claude` so the session is authorized.\n\n" +
    "```\n" +
    detail +
    "\n```"
  );
}

/** Forward to a gateway-routed agent (OpenClaw / Hermes / fleet via OpenClaw). */
async function runGateway(
  endpoint: string,
  agentName: string,
  message: string,
): Promise<{ text: string; ok: boolean }> {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent: agentName, message }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`gateway ${res.status}`);
    const data = await res.json().catch(() => ({}));
    const text =
      data.reply ?? data.result ?? data.text ?? data.content ?? JSON.stringify(data);
    return { ok: true, text: String(text) };
  } catch (err: any) {
    return {
      ok: false,
      text:
        `⚠️ ${agentName} is not reachable at ${endpoint}.\n\n` +
        "Start the gateway (`openclaw gateway restart`) or run `openclaw doctor`.\n\n" +
        "```\n" +
        (err?.message || String(err)) +
        "\n```",
    };
  }
}

export async function POST(req: NextRequest) {
  let body: ChatBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const agent = getAgent(body.agent);
  if (!agent) {
    return NextResponse.json({ error: "unknown agent" }, { status: 404 });
  }
  const message = (body.message || "").trim();
  if (!message) {
    return NextResponse.json({ error: "empty message" }, { status: 400 });
  }

  let result: { text: string; ok: boolean };
  if (agent.kind === "claude-cli") {
    result = await runClaudeCli(message);
  } else if (agent.endpoint) {
    result = await runGateway(agent.endpoint, agent.name, message);
  } else {
    result = {
      ok: false,
      text:
        `⚠️ ${agent.name} has no endpoint configured.\n\n` +
        "Route it through OpenClaw and set its `endpoint` in lib/agents.ts.",
    };
  }

  return NextResponse.json({
    agent: agent.slug,
    reply: result.text,
    ok: result.ok,
  });
}
