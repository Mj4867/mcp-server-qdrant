import { clsx } from "@/lib/clsx";
import type { Agent } from "@/lib/agents";

export function Avatar({
  agent,
  size = "md",
  className,
}: {
  agent: Agent;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim =
    size === "lg" ? "h-14 w-14 text-xl" : size === "sm" ? "h-8 w-8 text-xs" : "h-11 w-11 text-sm";
  return (
    <div
      className={clsx(
        "relative grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br font-semibold text-white shadow-lg",
        agent.gradient,
        dim,
        className,
      )}
    >
      <span className="drop-shadow">{agent.emoji}</span>
      <span className="absolute -bottom-1 -right-1 rounded-md bg-base-900/90 px-1 text-[9px] font-bold tracking-wider text-white/70 ring-1 ring-white/10">
        {agent.initials}
      </span>
    </div>
  );
}
