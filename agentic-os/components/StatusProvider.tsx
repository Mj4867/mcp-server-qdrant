"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { AgentStatus } from "@/lib/agents";

interface StatusCtx {
  statuses: Record<string, AgentStatus>;
  demo: boolean;
  refresh: () => void;
}

const Ctx = createContext<StatusCtx>({ statuses: {}, demo: false, refresh: () => {} });

export function useAgentStatuses() {
  return useContext(Ctx);
}

export function StatusProvider({ children }: { children: React.ReactNode }) {
  const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({});
  const [demo, setDemo] = useState(false);

  const refresh = async () => {
    try {
      const res = await fetch("/api/agents", { cache: "no-store" });
      const json = await res.json();
      setStatuses(json.statuses || {});
      setDemo(!!json.demo);
    } catch {
      // keep last known
    }
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15_000);
    return () => clearInterval(id);
  }, []);

  return <Ctx.Provider value={{ statuses, demo, refresh }}>{children}</Ctx.Provider>;
}
