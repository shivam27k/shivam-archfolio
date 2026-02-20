import {
  CONTACT,
  EXPERIENCE,
  formatProjectDetails,
  formatProjectList,
  getFileContents,
  HELP_LINES,
  PROFILE,
  SKILLS,
  STARTUP_LINES,
  STATS,
  TESTIMONIALS,
  findProject,
} from "@/lib/terminal/data";
import {
  formatLs,
  formatTree,
  getNode,
  getPromptPath,
  HOME_PATH,
  isDirectory,
  resolvePath,
} from "@/lib/terminal/filesystem";
import { EntryDraft } from "@/lib/terminal/types";

type CommandContext = {
  cwd: string;
};

type CommandResult = {
  clear: boolean;
  entries: EntryDraft[];
  action?: "live";
  cwd?: string;
};

export function executeCommand(raw: string, context: CommandContext): CommandResult {
  const value = raw.trim();
  if (!value) {
    return { clear: false, entries: [], cwd: context.cwd };
  }

  const [command, ...args] = value.split(/\s+/);
  const normalizedCommand = command.startsWith("/") ? command.slice(1) : command;
  const cmd = normalizedCommand.toLowerCase();

  if (cmd === "clear") {
    return { clear: true, entries: [], cwd: context.cwd };
  }

  const entries: EntryDraft[] = [{ kind: "command", lines: [value], promptPath: getPromptPath(context.cwd) }];

  if (cmd === "help") {
    entries.push({ kind: "output", lines: HELP_LINES });
    return { clear: false, entries, cwd: context.cwd };
  }

  if (cmd === "intro") {
    entries.push({
      kind: "output",
      lines: [
        `${PROFILE.name} | ${PROFILE.role}`,
        PROFILE.bio,
        "This terminal is a live map of execution, impact, and ambition.",
      ],
    });
    return { clear: false, entries, cwd: context.cwd };
  }

  if (cmd === "about") {
    entries.push({
      kind: "output",
      lines: [
        `name     : ${PROFILE.name}`,
        `role     : ${PROFILE.role}`,
        `location : ${PROFILE.location}`,
        `bio      : ${PROFILE.bio}`,
      ],
    });
    return { clear: false, entries, cwd: context.cwd };
  }

  if (cmd === "live") {
    entries.push({ kind: "system", lines: ["Fetching live GitHub snapshot..."] });
    return { clear: false, entries, action: "live", cwd: context.cwd };
  }

  if (cmd === "pwd") {
    entries.push({ kind: "output", lines: [context.cwd] });
    return { clear: false, entries, cwd: context.cwd };
  }

  if (cmd === "cd") {
    const target = args.join(" ");
    const nextPath = resolvePath(context.cwd, target || HOME_PATH);
    if (!isDirectory(nextPath)) {
      entries.push({ kind: "error", lines: [`cd: no such file or directory: ${target || nextPath}`] });
      return { clear: false, entries, cwd: context.cwd };
    }
    return { clear: false, entries, cwd: nextPath };
  }

  if (cmd === "skills") {
    entries.push({ kind: "output", lines: SKILLS.map((skill) => `- ${skill}`) });
    return { clear: false, entries, cwd: context.cwd };
  }

  if (cmd === "projects") {
    entries.push({
      kind: "output",
      lines: ["Project Index:", ...formatProjectList(), "Run `project <id|number>` for details."],
    });
    return { clear: false, entries, cwd: context.cwd };
  }

  if (cmd === "project") {
    const target = args.join(" ").toLowerCase();
    if (!target) {
      entries.push({
        kind: "error",
        lines: ["Usage: project <id|number>", "Example: project aether"],
      });
      return { clear: false, entries, cwd: context.cwd };
    }

    const project = findProject(target);
    if (!project) {
      entries.push({
        kind: "error",
        lines: ["Project not found.", "Run `projects` to see valid options."],
      });
      return { clear: false, entries, cwd: context.cwd };
    }

    entries.push({ kind: "output", lines: formatProjectDetails(project) });
    return { clear: false, entries, cwd: context.cwd };
  }

  if (cmd === "tree") {
    const targetPath = resolvePath(context.cwd, args.join(" "));
    const lines = formatTree(targetPath);
    if (!lines) {
      entries.push({ kind: "error", lines: [`tree: ${targetPath}: No such directory`] });
      return { clear: false, entries, cwd: context.cwd };
    }
    entries.push({ kind: "output", lines });
    return { clear: false, entries, cwd: context.cwd };
  }

  if (cmd === "experience") {
    entries.push({ kind: "output", lines: EXPERIENCE });
    return { clear: false, entries, cwd: context.cwd };
  }

  if (cmd === "stats") {
    entries.push({ kind: "output", lines: STATS });
    return { clear: false, entries, cwd: context.cwd };
  }

  if (cmd === "testimonials") {
    entries.push({ kind: "output", lines: TESTIMONIALS });
    return { clear: false, entries, cwd: context.cwd };
  }

  if (cmd === "hire") {
    entries.push({
      kind: "output",
      lines: [
        "Why hire Shivam:",
        "- Builds quickly without sacrificing system quality",
        "- Communicates clearly with product, design, and engineering",
        "- Optimizes for outcomes: revenue, retention, and reliability",
        "- Owns features end-to-end from idea to measurable impact",
      ],
    });
    return { clear: false, entries, cwd: context.cwd };
  }

  if (cmd === "contact") {
    entries.push({ kind: "output", lines: CONTACT });
    return { clear: false, entries, cwd: context.cwd };
  }

  if (cmd === "ls") {
    const includeAll = args.includes("-la") || args.includes("-al");
    const pathArg = args.find((arg) => !arg.startsWith("-"));
    const targetPath = resolvePath(context.cwd, pathArg);
    const lines = formatLs(targetPath, includeAll);
    if (!lines) {
      const node = getNode(targetPath);
      if (node && node.type === "file") {
        entries.push({ kind: "output", lines: [targetPath.split("/").pop() ?? targetPath] });
      } else {
        entries.push({ kind: "error", lines: [`ls: cannot access '${pathArg ?? targetPath}': No such file or directory`] });
      }
      return { clear: false, entries, cwd: context.cwd };
    }
    entries.push({ kind: "output", lines });
    return { clear: false, entries, cwd: context.cwd };
  }

  if (cmd === "cat") {
    const file = (args[0] ?? "").toLowerCase();
    if (!file) {
      entries.push({
        kind: "error",
        lines: ["Usage: cat <file>", "Example: cat about.txt"],
      });
      return { clear: false, entries, cwd: context.cwd };
    }

    const resolved = resolvePath(context.cwd, file);
    const node = getNode(resolved);
    if (!node || node.type !== "file") {
      entries.push({ kind: "error", lines: [`cat: ${file}: No such file or directory`] });
      return { clear: false, entries, cwd: context.cwd };
    }

    const baseName = resolved.split("/").pop() ?? "";
    const fileContents = getFileContents(baseName);
    if (fileContents) {
      entries.push({ kind: "output", lines: fileContents });
      return { clear: false, entries, cwd: context.cwd };
    }

    entries.push({ kind: "output", lines: [`[binary/blob] ${baseName}`] });
    return { clear: false, entries, cwd: context.cwd };
  }

  if (cmd === "banner") {
    entries.push({ kind: "system", lines: STARTUP_LINES });
    return { clear: false, entries, cwd: context.cwd };
  }

  entries.push({
    kind: "error",
    lines: [`Command not found: ${cmd}`, "Run `help` for available commands."],
  });
  return { clear: false, entries, cwd: context.cwd };
}
