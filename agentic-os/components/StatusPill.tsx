import { clsx } from "@/lib/clsx";
import { STATUS_META, type AgentStatus } from "@/lib/agents";

export function StatusPill({
  status,
  compact = false,
}: {
  status: AgentStatus;
  compact?: boolean;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 font-mono font-semibold tracking-wider",
        meta.text,
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
      )}
    >
      <span className="relative flex h-2 w-2">
        {status !== "offline" && (
          <span
            className={clsx(
              "absolute inline-flex h-full w-full rounded-full animate-pulse-ring",
              meta.ring,
            )}
          />
        )}
        <span className={clsx("relative inline-flex h-2 w-2 rounded-full", meta.dot)} />
      </span>
      {meta.label}
    </span>
  );
}
