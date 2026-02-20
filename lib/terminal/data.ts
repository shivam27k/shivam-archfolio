import { Entry, Profile, Project } from "@/lib/terminal/types";

export const PROFILE: Profile = {
  name: "Shivam Kumar",
  role: "Product-Focused Full-Stack Engineer",
  location: "Bengaluru, India",
  bio: "I design and ship digital products people remember. I blend fast frontend systems, resilient backends, and crisp product thinking to turn ideas into category-leading experiences.",
};

export const SKILLS = [
  "TypeScript",
  "Next.js",
  "React",
  "Node.js",
  "PostgreSQL",
  "GraphQL",
  "Redis",
  "Docker",
  "Playwright",
  "CI/CD",
];

export const EXPERIENCE = [
  "2024 - Present | Senior Software Engineer | NovaStack Labs",
  "  - Led migration to Next.js app router, reducing TTI by 32%.",
  "  - Built reusable UI primitives used across 4 product lines.",
  "2022 - 2024 | Frontend Engineer | PixelNorth",
  "  - Shipped analytics workspace used by 20k+ monthly users.",
  "  - Introduced test automation and cut regressions by 41%.",
];

export const CONTACT = [
  "email      : shivam.dev@example.com",
  "github     : https://github.com/shivam-dev",
  "linkedin   : https://linkedin.com/in/shivam-dev",
  "resume     : https://example.com/shivam-resume.pdf",
  "calendar   : https://cal.com/shivam-dev/intro",
];

export const STATS = [
  "products shipped      : 26",
  "avg lighthouse score  : 97",
  "weekly active users   : 140k+",
  "api uptime            : 99.97%",
  "deployment frequency  : 34 / month",
];

export const TESTIMONIALS = [
  '"Shivam brings founder-level ownership to every sprint." - Product Lead, NovaStack',
  '"Our release quality changed completely after his DX improvements." - Engineering Manager, PixelNorth',
  '"Fast, sharp, and exceptionally reliable under pressure." - Startup Founder, OrbitalPay',
];

export const PROJECTS: Project[] = [
  {
    id: "aether",
    title: "Aether Analytics",
    summary:
      "Real-time product analytics dashboard with role-based access and custom event pipelines.",
    stack: "Next.js, Node.js, PostgreSQL, Redis",
    impact: "Reduced reporting delay from 24h to under 3 minutes.",
  },
  {
    id: "forge",
    title: "Forge Commerce",
    summary:
      "Headless commerce storefront with personalized search and optimized checkout flows.",
    stack: "Next.js, GraphQL, Stripe, Edge Caching",
    impact: "Improved checkout conversion by 18%.",
  },
  {
    id: "pulse",
    title: "Pulse Deploy",
    summary: "Internal deployment console with guardrails, previews, and release scoring.",
    stack: "React, TypeScript, Fastify, Docker",
    impact: "Cut rollback rate by 37% over two quarters.",
  },
];

export const HELP_LINES = [
  "Available commands:",
  "  help                  Show all commands",
  "  intro                 Quick intro",
  "  about                 Who I am",
  "  live                  Live GitHub snapshot",
  "  skills                Technical skills",
  "  projects              List projects",
  "  project <id|number>   Open one project (e.g., project aether, project 2)",
  "  pwd                   Print current virtual path",
  "  cd <path>             Change virtual directory (cd .., cd ~/projects)",
  "  ls -la [path]         List files (Linux style)",
  "  tree [path]           Show directory tree",
  "  experience            Work timeline",
  "  stats                 Performance highlights",
  "  testimonials          Social proof",
  "  hire                  Why you should hire me",
  "  contact               Contact details",
  "  cat <file>            Read file (about.txt, skills.txt, projects.txt, experience.txt, stats.txt, testimonials.txt, contact.txt)",
  "  banner                Show the startup banner again",
  "  clear                 Clear terminal history",
  "",
  "Keyboard:",
  "  Tab                   Auto-complete command or argument",
  "  Ctrl+L                Clear the terminal",
  "  Ctrl+C                Cancel current input",
  "  Up/Down               Command history",
];

export const STARTUP_LINES = [
  "Booting archfolio v3.2.1 ...",
  "Injecting vision modules ... done",
  "Loading command registry ... done",
  "Secure shell established.",
  "",
  "Type `help` to explore the dream build.",
];

export const COMMANDS = [
  "help",
  "intro",
  "about",
  "live",
  "pwd",
  "cd",
  "skills",
  "projects",
  "project",
  "tree",
  "experience",
  "stats",
  "testimonials",
  "hire",
  "contact",
  "ls",
  "cat",
  "banner",
  "clear",
];

export const FILES = [
  "about.txt",
  "skills.txt",
  "projects.txt",
  "experience.txt",
  "stats.txt",
  "testimonials.txt",
  "contact.txt",
  "readme.md",
];

export const QUICK_COMMANDS = ["help", "intro", "about", "projects"];

export const GITHUB_USERNAME = "shivam27k";

export function startupEntries(): Entry[] {
  return [
    { id: 1, kind: "system", lines: ["Welcome to Shivam's Interactive Portfolio Terminal"] },
    { id: 2, kind: "system", lines: STARTUP_LINES },
  ];
}

export function formatProjectList() {
  return PROJECTS.map((project, index) => `${index + 1}. ${project.title} [${project.id}]`);
}

export function formatProjectDetails(project: Project) {
  return [
    `${project.title} (${project.id})`,
    `summary : ${project.summary}`,
    `stack   : ${project.stack}`,
    `impact  : ${project.impact}`,
  ];
}

export function findProject(target: string) {
  const normalized = target.toLowerCase();
  const byNumber = Number(normalized);
  const projectByNumber =
    Number.isInteger(byNumber) && byNumber > 0 ? PROJECTS[byNumber - 1] : undefined;
  const projectById = PROJECTS.find((project) => project.id === normalized);
  return projectById ?? projectByNumber;
}

export function getFileContents(file: string): string[] | null {
  const normalized = file.toLowerCase();

  if (normalized === "about.txt") {
    return [
      `${PROFILE.name} is a ${PROFILE.role} based in ${PROFILE.location}.`,
      PROFILE.bio,
    ];
  }

  if (normalized === "skills.txt") {
    return SKILLS.map((skill) => `* ${skill}`);
  }

  if (normalized === "projects.txt") {
    return formatProjectList();
  }

  if (normalized === "experience.txt") {
    return EXPERIENCE;
  }

  if (normalized === "contact.txt") {
    return CONTACT;
  }

  if (normalized === "stats.txt") {
    return STATS;
  }

  if (normalized === "testimonials.txt") {
    return TESTIMONIALS;
  }

  if (normalized === "readme.md") {
    return [
      "# Dream Terminal Portfolio",
      "Everything is command-driven by design.",
      "Try: intro -> projects -> stats -> testimonials -> contact",
    ];
  }

  return null;
}
