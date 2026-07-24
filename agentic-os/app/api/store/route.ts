import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Tiny local JSON store so Goals/Journal drafts survive reloads even before
// they are flushed to Obsidian. Lives in .agentic-os-data/ (git-ignored).
const DATA_DIR = path.join(process.cwd(), ".agentic-os-data");

function fileFor(key: string): string {
  const safe = key.replace(/[^a-z0-9_-]/gi, "_");
  return path.join(DATA_DIR, `${safe}.json`);
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "missing key" }, { status: 400 });
  try {
    const raw = await fs.readFile(fileFor(key), "utf8");
    return NextResponse.json({ key, data: JSON.parse(raw) });
  } catch {
    return NextResponse.json({ key, data: null });
  }
}

export async function POST(req: NextRequest) {
  let body: { key?: string; data?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (!body.key) return NextResponse.json({ error: "missing key" }, { status: 400 });
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(fileFor(body.key), JSON.stringify(body.data ?? null, null, 2), "utf8");
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
