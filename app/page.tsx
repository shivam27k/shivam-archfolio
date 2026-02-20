"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { QuickCommandBar } from "@/components/terminal/QuickCommandBar";
import { TerminalEntries } from "@/components/terminal/TerminalEntries";
import { TerminalHeader } from "@/components/terminal/TerminalHeader";
import { TerminalInputRow } from "@/components/terminal/TerminalInputRow";
import { executeCommand } from "@/lib/terminal/commands";
import { getCompletionOptions } from "@/lib/terminal/completion";
import { GITHUB_USERNAME, QUICK_COMMANDS, startupEntries } from "@/lib/terminal/data";
import { getPromptPath, HOME_PATH } from "@/lib/terminal/filesystem";
import { getLiveGithubEntries } from "@/lib/terminal/live";
import { Entry, EntryDraft } from "@/lib/terminal/types";

export default function Home() {
  const [history, setHistory] = useState<Entry[]>(() => startupEntries());
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState(HOME_PATH);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const nextEntryIdRef = useRef(3);
  const completionRef = useRef<{
    key: string;
    options: string[];
    index: number;
    lastTabAt: number;
  } | null>(null);

  useEffect(() => {
    const isTouchDevice =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (!isTouchDevice) {
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [history]);

  const appendEntries = (entries: EntryDraft[]) => {
    if (entries.length === 0) {
      return;
    }

    setHistory((prev) => [
      ...prev,
      ...entries.map((entry) => ({
        ...entry,
        id: nextEntryIdRef.current++,
      })),
    ]);
  };

  const handleTabCompletion = () => {
    const completion = getCompletionOptions(input);
    if (completion.options.length === 0) {
      return;
    }

    if (completion.options.length === 1) {
      setInput(completion.apply(completion.options[0]));
      completionRef.current = null;
      return;
    }

    const now = Date.now();
    const prev = completionRef.current;
    const isSameCompletion = prev && prev.key === completion.key;
    const nextIndex = isSameCompletion ? (prev.index + 1) % completion.options.length : 0;
    const nextValue = completion.options[nextIndex];

    setInput(completion.apply(nextValue));
    completionRef.current = {
      key: completion.key,
      options: completion.options,
      index: nextIndex,
      lastTabAt: now,
    };

    if (isSameCompletion && prev && now - prev.lastTabAt < 450) {
      appendEntries([{ kind: "system", lines: [`matches: ${completion.options.join("  ")}`] }]);
    }
  };

  const runCommand = async (raw: string) => {
    const result = executeCommand(raw, { cwd });
    if (result.clear) {
      setHistory([]);
      return;
    }

    if (result.cwd) {
      setCwd(result.cwd);
    }

    appendEntries(result.entries);

    if (result.action === "live") {
      try {
        const liveEntries = await getLiveGithubEntries(GITHUB_USERNAME);
        appendEntries(liveEntries);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to fetch live GitHub data right now.";
        appendEntries([{ kind: "error", lines: [message] }]);
      }
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = input;
    if (!value.trim()) {
      return;
    }

    setCommandHistory((prev) => [...prev, value]);
    setHistoryIndex(null);
    completionRef.current = null;
    void runCommand(value);
    setInput("");
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Tab") {
      event.preventDefault();
      handleTabCompletion();
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === "l") {
      event.preventDefault();
      setHistory([]);
      completionRef.current = null;
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === "c") {
      event.preventDefault();
      if (input.length > 0) {
        appendEntries([{ kind: "system", lines: ["^C"] }]);
      }
      setInput("");
      setHistoryIndex(null);
      completionRef.current = null;
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (commandHistory.length === 0) {
        return;
      }
      const next = historyIndex === null ? commandHistory.length - 1 : Math.max(historyIndex - 1, 0);
      setHistoryIndex(next);
      setInput(commandHistory[next]);
      completionRef.current = null;
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (commandHistory.length === 0 || historyIndex === null) {
        return;
      }
      const next = Math.min(historyIndex + 1, commandHistory.length);
      if (next === commandHistory.length) {
        setHistoryIndex(null);
        setInput("");
        completionRef.current = null;
        return;
      }
      setHistoryIndex(next);
      setInput(commandHistory[next]);
      completionRef.current = null;
    }
  };

  return (
    <div className="terminal-page">
      <main className="terminal-shell" onClick={() => inputRef.current?.focus()}>
        <TerminalHeader />
        <QuickCommandBar
          commands={QUICK_COMMANDS}
          onSelect={(cmd) => {
            setInput(cmd);
            inputRef.current?.focus();
          }}
        />

        <section ref={bodyRef} className="terminal-body terminal-history" aria-live="polite">
          <TerminalEntries history={history} promptPath={getPromptPath(cwd)} />
          <TerminalInputRow
            value={input}
            promptPath={getPromptPath(cwd)}
            inputRef={inputRef}
            onChange={setInput}
            onSubmit={handleSubmit}
            onKeyDown={handleInputKeyDown}
          />
        </section>
      </main>
    </div>
  );
}
