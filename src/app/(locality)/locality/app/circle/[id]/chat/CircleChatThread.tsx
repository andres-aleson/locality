"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { pollCircleMessages, sendCircleMessage } from "@/lib/locality/actions";
import { Avatar } from "@/components/locality/Avatar";
import type { CircleMessage, User } from "@/lib/locality/types";

const POLL_INTERVAL_MS = 4000;

/** Adds any messages from `latest` not already shown, keeping chronological order. */
function mergeMessages(prev: CircleMessage[], latest: CircleMessage[]): CircleMessage[] {
  const known = new Set(prev.map((m) => m.id));
  const added = latest.filter((m) => !known.has(m.id));
  if (added.length === 0) return prev;
  return [...prev, ...added].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function CircleChatThread({
  circleId,
  currentUserId,
  members,
  initialMessages,
}: {
  circleId: string;
  currentUserId: string;
  members: Record<string, User>;
  initialMessages: CircleMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  // Poll for new messages while the tab is visible (replaces Supabase Realtime).
  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const latest = await pollCircleMessages(circleId);
        if (!cancelled) setMessages((prev) => mergeMessages(prev, latest));
      } catch {
        // Transient network/server error — the next tick retries.
      }
    };
    const timer = setInterval(refresh, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [circleId]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setText("");
    const sent = await sendCircleMessage(circleId, value);
    if (sent) {
      setMessages((prev) => (prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]));
    }
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-slate-400 dark:text-slate-500">
            No messages yet — say hello to your Circle.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          const sender = members[m.senderId];
          return (
            <div key={m.id} className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
              {!mine && sender && <Avatar name={sender.name} color={sender.avatarColor} size={28} />}
              <div className={`flex max-w-[75%] flex-col gap-0.5 ${mine ? "items-end" : "items-start"}`}>
                {!mine && sender && (
                  <span className="px-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {sender.name}
                  </span>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm ${
                    mine
                      ? "rounded-br-sm bg-sky-600 text-white dark:bg-sky-500"
                      : "rounded-bl-sm bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message your Circle…"
          className="flex-1 rounded-full border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="flex-none rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-40 dark:bg-sky-500 dark:hover:bg-sky-400"
        >
          Send
        </button>
      </form>
    </>
  );
}
