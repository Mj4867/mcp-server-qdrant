import { NextRequest, NextResponse } from "next/server";
import { saveToVault, vaultStatus, type EntryKind } from "@/lib/obsidian";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const status = await vaultStatus();
  return NextResponse.json(status);
}

export async function POST(req: NextRequest) {
  let body: { kind?: EntryKind; source?: string; body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const kinds: EntryKind[] = ["chat", "goal", "journal"];
  if (!body.kind || !kinds.includes(body.kind)) {
    return NextResponse.json({ error: "invalid kind" }, { status: 400 });
  }
  if (!body.body?.trim()) {
    return NextResponse.json({ error: "empty body" }, { status: 400 });
  }

  const result = await saveToVault({
    kind: body.kind,
    source: body.source,
    body: body.body.trim(),
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
