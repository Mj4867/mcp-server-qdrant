"use client";

import { Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "@/lib/clsx";

export function MicButton({
  listening,
  supported,
  onClick,
  title,
}: {
  listening: boolean;
  supported: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!supported}
      whileTap={{ scale: 0.9 }}
      title={
        supported
          ? title || (listening ? "Stop listening" : "Click to talk")
          : "Voice input not supported in this browser"
      }
      className={clsx(
        "relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors",
        supported
          ? listening
            ? "border-rose-400/40 bg-rose-500/20 text-rose-300"
            : "border-white/10 bg-white/5 text-slate-300 hover:border-neon-cyan/40 hover:text-neon-cyan"
          : "cursor-not-allowed border-white/5 bg-white/[0.02] text-slate-600",
      )}
    >
      {listening && (
        <span className="absolute inline-flex h-full w-full rounded-xl bg-rose-500/40 animate-pulse-ring" />
      )}
      {supported ? (
        listening ? (
          <Mic className="relative h-4.5 w-4.5" size={18} />
        ) : (
          <Mic className="relative" size={18} />
        )
      ) : (
        <MicOff size={18} />
      )}
    </motion.button>
  );
}
