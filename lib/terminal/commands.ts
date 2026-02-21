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
  cpPath,
  formatLs,
  formatTree,
  getNode,
  getPromptPath,
  HOME_PATH,
  isDirectory,
  mkdirPath,
  mvPath,
  readFileContent,
  resolvePath,
  rmPath,
  rmdirPath,
  touchPath,
  VirtualNode,
  writeFilePath,
} from "@/lib/terminal/filesystem";
import { EntryDraft } from "@/lib/terminal/types";

type CommandContext = {
  cwd: string;
  fsRoot: VirtualNode;
  commandHistory: string[];
};

type CommandResult = {
  clear: boolean;
  entries: EntryDraft[];
  action?: { type: "live" } | { type: "open_url"; url: string };
  cwd?: string;
  fsRoot?: VirtualNode;
};

function stripQuotes(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function handleMutation(
  result: { nextRoot: VirtualNode; error?: string },
  entries: EntryDraft[],
  cwd: string,
  successMessage?: string,
): CommandResult {
  if (result.error) {
    entries.push({ kind: "error", lines: [result.error] });
    return { clear: false, entries, cwd, fsRoot: result.nextRoot };
  }

  if (successMessage) {
    entries.push({ kind: "system", lines: [successMessage] });
  }

  return { clear: false, entries, cwd, fsRoot: result.nextRoot };
}

export function executeCommand(raw: string, context: CommandContext): CommandResult {
  const value = raw.trim();
  if (!value) {
    return { clear: false, entries: [], cwd: context.cwd, fsRoot: context.fsRoot };
  }

  const [command, ...args] = value.split(/\s+/);
  const normalizedCommand = command.startsWith("/") ? command.slice(1) : command;
  const cmd = normalizedCommand.toLowerCase();

  if (cmd === "clear") {
    return { clear: true, entries: [], cwd: context.cwd, fsRoot: context.fsRoot };
  }

  const entries: EntryDraft[] = [{ kind: "command", lines: [value], promptPath: getPromptPath(context.cwd) }];

  if (cmd === "help") {
    entries.push({ kind: "output", lines: HELP_LINES });
    return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
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
    return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
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
    return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
  }

  if (cmd === "live") {
    entries.push({ kind: "system", lines: ["Fetching live GitHub snapshot..."] });
    return { clear: false, entries, action: { type: "live" }, cwd: context.cwd, fsRoot: context.fsRoot };
  }

  if (cmd === "pwd") {
    entries.push({ kind: "output", lines: [context.cwd] });
    return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
  }

  if (cmd === "whoami") {
    entries.push({ kind: "output", lines: ["visitor"] });
    return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
  }

  if (cmd === "uname") {
    if (args.includes("-a")) {
      entries.push({ kind: "output", lines: ["archfolio 6.6.0-virtual #1 SMP PREEMPT x86_64 GNU/Linux"] });
    } else {
      entries.push({ kind: "output", lines: ["Linux"] });
    }
    return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
  }

  if (cmd === "date") {
    entries.push({ kind: "output", lines: [new Date().toString()] });
    return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
  }

  if (cmd === "history") {
    const lines = context.commandHistory.length
      ? context.commandHistory.map((item, index) => `${index + 1}  ${item}`)
      : ["No command history yet."];
    entries.push({ kind: "output", lines });
    return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
  }

  if (cmd === "cd") {
    const target = args.join(" ");
    const nextPath = resolvePath(context.cwd, target || HOME_PATH);
    if (!isDirectory(nextPath, context.fsRoot)) {
      entries.push({ kind: "error", lines: [`cd: no such file or directory: ${target || nextPath}`] });
      return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
    }
    return { clear: false, entries, cwd: nextPath, fsRoot: context.fsRoot };
  }

  if (cmd === "mkdir") {
    const createParents = args.includes("-p");
    const target = args.find((arg) => !arg.startsWith("-")) ?? "";
    return handleMutation(mkdirPath(context.fsRoot, context.cwd, target, createParents), entries, context.cwd);
  }

  if (cmd === "touch") {
    const target = args[0] ?? "";
    return handleMutation(touchPath(context.fsRoot, context.cwd, target), entries, context.cwd);
  }

  if (cmd === "rm") {
    const recursive = args.includes("-r") || args.includes("-rf") || args.includes("-fr");
    const force = args.includes("-f") || args.includes("-rf") || args.includes("-fr");
    const target = args.find((arg) => !arg.startsWith("-")) ?? "";
    return handleMutation(rmPath(context.fsRoot, context.cwd, target, recursive, force), entries, context.cwd);
  }

  if (cmd === "rmdir") {
    const target = args[0] ?? "";
    return handleMutation(rmdirPath(context.fsRoot, context.cwd, target), entries, context.cwd);
  }

  if (cmd === "mv") {
    const source = args[0] ?? "";
    const destination = args[1] ?? "";
    return handleMutation(mvPath(context.fsRoot, context.cwd, source, destination), entries, context.cwd);
  }

  if (cmd === "cp") {
    const recursive = args.includes("-r");
    const positional = args.filter((arg) => !arg.startsWith("-"));
    const source = positional[0] ?? "";
    const destination = positional[1] ?? "";
    return handleMutation(cpPath(context.fsRoot, context.cwd, source, destination, recursive), entries, context.cwd);
  }

  if (cmd === "echo") {
    const rawAfterCommand = value.slice(command.length).trim();
    const redirectMatch = rawAfterCommand.match(/^(.*?)(>>|>)\s+(.+)$/);

    if (!redirectMatch) {
      entries.push({ kind: "output", lines: [stripQuotes(rawAfterCommand)] });
      return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
    }

    const text = stripQuotes(redirectMatch[1]);
    const operator = redirectMatch[2];
    const target = redirectMatch[3].trim();
    const append = operator === ">>";
    return handleMutation(writeFilePath(context.fsRoot, context.cwd, target, `${text}\n`, append), entries, context.cwd);
  }

  if (cmd === "nano") {
    const target = args[0] ?? "";
    if (!target) {
      entries.push({ kind: "error", lines: ["Usage: nano <file> [--set \"text\"] [--append \"text\"]"] });
      return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
    }

    const setIndex = args.indexOf("--set");
    const appendIndex = args.indexOf("--append");

    if (setIndex >= 0) {
      const text = stripQuotes(args.slice(setIndex + 1).join(" "));
      return handleMutation(writeFilePath(context.fsRoot, context.cwd, target, `${text}\n`, false), entries, context.cwd);
    }

    if (appendIndex >= 0) {
      const text = stripQuotes(args.slice(appendIndex + 1).join(" "));
      return handleMutation(writeFilePath(context.fsRoot, context.cwd, target, `${text}\n`, true), entries, context.cwd);
    }

    const touched = touchPath(context.fsRoot, context.cwd, target);
    if (touched.error) {
      entries.push({ kind: "error", lines: [touched.error] });
      return { clear: false, entries, cwd: context.cwd, fsRoot: touched.nextRoot };
    }

    entries.push({
      kind: "system",
      lines: [
        `GNU nano 7.2    ${target}`,
        "Use: nano <file> --set \"text\" to overwrite",
        "Use: nano <file> --append \"text\" to append",
      ],
    });
    return { clear: false, entries, cwd: context.cwd, fsRoot: touched.nextRoot };
  }

  if (cmd === "skills") {
    entries.push({ kind: "output", lines: SKILLS.map((skill) => `- ${skill}`) });
    return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
  }

  if (cmd === "projects") {
    entries.push({
      kind: "output",
      lines: ["Project Index:", ...formatProjectList(), "Run `project <id|number>` for details."],
    });
    return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
  }

  if (cmd === "project") {
    const target = args.join(" ").toLowerCase();
    if (!target) {
      entries.push({
        kind: "error",
        lines: ["Usage: project <id|number>", "Example: project email_automation_bot"],
      });
      return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
    }

    const project = findProject(target);
    if (!project) {
      entries.push({
        kind: "error",
        lines: ["Project not found.", "Run `projects` to see valid options."],
      });
      return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
    }

    entries.push({ kind: "output", lines: formatProjectDetails(project) });
    return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
  }

  if (cmd === "tree") {
    const rawPathArg = args.join(" ").trim();
    const targetPath = rawPathArg ? resolvePath(context.cwd, rawPathArg) : context.cwd;
    const lines = formatTree(targetPath, context.fsRoot);
    if (!lines) {
      entries.push({ kind: "error", lines: [`tree: ${targetPath}: No such directory`] });
      return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
    }
    entries.push({ kind: "output", lines });
    return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
  }

  if (cmd === "experience") {
    entries.push({ kind: "output", lines: EXPERIENCE });
    return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
  }

  if (cmd === "stats") {
    entries.push({ kind: "output", lines: STATS });
    return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
  }

  if (cmd === "testimonials") {
    entries.push({ kind: "output", lines: TESTIMONIALS });
    return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
  }

  if (cmd === "hire") {
    entries.push({
      kind: "output",
      lines: [
        "Why hire Shivam:",
        "- Founder mindset with hands-on shipping speed",
        "- Strong full-stack ownership: architecture, APIs, frontend, and cloud",
        "- Product validation focus: build, measure, iterate quickly",
        "- Comfortable across startup chaos and production-grade delivery",
      ],
    });
    return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
  }

  if (cmd === "contact") {
    entries.push({ kind: "output", lines: CONTACT });
    return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
  }

  if (cmd === "ls") {
    const includeAll = args.includes("-la") || args.includes("-al");
    const pathArg = args.find((arg) => !arg.startsWith("-"));
    const targetPath = pathArg ? resolvePath(context.cwd, pathArg) : context.cwd;
    const lines = formatLs(targetPath, includeAll, context.fsRoot);
    if (!lines) {
      const node = getNode(targetPath, context.fsRoot);
      if (node && node.type === "file") {
        entries.push({ kind: "output", lines: [targetPath.split("/").pop() ?? targetPath] });
      } else {
        entries.push({ kind: "error", lines: [`ls: cannot access '${pathArg ?? targetPath}': No such file or directory`] });
      }
      return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
    }
    if (!includeAll) {
      entries.push({ kind: "output", lines: [`__LS_WRAP__${lines.join("\t")}`] });
    } else {
      entries.push({ kind: "output", lines });
    }
    return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
  }

  if (cmd === "cat") {
    const file = (args[0] ?? "").toLowerCase();
    if (!file) {
      entries.push({
        kind: "error",
        lines: ["Usage: cat <file>", "Example: cat about.txt"],
      });
      return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
    }

    const resolved = resolvePath(context.cwd, file);
    const node = getNode(resolved, context.fsRoot);
    if (!node || node.type !== "file") {
      entries.push({ kind: "error", lines: [`cat: ${file}: No such file or directory`] });
      return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
    }

    const storedContent = readFileContent(context.fsRoot, resolved);
    if (storedContent !== null) {
      const lines = storedContent.split("\n");
      if (lines[lines.length - 1] === "") {
        lines.pop();
      }
      entries.push({ kind: "output", lines: lines.length > 0 ? lines : [""] });
      return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
    }

    const baseName = resolved.split("/").pop() ?? "";
    if (baseName === "resume_shivam.pdf") {
      entries.push({ kind: "system", lines: ["Opening resume_shivam.pdf in a new tab..."] });
      return {
        clear: false,
        entries,
        cwd: context.cwd,
        fsRoot: context.fsRoot,
        action: { type: "open_url", url: "/resume_shivam.pdf" },
      };
    }

    const fileContents = getFileContents(baseName);
    if (fileContents) {
      entries.push({ kind: "output", lines: fileContents });
      return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
    }

    entries.push({ kind: "output", lines: [`[binary/blob] ${baseName}`] });
    return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
  }

  if (cmd === "banner") {
    entries.push({ kind: "system", lines: STARTUP_LINES });
    return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
  }

  entries.push({
    kind: "error",
    lines: [`Command not found: ${cmd}`, "Run `help` for available commands."],
  });
  return { clear: false, entries, cwd: context.cwd, fsRoot: context.fsRoot };
}
