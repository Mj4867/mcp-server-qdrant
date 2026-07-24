import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { AGENTS, type AgentStatus } from "@/lib/agents";
import { loadConfig } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO = process.env.AGENTIC_OS_DEMO === "1";

function checkClaudeCli(): Promise<AgentStatus> {
  const cfg = loadConfig();
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(cfg.claudeCli, ["--version"], { stdio: "ignore" });
    } catch {
      return resolve("offline");
    }
    const timer = setTimeout(() => {
      child.kill();
      resolve("degraded");
    }, 4000);
    child.on("error", () => {
      clearTimeout(timer);
      resolve("offline");
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve(code === 0 ? "live" : "degraded");
    });
  });
}

async function pingEndpoint(endpoint: string): Promise<AgentStatus> {
  try {
    const res = await fetch(endpoint, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    // Any HTTP response (even 404/405) means the gateway is alive.
    if (res.status >= 500) return "degraded";
    return "live";
  } catch {
    return "offline";
  }
}

export async function GET() {
  const statuses = await Promise.all(
    AGENTS.map(async (a) => {
      if (DEMO) return { slug: a.slug, status: "live" as AgentStatus };
      let status: AgentStatus;
      if (a.kind === "claude-cli") {
        status = await checkClaudeCli();
      } else if (a.endpoint) {
        status = await pingEndpoint(a.endpoint);
      } else {
        status = "offline";
      }
      return { slug: a.slug, status };
    }),
  );

  const map: Record<string, AgentStatus> = {};
  for (const s of statuses) map[s.slug] = s.status;
  return NextResponse.json({ statuses: map, demo: DEMO, ts: Date.now() });
}
