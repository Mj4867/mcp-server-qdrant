"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Target,
  BookOpen,
  Radio,
  Cpu,
} from "lucide-react";
import { AGENTS } from "@/lib/agents";
import { clsx } from "@/lib/clsx";
import { Avatar } from "./Avatar";
import { useAgentStatuses } from "./StatusProvider";
import { STATUS_META } from "@/lib/agents";

const NAV = [
  { href: "/", label: "Mission Control", icon: LayoutDashboard },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/journal", label: "Journal", icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();
  const { statuses, demo } = useAgentStatuses();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col gap-1 border-r border-white/10 bg-base-800/40 px-4 py-5 backdrop-blur-xl lg:flex">
      <Link href="/" className="mb-6 flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-neon-gradient shadow-glow">
          <Cpu size={20} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-tight text-white">
            Agentic<span className="neon-text"> OS</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
            <Radio size={10} className="text-emerald-400" />
            {demo ? "demo mode" : "mission control"}
          </div>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "text-white"
                  : "text-slate-400 hover:text-white",
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl border border-white/10 bg-white/[0.06]"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon size={17} className="relative z-10" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        Agents
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {AGENTS.map((agent) => {
          const href = `/agents/${agent.slug}`;
          const active = pathname === href;
          const status = statuses[agent.slug] ?? "offline";
          const meta = STATUS_META[status];
          return (
            <Link
              key={agent.slug}
              href={href}
              className={clsx(
                "group relative flex items-center gap-3 rounded-xl px-2 py-2 transition-colors",
                active ? "text-white" : "text-slate-300 hover:text-white",
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active-agent"
                  className="absolute inset-0 rounded-xl border border-white/10 bg-white/[0.06]"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Avatar agent={agent} size="sm" className="relative z-10" />
              <div className="relative z-10 min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{agent.name}</div>
                <div className="truncate text-[10px] text-slate-500">
                  {agent.model ?? agent.kind}
                </div>
              </div>
              <span
                className={clsx(
                  "relative z-10 h-2 w-2 shrink-0 rounded-full",
                  meta.dot,
                )}
                title={meta.label}
              />
            </Link>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] text-slate-500">
        <span className="text-slate-400">Shadow</span> · local-first · no cloud
      </div>
    </aside>
  );
}
