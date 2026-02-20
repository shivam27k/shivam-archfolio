import { EntryDraft } from "@/lib/terminal/types";

type GitHubUser = {
  login: string;
  followers: number;
  following: number;
  public_repos: number;
};

type GitHubRepo = {
  name: string;
  stargazers_count: number;
  updated_at: string;
  fork: boolean;
  description: string | null;
};

type GitHubEvent = {
  type: string;
  created_at: string;
  payload?: {
    commits?: Array<{ sha: string }>;
  };
};

function shortDate(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function getLast30DayMetrics(events: GitHubEvent[]) {
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentPushEvents = events.filter(
    (event) => event.type === "PushEvent" && new Date(event.created_at).getTime() >= cutoff,
  );

  const totalPushes = recentPushEvents.length;
  const estimatedCommits = recentPushEvents.reduce(
    (total, event) => total + (event.payload?.commits?.length ?? 0),
    0,
  );

  const daySet = new Set(
    recentPushEvents.map((event) => new Date(event.created_at).toISOString().slice(0, 10)),
  );
  const activeDays = daySet.size;

  const sortedDays = Array.from(daySet).sort();
  let longestStreak = 0;
  let currentStreak = 0;
  let lastDayMs: number | null = null;

  for (const day of sortedDays) {
    const dayMs = new Date(day).getTime();
    if (lastDayMs !== null && dayMs - lastDayMs === 24 * 60 * 60 * 1000) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
    lastDayMs = dayMs;
  }

  return { totalPushes, estimatedCommits, activeDays, longestStreak };
}

export async function getLiveGithubEntries(username: string): Promise<EntryDraft[]> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
  };

  const [userRes, reposRes, eventsRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, { headers }),
    fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers }),
    fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, { headers }),
  ]);

  if (!userRes.ok) {
    throw new Error(`GitHub profile request failed (${userRes.status}).`);
  }
  if (!reposRes.ok) {
    throw new Error(`GitHub repos request failed (${reposRes.status}).`);
  }
  if (!eventsRes.ok) {
    throw new Error(`GitHub events request failed (${eventsRes.status}).`);
  }

  const user = (await userRes.json()) as GitHubUser;
  const repos = (await reposRes.json()) as GitHubRepo[];
  const events = (await eventsRes.json()) as GitHubEvent[];

  const nonForkRepos = repos.filter((repo) => !repo.fork);
  const totalStars = nonForkRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const latestRepos = [...nonForkRepos]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);
  const metrics = getLast30DayMetrics(events);

  const lines = [
    `GitHub Live Snapshot (${new Date().toISOString().slice(0, 10)} UTC)`,
    `profile        : ${user.login}`,
    `followers      : ${user.followers}`,
    `following      : ${user.following}`,
    `public repos   : ${user.public_repos}`,
    `total stars    : ${totalStars} (non-fork repos)`,
    `30d pushes     : ${metrics.totalPushes}`,
    `30d commits    : ${metrics.estimatedCommits} (estimated from push payloads)`,
    `30d active days: ${metrics.activeDays}`,
    `30d best streak: ${metrics.longestStreak} days`,
    "",
    "latest repos:",
    ...latestRepos.map((repo) => {
      const description = repo.description ? ` - ${repo.description}` : "";
      return `- ${repo.name} | *${repo.stargazers_count} | updated ${shortDate(repo.updated_at)}${description}`;
    }),
  ];

  return [{ kind: "output", lines }];
}
