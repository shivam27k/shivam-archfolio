export type EntryKind = "system" | "command" | "output" | "error";

export type Entry = {
  id: number;
  kind: EntryKind;
  lines: string[];
  promptPath?: string;
};

export type EntryDraft = {
  kind: EntryKind;
  lines: string[];
  promptPath?: string;
};

export type Project = {
  id: string;
  title: string;
  summary: string;
  stack: string;
  impact: string;
};

export type Profile = {
  name: string;
  role: string;
  location: string;
  bio: string;
};
