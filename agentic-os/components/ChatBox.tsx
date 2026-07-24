"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import type { Agent } from "@/lib/agents";
import { clsx } from "@/lib/clsx";
import { useSpeech } from "@/lib/useSpeech";
import { saveEntry } from "@/lib/save";
import { Avatar } from "./Avatar";
import { MicButton } from "./MicButton";

interface Msg {
  id: string;
  role: "user" | "agent";
  text: string;
  ok?: boolean;
}

let idCounter = 0;
const nextId = () => `m${Date.now()}_${idCounter++}`;

export function ChatBox({ agent }: { agent: Agent }) {
  const storageKey = `agentic-os:chat:${agent.slug}`;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { supported, listening, interim, toggle } = useSpeech((finalText) => {
    setInput((prev) => (prev ? `${prev} ${finalText}` : finalText));
  });

  // Restore + persist conversation locally.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setMessages(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages.slice(-100)));
    } catch {
      /* ignore */
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, storageKey]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    const userMsg: Msg = { id: nextId(), role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setSending(true);
    saveEntry("chat", text, `you → ${agent.name}`);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent: agent.slug, message: text }),
      });
      const data = await res.json();
      const reply = data.reply || "(no response)";
      setMessages((m) => [
        ...m,
        { id: nextId(), role: "agent", text: reply, ok: data.ok },
      ]);
      saveEntry("chat", reply, agent.name);
    } catch (err: any) {
      setMessages((m) => [
        ...m,
        {
          id: nextId(),
          role: "agent",
          text: `⚠️ Request failed: ${err?.message || err}`,
          ok: false,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl glass">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <Avatar agent={agent} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white">{agent.name}</div>
          <div className="truncate text-xs text-slate-400">{agent.tagline}</div>
        </div>
        {agent.model && (
          <span className="hidden rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] text-slate-400 sm:block">
            {agent.model}
          </span>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
        {messages.length === 0 && (
          <div className="mx-auto mt-10 max-w-sm text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.02]">
              <Sparkles className="text-neon-cyan" />
            </div>
            <p className="text-sm text-slate-400">
              Talk to <span className="font-semibold text-white">{agent.name}</span>. Type or tap
              the mic — every message auto-saves to your Obsidian vault.
            </p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className={clsx("flex gap-3", m.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              {m.role === "agent" && <Avatar agent={agent} size="sm" />}
              <div
                className={clsx(
                  "max-w-[78%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-neon-gradient text-white shadow-glow"
                    : m.ok === false
                      ? "border border-rose-400/20 bg-rose-500/10 text-rose-100"
                      : "glass-strong text-slate-100",
                )}
              >
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {sending && (
          <div className="flex gap-3">
            <Avatar agent={agent} size="sm" />
            <div className="flex items-center gap-1 rounded-2xl glass-strong px-4 py-3">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-slate-400"
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-white/10 p-3">
        {listening && (
          <div className="mb-2 px-2 text-xs text-rose-300">
            🎙️ Listening… <span className="text-slate-400">{interim}</span>
          </div>
        )}
        <div className="flex items-end gap-2">
          <MicButton listening={listening} supported={supported} onClick={toggle} />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            rows={1}
            placeholder={`Message ${agent.name}…`}
            className="max-h-40 min-h-[2.5rem] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-neon-cyan/40"
          />
          <motion.button
            type="button"
            onClick={send}
            disabled={!input.trim() || sending}
            whileTap={{ scale: 0.9 }}
            className={clsx(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors",
              input.trim() && !sending
                ? "bg-neon-gradient text-white shadow-glow"
                : "border border-white/10 bg-white/5 text-slate-500",
            )}
          >
            <Send size={17} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
