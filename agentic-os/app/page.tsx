"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, FolderCheck, FolderX, Zap, RefreshCw } from "lucide-react";
import { AGENTS, type AgentStatus } from "@/lib/agents";
import { AgentCard } from "@/components/AgentCard";
import { useAgentStatuses } from "@/components/StatusProvider";
import { clsx } from "@/lib/clsx";

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function greeting(h: number) {
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function MissionControl() {
  const { statuses, demo, refresh } = useAgentStatuses();
  const now = useClock();
  const [vault, setVault] = useState<{ reachable: boolean; vaultPath: string } | null>(null);

  useEffect(() => {
    fetch("/api/obsidian")
      .then((r) => r.json())
      .then(setVault)
      .catch(() => setVault(null));
  }, []);

  const counts = useMemo(() => {
    const c = { live: 0, busy: 0, degraded: 0, offline: 0 } as Record<AgentStatus, number>;
    for (const a of AGENTS) c[statuses[a.slug] ?? "offline"]++;
    return c;
  }, [statuses]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-neon-cyan">
            <Activity size={14} /> Mission Control
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {now ? greeting(now.getHours()) : "Welcome back"},{" "}
            <span className="neon-text">Shadow</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {now
              ? now.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })
              : ""}{" "}
            · Your fleet, one screen, no cloud.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl glass px-4 py-2 text-right">
            <div className="font-mono text-2xl font-semibold tabular-nums text-white">
              {now
                ? now.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                : "--:--:--"}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500">
              {demo ? "demo mode" : "local time"}
            </div>
          </div>
          <button
            onClick={refresh}
            title="Refresh statuses"
            className="grid h-11 w-11 place-items-center rounded-2xl glass text-slate-300 transition-colors hover:text-neon-cyan"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </motion.header>

      {/* Stat strip */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Agents online"
          value={`${counts.live}/${AGENTS.length}`}
          icon={<Zap size={16} />}
          tone="emerald"
        />
        <StatTile label="Busy" value={String(counts.busy)} icon={<Activity size={16} />} tone="amber" />
        <StatTile
          label="Degraded / off"
          value={String(counts.degraded + counts.offline)}
          icon={<Activity size={16} />}
          tone="rose"
        />
        <StatTile
          label="Obsidian vault"
          value={vault?.reachable ? "Linked" : "Set path"}
          icon={vault?.reachable ? <FolderCheck size={16} /> : <FolderX size={16} />}
          tone={vault?.reachable ? "cyan" : "slate"}
        />
      </div>

      {/* Agent grid */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
          Your agents
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {AGENTS.map((agent, i) => (
          <AgentCard
            key={agent.slug}
            agent={agent}
            status={statuses[agent.slug] ?? "offline"}
            index={i}
          />
        ))}
      </div>

      {!vault?.reachable && vault && (
        <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
          <span className="font-semibold">Obsidian not linked yet.</span> Point Agentic OS at your
          vault by setting <code className="rounded bg-black/30 px-1">OBSIDIAN_VAULT_PATH</code> in{" "}
          <code className="rounded bg-black/30 px-1">.env</code> or{" "}
          <code className="rounded bg-black/30 px-1">agentic-os.config.json</code>. Current target:{" "}
          <code className="rounded bg-black/30 px-1">{vault.vaultPath}</code>
        </div>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "emerald" | "amber" | "rose" | "cyan" | "slate";
}) {
  const toneMap = {
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    rose: "text-rose-300",
    cyan: "text-neon-cyan",
    slate: "text-slate-300",
  };
  return (
    <div className="rounded-2xl glass p-4">
      <div className={clsx("mb-2 flex items-center gap-1.5 text-xs", toneMap[tone])}>
        {icon}
        <span className="text-slate-400">{label}</span>
      </div>
      <div className="text-2xl font-bold tabular-nums text-white">{value}</div>
    </div>
  );
}
