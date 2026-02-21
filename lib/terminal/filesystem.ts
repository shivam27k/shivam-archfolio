export type VirtualNode = {
  type: "dir" | "file";
  children?: Record<string, VirtualNode>;
  size?: number;
  content?: string;
};

const FIXED_DATE = "Feb 20 12:00";
const OWNER = "visitor";
const GROUP = "staff";

const file = (size: number, content?: string): VirtualNode => ({ type: "file", size, content });
const dir = (children: Record<string, VirtualNode>): VirtualNode => ({
  type: "dir",
  children,
});

export const HOME_PATH = "/home/visitor";

export const FS_ROOT: VirtualNode = dir({
  home: dir({
    visitor: dir({
      "about.txt": file(428),
      "skills.txt": file(214),
      "projects.txt": file(376),
      "experience.txt": file(412),
      "education.txt": file(276),
      "stats.txt": file(188),
      "testimonials.txt": file(342),
      "contact.txt": file(256),
      "resume_shivam.pdf": file(245000),
      "readme.md": file(174),
      ".bashrc": file(312),
      ".profile": file(148),
      projects: dir({
        "aether.md": file(210),
        "forge.md": file(214),
        "pulse.md": file(208),
      }),
      assets: dir({
        images: dir({}),
        videos: dir({}),
      }),
      logs: dir({
        "session.log": file(94),
      }),
    }),
  }),
  etc: dir({
    hostname: file(18),
  }),
  var: dir({
    log: dir({
      "archfolio.log": file(102),
    }),
  }),
});

export function createInitialFsRoot() {
  return cloneFs(FS_ROOT);
}

function cloneFs(root: VirtualNode): VirtualNode {
  return JSON.parse(JSON.stringify(root)) as VirtualNode;
}

function splitPath(path: string) {
  return path.split("/").filter(Boolean);
}

function getParentPath(path: string) {
  const parts = splitPath(path);
  if (parts.length === 0) {
    return "/";
  }
  parts.pop();
  return `/${parts.join("/")}` || "/";
}

function getBaseName(path: string) {
  const parts = splitPath(path);
  return parts[parts.length - 1] ?? "";
}

export function resolvePath(cwd: string, inputPath: string | undefined) {
  const raw = (inputPath ?? "").trim();
  if (!raw || raw === "~") {
    return HOME_PATH;
  }

  const baseParts = raw.startsWith("/") ? [] : splitPath(cwd);
  const parts = raw.startsWith("~")
    ? [...splitPath(HOME_PATH), ...splitPath(raw.slice(1))]
    : [...baseParts, ...splitPath(raw)];

  const normalized: string[] = [];
  for (const part of parts) {
    if (part === ".") {
      continue;
    }
    if (part === "..") {
      normalized.pop();
      continue;
    }
    normalized.push(part);
  }

  return `/${normalized.join("/")}` || "/";
}

export function getNode(path: string, root: VirtualNode = FS_ROOT): VirtualNode | null {
  if (path === "/") {
    return root;
  }

  let cursor: VirtualNode = root;
  for (const segment of splitPath(path)) {
    if (cursor.type !== "dir" || !cursor.children || !cursor.children[segment]) {
      return null;
    }
    cursor = cursor.children[segment];
  }
  return cursor;
}

export function isDirectory(path: string, root: VirtualNode = FS_ROOT) {
  const node = getNode(path, root);
  return Boolean(node && node.type === "dir");
}

type LsEntry = {
  name: string;
  node: VirtualNode;
};

function getDirectoryEntries(path: string, root: VirtualNode = FS_ROOT): LsEntry[] | null {
  const node = getNode(path, root);
  if (!node || node.type !== "dir" || !node.children) {
    return null;
  }

  return Object.entries(node.children)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, child]) => ({ name, node: child }));
}

function formatPermission(node: VirtualNode) {
  return node.type === "dir" ? "drwxr-xr-x" : "-rw-r--r--";
}

export function formatLs(path: string, includeAll: boolean, root: VirtualNode = FS_ROOT) {
  const entries = getDirectoryEntries(path, root);
  if (!entries) {
    return null;
  }

  const visibleEntries = includeAll
    ? entries
    : entries.filter((entry) => !entry.name.startsWith("."));

  if (!includeAll) {
    return visibleEntries.map((entry) => entry.name);
  }

  const rows = [
    "total 0",
    `${"drwxr-xr-x"}  1 ${OWNER} ${GROUP} ${String(0).padStart(4)} ${FIXED_DATE} .`,
    `${"drwxr-xr-x"}  1 ${OWNER} ${GROUP} ${String(0).padStart(4)} ${FIXED_DATE} ..`,
    ...visibleEntries.map((entry) => {
      const size = String(entry.node.size ?? 0).padStart(4);
      return `${formatPermission(entry.node)}  1 ${OWNER} ${GROUP} ${size} ${FIXED_DATE} ${entry.name}`;
    }),
  ];

  return rows;
}

function renderTree(path: string, root: VirtualNode, prefix = ""): string[] {
  const entries = getDirectoryEntries(path, root) ?? [];
  const visible = entries.filter((entry) => !entry.name.startsWith("."));
  const lines: string[] = [];

  visible.forEach((entry, index) => {
    const isLast = index === visible.length - 1;
    const connector = isLast ? "\\-- " : "|-- ";
    lines.push(`${prefix}${connector}${entry.name}`);

    if (entry.node.type === "dir") {
      const nextPrefix = `${prefix}${isLast ? "    " : "|   "}`;
      lines.push(...renderTree(resolvePath(path, entry.name), root, nextPrefix));
    }
  });

  return lines;
}

export function formatTree(path: string, root: VirtualNode = FS_ROOT) {
  if (!isDirectory(path, root)) {
    return null;
  }

  return [path, ...renderTree(path, root)];
}

export function getPromptPath(cwd: string) {
  if (cwd === HOME_PATH) {
    return "~";
  }
  if (cwd.startsWith(`${HOME_PATH}/`)) {
    return `~/${cwd.slice(HOME_PATH.length + 1)}`;
  }
  return cwd;
}

type FsMutationResult = {
  nextRoot: VirtualNode;
  error?: string;
};

function makeError(root: VirtualNode, error: string): FsMutationResult {
  return { nextRoot: root, error };
}

function ensureParentDir(root: VirtualNode, absolutePath: string) {
  const parentPath = getParentPath(absolutePath);
  const parentNode = getNode(parentPath, root);
  if (!parentNode || parentNode.type !== "dir" || !parentNode.children) {
    return null;
  }
  return { parentPath, parentNode, baseName: getBaseName(absolutePath) };
}

export function mkdirPath(
  root: VirtualNode,
  cwd: string,
  rawTarget: string,
  parents: boolean,
): FsMutationResult {
  if (!rawTarget.trim()) {
    return makeError(root, "mkdir: missing operand");
  }

  const next = cloneFs(root);
  const absolute = resolvePath(cwd, rawTarget);

  if (parents) {
    const parts = splitPath(absolute);
    let cursor = next;
    for (const part of parts) {
      if (cursor.type !== "dir") {
        return makeError(root, `mkdir: cannot create directory '${rawTarget}'`);
      }
      cursor.children ??= {};
      if (!cursor.children[part]) {
        cursor.children[part] = dir({});
      } else if (cursor.children[part].type !== "dir") {
        return makeError(root, `mkdir: cannot create directory '${rawTarget}': Not a directory`);
      }
      cursor = cursor.children[part];
    }
    return { nextRoot: next };
  }

  const parent = ensureParentDir(next, absolute);
  if (!parent) {
    return makeError(root, `mkdir: cannot create directory '${rawTarget}': No such file or directory`);
  }

  if (parent.parentNode.children?.[parent.baseName]) {
    return makeError(root, `mkdir: cannot create directory '${rawTarget}': File exists`);
  }

  parent.parentNode.children ??= {};
  parent.parentNode.children[parent.baseName] = dir({});
  return { nextRoot: next };
}

export function touchPath(root: VirtualNode, cwd: string, rawTarget: string): FsMutationResult {
  if (!rawTarget.trim()) {
    return makeError(root, "touch: missing file operand");
  }

  const next = cloneFs(root);
  const absolute = resolvePath(cwd, rawTarget);
  const parent = ensureParentDir(next, absolute);
  if (!parent) {
    return makeError(root, `touch: cannot touch '${rawTarget}': No such file or directory`);
  }

  const existing = parent.parentNode.children?.[parent.baseName];
  if (existing && existing.type === "dir") {
    return makeError(root, `touch: cannot touch '${rawTarget}': Is a directory`);
  }

  parent.parentNode.children ??= {};
  parent.parentNode.children[parent.baseName] = existing ?? file(0, "");
  return { nextRoot: next };
}

export function writeFilePath(
  root: VirtualNode,
  cwd: string,
  rawTarget: string,
  text: string,
  append: boolean,
): FsMutationResult {
  if (!rawTarget.trim()) {
    return makeError(root, "write: missing file operand");
  }

  const next = cloneFs(root);
  const absolute = resolvePath(cwd, rawTarget);
  const parent = ensureParentDir(next, absolute);
  if (!parent) {
    return makeError(root, `write: cannot write '${rawTarget}': No such file or directory`);
  }

  const existing = parent.parentNode.children?.[parent.baseName];
  if (existing && existing.type === "dir") {
    return makeError(root, `write: cannot write '${rawTarget}': Is a directory`);
  }

  const current = existing?.content ?? "";
  const content = append ? `${current}${text}` : text;
  parent.parentNode.children ??= {};
  parent.parentNode.children[parent.baseName] = file(content.length, content);
  return { nextRoot: next };
}

function deletePath(root: VirtualNode, absolute: string, recursive: boolean, force: boolean): FsMutationResult {
  const parent = ensureParentDir(root, absolute);
  if (!parent) {
    return force ? { nextRoot: root } : makeError(root, `rm: cannot remove '${absolute}': No such file or directory`);
  }

  const target = parent.parentNode.children?.[parent.baseName];
  if (!target) {
    return force ? { nextRoot: root } : makeError(root, `rm: cannot remove '${absolute}': No such file or directory`);
  }

  if (target.type === "dir") {
    const childCount = Object.keys(target.children ?? {}).length;
    if (!recursive) {
      return makeError(root, `rm: cannot remove '${absolute}': Is a directory`);
    }
    if (!recursive && childCount > 0) {
      return makeError(root, `rm: cannot remove '${absolute}': Directory not empty`);
    }
  }

  delete parent.parentNode.children?.[parent.baseName];
  return { nextRoot: root };
}

export function rmPath(
  root: VirtualNode,
  cwd: string,
  rawTarget: string,
  recursive: boolean,
  force: boolean,
): FsMutationResult {
  if (!rawTarget.trim()) {
    return makeError(root, "rm: missing operand");
  }

  const next = cloneFs(root);
  const absolute = resolvePath(cwd, rawTarget);
  return deletePath(next, absolute, recursive, force);
}

export function rmdirPath(root: VirtualNode, cwd: string, rawTarget: string): FsMutationResult {
  if (!rawTarget.trim()) {
    return makeError(root, "rmdir: missing operand");
  }

  const next = cloneFs(root);
  const absolute = resolvePath(cwd, rawTarget);
  const node = getNode(absolute, next);
  if (!node || node.type !== "dir") {
    return makeError(root, `rmdir: failed to remove '${rawTarget}': No such directory`);
  }

  if (Object.keys(node.children ?? {}).length > 0) {
    return makeError(root, `rmdir: failed to remove '${rawTarget}': Directory not empty`);
  }

  const parent = ensureParentDir(next, absolute);
  if (!parent) {
    return makeError(root, `rmdir: failed to remove '${rawTarget}'`);
  }

  delete parent.parentNode.children?.[parent.baseName];
  return { nextRoot: next };
}

function cloneNode(node: VirtualNode): VirtualNode {
  return JSON.parse(JSON.stringify(node)) as VirtualNode;
}

export function mvPath(root: VirtualNode, cwd: string, rawSource: string, rawDest: string): FsMutationResult {
  if (!rawSource.trim() || !rawDest.trim()) {
    return makeError(root, "mv: missing file operand");
  }

  const next = cloneFs(root);
  const sourceAbs = resolvePath(cwd, rawSource);
  const destAbs = resolvePath(cwd, rawDest);

  const sourceParent = ensureParentDir(next, sourceAbs);
  if (!sourceParent) {
    return makeError(root, `mv: cannot stat '${rawSource}': No such file or directory`);
  }
  const sourceNode = sourceParent.parentNode.children?.[sourceParent.baseName];
  if (!sourceNode) {
    return makeError(root, `mv: cannot stat '${rawSource}': No such file or directory`);
  }

  const destinationNode = getNode(destAbs, next);
  let targetParentPath = getParentPath(destAbs);
  let targetName = getBaseName(destAbs);

  if (destinationNode && destinationNode.type === "dir") {
    targetParentPath = destAbs;
    targetName = sourceParent.baseName;
  }

  const targetParent = getNode(targetParentPath, next);
  if (!targetParent || targetParent.type !== "dir") {
    return makeError(root, `mv: cannot move to '${rawDest}': No such file or directory`);
  }

  targetParent.children ??= {};
  targetParent.children[targetName] = sourceNode;
  delete sourceParent.parentNode.children?.[sourceParent.baseName];

  return { nextRoot: next };
}

export function cpPath(
  root: VirtualNode,
  cwd: string,
  rawSource: string,
  rawDest: string,
  recursive: boolean,
): FsMutationResult {
  if (!rawSource.trim() || !rawDest.trim()) {
    return makeError(root, "cp: missing file operand");
  }

  const next = cloneFs(root);
  const sourceAbs = resolvePath(cwd, rawSource);
  const destAbs = resolvePath(cwd, rawDest);

  const sourceNode = getNode(sourceAbs, next);
  if (!sourceNode) {
    return makeError(root, `cp: cannot stat '${rawSource}': No such file or directory`);
  }

  if (sourceNode.type === "dir" && !recursive) {
    return makeError(root, `cp: -r not specified; omitting directory '${rawSource}'`);
  }

  const destinationNode = getNode(destAbs, next);
  let targetParentPath = getParentPath(destAbs);
  let targetName = getBaseName(destAbs);

  if (destinationNode && destinationNode.type === "dir") {
    targetParentPath = destAbs;
    targetName = getBaseName(sourceAbs);
  }

  const targetParent = getNode(targetParentPath, next);
  if (!targetParent || targetParent.type !== "dir") {
    return makeError(root, `cp: cannot create regular file '${rawDest}': No such file or directory`);
  }

  targetParent.children ??= {};
  targetParent.children[targetName] = cloneNode(sourceNode);
  return { nextRoot: next };
}

export function readFileContent(root: VirtualNode, path: string) {
  const node = getNode(path, root);
  if (!node || node.type !== "file") {
    return null;
  }
  return node.content ?? null;
}
