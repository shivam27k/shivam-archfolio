import { COMMANDS, FILES, PROJECTS } from "@/lib/terminal/data";

export type CompletionResult = {
  key: string;
  options: string[];
  apply: (value: string) => string;
};

export function getCompletionOptions(rawInput: string): CompletionResult {
  const hasTrailingSpace = /\s$/.test(rawInput);
  const trimmed = rawInput.trimStart();
  const parts = trimmed.length > 0 ? trimmed.split(/\s+/) : [];
  const rawCommand = parts[0] ?? "";
  const command = rawCommand.startsWith("/") ? rawCommand.slice(1).toLowerCase() : rawCommand.toLowerCase();
  const slashPrefix = rawCommand.startsWith("/");

  if (parts.length === 0) {
    return { key: "cmd:", options: COMMANDS, apply: (value: string) => `${value} ` };
  }

  if (parts.length === 1 && !hasTrailingSpace) {
    const partial = command;
    const options = COMMANDS.filter((item) => item.startsWith(partial));
    return {
      key: `cmd:${partial}`,
      options,
      apply: (value: string) => `${slashPrefix ? "/" : ""}${value} `,
    };
  }

  const argPartial = hasTrailingSpace ? "" : (parts[1] ?? "").toLowerCase();

  if (command === "cat") {
    const options = FILES.filter((file) => file.startsWith(argPartial));
    return {
      key: `arg:cat:${argPartial}`,
      options,
      apply: (value: string) => `${slashPrefix ? "/" : ""}${command} ${value}`,
    };
  }

  if (command === "project") {
    const projectOptions = [
      ...PROJECTS.map((project) => project.id),
      ...PROJECTS.map((_, index) => String(index + 1)),
    ];
    const options = projectOptions.filter((value) => value.startsWith(argPartial));
    return {
      key: `arg:project:${argPartial}`,
      options,
      apply: (value: string) => `${slashPrefix ? "/" : ""}${command} ${value}`,
    };
  }

  return { key: "", options: [], apply: (value: string) => value };
}
