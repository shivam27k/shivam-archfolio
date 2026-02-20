export type VirtualNode = {
  type: "dir" | "file";
  children?: Record<string, VirtualNode>;
  size?: number;
};

const FIXED_DATE = "Feb 20 12:00";
const OWNER = "visitor";
const GROUP = "staff";

const file = (size: number): VirtualNode => ({ type: "file", size });
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
      "stats.txt": file(188),
      "testimonials.txt": file(342),
      "contact.txt": file(256),
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

function splitPath(path: string) {
  return path.split("/").filter(Boolean);
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

export function getNode(path: string): VirtualNode | null {
  if (path === "/") {
    return FS_ROOT;
  }

  let cursor: VirtualNode = FS_ROOT;
  for (const segment of splitPath(path)) {
    if (cursor.type !== "dir" || !cursor.children || !cursor.children[segment]) {
      return null;
    }
    cursor = cursor.children[segment];
  }
  return cursor;
}

export function isDirectory(path: string) {
  const node = getNode(path);
  return Boolean(node && node.type === "dir");
}

type LsEntry = {
  name: string;
  node: VirtualNode;
};

function getDirectoryEntries(path: string): LsEntry[] | null {
  const node = getNode(path);
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

export function formatLs(path: string, includeAll: boolean) {
  const entries = getDirectoryEntries(path);
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

function renderTree(path: string, prefix = ""): string[] {
  const entries = getDirectoryEntries(path) ?? [];
  const visible = entries.filter((entry) => !entry.name.startsWith("."));
  const lines: string[] = [];

  visible.forEach((entry, index) => {
    const isLast = index === visible.length - 1;
    const connector = isLast ? "└── " : "├── ";
    lines.push(`${prefix}${connector}${entry.name}`);

    if (entry.node.type === "dir") {
      const nextPrefix = `${prefix}${isLast ? "    " : "│   "}`;
      lines.push(...renderTree(resolvePath(path, entry.name), nextPrefix));
    }
  });

  return lines;
}

export function formatTree(path: string) {
  if (!isDirectory(path)) {
    return null;
  }

  return [path, ...renderTree(path)];
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
