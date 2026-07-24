"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Target, Plus, Check, Trash2 } from "lucide-react";
import { clsx } from "@/lib/clsx";
import { useSpeech } from "@/lib/useSpeech";
import { MicButton } from "@/components/MicButton";
import { saveEntry, loadStore, saveStore } from "@/lib/save";

interface Goal {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

const KEY = "goals";

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [input, setInput] = useState("");
  const [loaded, setLoaded] = useState(false);

  const { supported, listening, interim, toggle } = useSpeech((t) =>
    setInput((p) => (p ? `${p} ${t}` : t)),
  );

  useEffect(() => {
    loadStore<Goal[]>(KEY).then((data) => {
      if (data) setGoals(data);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveStore(KEY, goals);
  }, [goals, loaded]);

  function add() {
    const text = input.trim();
    if (!text) return;
    const goal: Goal = { id: `g${Date.now()}`, text, done: false, createdAt: Date.now() };
    setGoals((g) => [goal, ...g]);
    setInput("");
    saveEntry("goal", `☐ ${text}`, "new goal");
  }

  function toggleGoal(id: string) {
    setGoals((g) =>
      g.map((goal) => {
        if (goal.id !== id) return goal;
        const done = !goal.done;
        if (done) saveEntry("goal", `✅ completed: ${goal.text}`, "goal done");
        return { ...goal, done };
      }),
    );
  }

  function remove(id: string) {
    setGoals((g) => g.filter((goal) => goal.id !== id));
  }

  const done = goals.filter((g) => g.done).length;
  const pct = goals.length ? Math.round((done / goals.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      <header className="mb-6">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-neon-cyan">
          <Target size={14} /> Goals
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          What are we <span className="neon-text">shipping</span>?
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Checkbox tasks — every add & complete auto-saves to your Obsidian vault.
        </p>
      </header>

      {/* Progress */}
      <div className="mb-6 rounded-2xl glass p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-400">
            {done} of {goals.length} done
          </span>
          <span className="font-mono font-semibold text-white">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full bg-neon-gradient"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      {/* Composer */}
      <div className="mb-6">
        {listening && (
          <div className="mb-2 px-1 text-xs text-rose-300">
            🎙️ Listening… <span className="text-slate-400">{interim}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <MicButton listening={listening} supported={supported} onClick={toggle} />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Add a goal…"
            className="h-11 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-neon-cyan/40"
          />
          <button
            onClick={add}
            disabled={!input.trim()}
            className={clsx(
              "grid h-11 w-11 place-items-center rounded-xl transition-colors",
              input.trim()
                ? "bg-neon-gradient text-white shadow-glow"
                : "border border-white/10 bg-white/5 text-slate-500",
            )}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="group flex items-center gap-3 rounded-2xl glass px-4 py-3"
            >
              <button
                onClick={() => toggleGoal(goal.id)}
                className={clsx(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-lg border transition-colors",
                  goal.done
                    ? "border-transparent bg-neon-gradient text-white"
                    : "border-white/20 text-transparent hover:border-neon-cyan/60",
                )}
              >
                <Check size={14} />
              </button>
              <span
                className={clsx(
                  "flex-1 text-sm",
                  goal.done ? "text-slate-500 line-through" : "text-slate-100",
                )}
              >
                {goal.text}
              </span>
              <button
                onClick={() => remove(goal.id)}
                className="text-slate-600 opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {loaded && goals.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-500">
            No goals yet. Add your first one above ↑
          </div>
        )}
      </div>
    </div>
  );
}
