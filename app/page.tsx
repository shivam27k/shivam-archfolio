"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { BootSplash } from "@/components/terminal/BootSplash";
import { QuickCommandBar } from "@/components/terminal/QuickCommandBar";
import { TerminalEntries } from "@/components/terminal/TerminalEntries";
import { TerminalHeader } from "@/components/terminal/TerminalHeader";
import { TerminalInputRow } from "@/components/terminal/TerminalInputRow";
import { executeCommand } from "@/lib/terminal/commands";
import { getCompletionOptions } from "@/lib/terminal/completion";
import { GITHUB_USERNAME, QUICK_COMMANDS, startupEntries } from "@/lib/terminal/data";
import { createInitialFsRoot, getPromptPath, HOME_PATH, VirtualNode } from "@/lib/terminal/filesystem";
import { getLiveGithubEntries } from "@/lib/terminal/live";
import { Entry, EntryDraft } from "@/lib/terminal/types";

const BOOT_STORAGE_KEY = "archfolio_boot_seen_v1";

export default function Home() {
  const [history, setHistory] = useState<Entry[]>(() => startupEntries());
  const [input, setInput] = useState("");
  const [showBootSplash, setShowBootSplash] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem(BOOT_STORAGE_KEY) !== "1";
  });
  const [cwd, setCwd] = useState(HOME_PATH);
  const [fsRoot, setFsRoot] = useState<VirtualNode>(() => createInitialFsRoot());
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
    if (typeof window === "undefined" || !showBootSplash) {
      return;
    }

    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(BOOT_STORAGE_KEY, "1");
      setShowBootSplash(false);
    }, 2100);

    return () => window.clearTimeout(timeout);
  }, [showBootSplash]);

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

  const runCommand = async (raw: string, historySnapshot: string[]) => {
    const result = executeCommand(raw, { cwd, fsRoot, commandHistory: historySnapshot });
    if (result.clear) {
      setHistory([]);
      return;
    }

    if (result.cwd) {
      setCwd(result.cwd);
    }
    if (result.fsRoot) {
      setFsRoot(result.fsRoot);
    }

    appendEntries(result.entries);

    if (!result.action) {
      return;
    }

    if (result.action.type === "live") {
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
      return;
    }

    if (result.action.type === "open_url") {
      if (typeof window !== "undefined") {
        window.open(result.action.url, "_blank", "noopener,noreferrer");
      }
      return;
    }

  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = input;
    if (!value.trim()) {
      return;
    }

    const nextCommandHistory = [...commandHistory, value];
    setCommandHistory(nextCommandHistory);
    setHistoryIndex(null);
    completionRef.current = null;
    void runCommand(value, nextCommandHistory);
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
      {showBootSplash ? (
        <BootSplash
          onSkip={() => {
            if (typeof window !== "undefined") {
              window.localStorage.setItem(BOOT_STORAGE_KEY, "1");
            }
            setShowBootSplash(false);
          }}
        />
      ) : null}
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
