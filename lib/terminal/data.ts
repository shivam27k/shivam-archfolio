import { Entry, Profile, Project } from "@/lib/terminal/types";

export const PROFILE: Profile = {
    name: "Shivam Kumar",
    role: "Co-Founder @ Synthetic Beings | Full-Stack Engineer",
    location: "India",
    bio: "I enjoy breaking systems, understanding why they broke, fixing them, and repeating. Building synthetically at Synthetic Beings to help founders validate ideas fast and ship better products.",
};

export const SKILLS = [
    "Anything and Everything Necessary for Building",
    "Python",
    "MERN Stack",
    "Full-Stack Development",
    "Front-End Development",
    "Back-End Web Development",
    "Web Application Development",
    "Technical Architecture",
    "Software Development",
    "Platform Development",
    "REST APIs",
    "GraphQL",
    "AppSync",
    "AWS Amplify",
    "AWS Lambda",
    "Amazon S3",
    "Amazon DynamoDB",
    "Amazon Cognito",
    "Amazon EC2",
    "Amazon Web Services (AWS)",
    "Google Cloud Platform (GCP)",
    "Supabase",
    "Firebase",
    "Cloud Firestore",
    "Docker",
    "CI/CD",
    "TypeScript",
    "JavaScript",
    "Next.js",
    "NestJS",
    "Node.js",
    "Express.js",
    "React.js",
    "HTML5",
    "CSS",
    "Tailwind CSS",
    "SASS",
    "MongoDB",
    "Linux",
    "Shell Scripting",
    "Version Control",
    "Git",
    "npm",
    "Yarn",
    "Responsive Web Design",
    "Web Components",
    "DOM",
    "Hooks",
    "Flutter",
    "React Native",
    "Dart",
    "C",
    "C#",
    "Game Development",
    "Cybersecurity",
    "Debugging",
    "Software Troubleshooting",
    "Software Requirements",
    "Technical Ability",
    "Analytical Skills",
    "Content Strategy",
    "Web Content Writing",
    "Search Engine Optimization (SEO)",
    "Video Editing",
    "Mobile Interface Design",
];

export const EXPERIENCE = [
    "Co-Founder | Synthetic Beings | Jan 2026 - Present",
    "  - Building and shipping everything necessary for product validation and growth.",
    "  - Focus: founder tooling, rapid MVP execution, Python and full-stack systems.",
    "",
    "Freelance Software Engineer | Freelance | May 2025 - Present",
    "  - Delivered production apps using MERN, Next.js, Supabase, AWS, and cloud infra.",
    "",
    "Software Engineer | Rajasthan Patrika Pvt. Ltd. | Aug 2024 - Apr 2025",
    "  - Built and maintained production systems with AWS Amplify, NestJS, and TypeScript.",
    "  - Worked on APIs, architecture, and front-end delivery for live media products.",
    "",
    "Jr. Software Developer | Qrusible Talent Network | Aug 2023 - May 2024",
    "  - Worked across GraphQL, platform development, and full-stack product features.",
    "",
    "Data Engineer Intern | Qrusible Talent Network | May 2023 - Aug 2023",
    "  - Contributed to AWS-backed data and web systems, plus frontend implementation.",
    "",
    "Content Writer (Tech) | Freelance | Dec 2018 - Aug 2021",
    "  - Content strategy and technical writing focused on web and product topics.",
];

export const EDUCATION = [
    "Birla Institute of Technology, Mesra",
    "  degree : BCA",
    "  period : May 2020 - May 2023",
    "  grade  : 88.8%",
    "",
    "DAV Public School, Gandhinagar",
    "  degree : 12th Intermediate (Science)",
    "  period : May 2018 - Jan 2019",
    "  grade  : 75.2%",
];

export const CONTACT = [
    "name       : Shivam Kumar",
    "location   : India",
    "github     : https://github.com/shivam27k",
    "linkedin   : Shivam Kumar (Synthetic Beings)",
    "resume     : resume_shivam.pdf (click)",
    "note       : Direct contact details can be shared on request.",
];

export const STATS = [
    "linkedin followers    : 819",
    "linkedin connections  : 500+",
    "profile views         : 111",
    "post impressions      : 8,445 (last 7 days)",
    "search appearances    : 24",
];

export const TESTIMONIALS = [
    '"I enjoy breaking systems, understanding why they broke, fixing them, repeating."',
    '"Big fan of shipping, iterating, and learning in public."',
    '"Let us build cool stuff."',
];

export const PROJECTS: Project[] = [
    {
        id: "email_automation_bot",
        title: "email_automation_bot",
        summary: "Automates personalized outbound and follow-up email workflows with scalable Python pipelines.",
        stack: "Python",
        impact: "GitHub: 13 stars, 1 forks, updated 2026-02-21.",
    },
    {
        id: "marshmallowz",
        title: "Marshmallowz",
        summary: "Production-ready web application with polished UI flows and reusable frontend architecture.",
        stack: "TypeScript, CSS, JavaScript",
        impact: "GitHub: 0 stars, 0 forks, updated 2026-02-19.",
    },
    {
        id: "react-pdf-cropper",
        title: "react-pdf-cropper",
        summary: "Client-side PDF cropping utility for React with interactive selection and export workflow.",
        stack: "JavaScript, CSS, HTML",
        impact: "GitHub: 4 stars, 0 forks, updated 2025-11-25.",
    },
    {
        id: "land-of-the-dead",
        title: "Land of the Dead - A 3D PC Game",
        summary: "Unity-based 3D survival game prototype featuring level logic, gameplay mechanics, and world design.",
        stack: "C#, Unity",
        impact: "GitHub: 0 stars, 0 forks, updated 2024-04-26.",
    },
    {
        id: "leadstracker",
        title: "LeadsTracker",
        summary: "Lightweight browser-based lead tracking tool to capture, persist, and manage prospect URLs fast.",
        stack: "JavaScript, CSS, HTML",
        impact: "GitHub: 0 stars, 0 forks, updated 2024-06-06.",
    },
    {
        id: "us-accidents-da",
        title: "US-Accidents-DA",
        summary: "Exploratory analysis of US accident data (2016-2021) with trend breakdowns and insight visualizations.",
        stack: "HTML",
        impact: "GitHub: 0 stars, 0 forks, updated 2024-06-06.",
    },
    {
        id: "grocer_e",
        title: "grocer_e",
        summary: "Cross-platform grocery app built with Flutter featuring catalog, cart, and mobile-first UX patterns.",
        stack: "Dart, C++, CMake",
        impact: "GitHub: 0 stars, 0 forks, updated 2023-07-23.",
    },
    {
        id: "encorabot",
        title: "encorabot",
        summary: "Discord automation bot with command handling, moderation helpers, and extensible event-based modules.",
        stack: "Python, Cython, C++",
        impact: "GitHub: 0 stars, 0 forks, updated 2022-08-14.",
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
    "  project <id|number>   Open one project (e.g., project email_automation_bot, project 2)",
    "  pwd                   Print current virtual path",
    "  whoami                Show current user",
    "  uname [-a]            Show system information",
    "  date                  Show current date/time",
    "  history               Show command history",
    "  cd <path>             Change virtual directory (cd .., cd ~/projects)",
    "  ls -la [path]         List files (Linux style)",
    "  tree [path]           Show directory tree",
    "  mkdir [-p] <dir>      Create directory",
    "  touch <file>          Create empty file",
    "  rm [-rf] <path>       Remove file/directory",
    "  rmdir <dir>           Remove empty directory",
    "  mv <src> <dest>       Move or rename path",
    "  cp [-r] <src> <dest>  Copy file/directory",
    "  echo <text> [> file]  Print/write text",
    "  nano <file>           Minimal editor simulation",
    "  experience            Work timeline",
    "  stats                 Performance highlights",
    "  testimonials          Social proof",
    "  hire                  Why you should hire me",
    "  contact               Contact details",
    "  cat <file>            Read file (about.txt, skills.txt, projects.txt, experience.txt, education.txt, stats.txt, testimonials.txt, contact.txt, resume_shivam.pdf)",
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
    "Type `help` to explore the build.",
];

export const COMMANDS = [
    "help",
    "intro",
    "about",
    "live",
    "pwd",
    "whoami",
    "uname",
    "date",
    "history",
    "cd",
    "mkdir",
    "touch",
    "rm",
    "rmdir",
    "mv",
    "cp",
    "echo",
    "nano",
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
    "education.txt",
    "stats.txt",
    "testimonials.txt",
    "contact.txt",
    "resume_shivam.pdf",
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
            "Big fan of shipping, iterating, and learning in public.",
            "Let us build cool stuff.",
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

    if (normalized === "education.txt") {
        return EDUCATION;
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
            "# Shivam Kumar - Interactive Portfolio",
            "Command-driven profile with career timeline, skills, and project highlights.",
            "Try: about -> experience -> skills -> projects -> contact",
        ];
    }

    return null;
}
