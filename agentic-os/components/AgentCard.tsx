"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Agent, AgentStatus } from "@/lib/agents";
import { Avatar } from "./Avatar";
import { StatusPill } from "./StatusPill";

export function AgentCard({
  agent,
  status,
  index,
}: {
  agent: Agent;
  status: AgentStatus;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 260, damping: 24 }}
    >
      <Link
        href={`/agents/${agent.slug}`}
        className="group relative block overflow-hidden rounded-3xl glass card-hover p-5"
      >
        {/* Accent wash */}
        <div
          className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${agent.gradient} opacity-20 blur-2xl transition-opacity group-hover:opacity-40`}
        />
        <div className="relative flex items-start justify-between">
          <Avatar agent={agent} size="lg" />
          <StatusPill status={status} />
        </div>
        <div className="relative mt-4">
          <div className="flex items-center gap-1.5 text-lg font-semibold text-white">
            {agent.name}
            <ArrowUpRight
              size={16}
              className="text-slate-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neon-cyan"
            />
          </div>
          <p className="mt-1 text-sm text-slate-400">{agent.tagline}</p>
        </div>
        <div className="relative mt-4 flex items-center gap-2 border-t border-white/5 pt-3">
          <span className="rounded-lg bg-white/5 px-2 py-1 font-mono text-[10px] text-slate-400">
            {agent.model ?? agent.kind}
          </span>
          <span className="rounded-lg bg-white/5 px-2 py-1 font-mono text-[10px] uppercase text-slate-500">
            {agent.kind}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
