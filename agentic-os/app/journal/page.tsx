"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Save, Check } from "lucide-react";
import { clsx } from "@/lib/clsx";
import { useSpeech } from "@/lib/useSpeech";
import { MicButton } from "@/components/MicButton";
import { saveEntry, loadStore, saveStore } from "@/lib/save";

interface JournalEntry {
  id: string;
  text: string;
  at: number;
}

const KEY = "journal";

function timeOf(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function JournalPage() {
  const [draft, setDraft] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const { supported, listening, interim, toggle } = useSpeech((t) =>
    setDraft((p) => (p ? `${p} ${t}` : t)),
  );

  useEffect(() => {
    loadStore<JournalEntry[]>(KEY).then((data) => {
      if (data) setEntries(data);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveStore(KEY, entries);
  }, [entries, loaded]);

  async function commit() {
    const text = draft.trim();
    if (!text) return;
    const entry: JournalEntry = { id: `j${Date.now()}`, text, at: Date.now() };
    setEntries((e) => [entry, ...e]);
    setDraft("");
    await saveEntry("journal", text);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      <header className="mb-6">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-neon-cyan">
          <BookOpen size={14} /> Journal
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Today&apos;s <span className="neon-text">log</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {today} · one markdown file per day in your Obsidian vault.
        </p>
      </header>

      {/* Composer */}
      <div className="mb-6 rounded-3xl glass p-4">
        {listening && (
          <div className="mb-2 px-1 text-xs text-rose-300">
            🎙️ Listening… <span className="text-slate-400">{interim}</span>
          </div>
        )}
        <textarea
          ref={areaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={5}
          placeholder="What happened today? Wins, blockers, ideas… tap the mic to speak."
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-slate-100 outline-none placeholder:text-slate-500 focus:border-neon-cyan/40"
        />
        <div className="mt-3 flex items-center justify-between">
          <MicButton listening={listening} supported={supported} onClick={toggle} />
          <motion.button
            onClick={commit}
            disabled={!draft.trim()}
            whileTap={{ scale: 0.96 }}
            className={clsx(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
              draft.trim()
                ? "bg-neon-gradient text-white shadow-glow"
                : "border border-white/10 bg-white/5 text-slate-500",
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {saved ? (
                <motion.span
                  key="saved"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Check size={16} /> Saved to vault
                </motion.span>
              ) : (
                <motion.span
                  key="save"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Save size={16} /> Save entry
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {entries.map((e) => (
            <motion.article
              key={e.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 30 }}
              className="rounded-2xl glass p-4"
            >
              <div className="mb-1 font-mono text-[11px] text-slate-500">{timeOf(e.at)}</div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">
                {e.text}
              </p>
            </motion.article>
          ))}
        </AnimatePresence>
        {loaded && entries.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-500">
            Blank page. Write your first entry above ↑
          </div>
        )}
      </div>
    </div>
  );
}
