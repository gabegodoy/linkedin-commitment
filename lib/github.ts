export type ContribDay = { date: string; level: number; count: number };

export const GITHUB_USER_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/;

/** Lê o calendário público de contribuições do GitHub (sem token). */
export async function getContributions(username: string): Promise<ContribDay[] | null> {
  if (!GITHUB_USER_RE.test(username)) return null;
  try {
    const res = await fetch(`https://github.com/users/${username}/contributions`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; compromisso)' },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const counts = new Map<string, number>();
    for (const m of html.matchAll(/<tool-tip[^>]*for="(contribution-day-component-[\d-]+)"[^>]*>\s*([^<]*)/g)) {
      const n = /^(\d+)/.exec(m[2].trim());
      counts.set(m[1], n ? Number(n[1]) : 0);
    }
    const days: ContribDay[] = [];
    for (const m of html.matchAll(/<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="(contribution-day-component-[\d-]+)"[^>]*data-level="(\d)"/g)) {
      const level = Number(m[3]);
      days.push({ date: m[1], level, count: counts.get(m[2]) ?? (level > 0 ? 1 : 0) });
    }
    days.sort((a, b) => a.date.localeCompare(b.date));
    return days.length ? days : null;
  } catch {
    return null;
  }
}
