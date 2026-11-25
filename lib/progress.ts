import { addDays, weekday } from './dates';

export type Counts = [number, number, number, number];
export type Logs = Record<string, Counts>;

export const GOAL_LABELS = ['Novas conexões', 'Curtidas', 'Comentários', 'Post ou compartilhamento'] as const;
export const GOAL_COLUMNS = ['connections', 'likes', 'comments', 'posts'] as const;
export const MILESTONES = [10, 30, 45, 100] as const;
export const ZERO: Counts = [0, 0, 0, 0];

export function score(c: Counts, g: Counts) {
  return c.reduce((s, v, i) => s + Math.min(v, g[i]), 0);
}

export function total(g: Counts) {
  return g.reduce((s, v) => s + v, 0);
}

export function isFull(c: Counts | undefined, g: Counts) {
  return total(g) > 0 && score(c ?? ZERO, g) >= total(g);
}

/**
 * Dias seguidos com todas as metas cumpridas.
 * Hoje ainda incompleto não quebra a sequência. Sábado e domingo não quebram:
 * se a pessoa fizer, conta; se não fizer, a sequência continua.
 */
export function streak(logs: Logs, g: Counts, today: string) {
  let n = 0;
  let d = isFull(logs[today], g) ? today : addDays(today, -1);
  for (let i = 0; i < 800; i++) {
    if (isFull(logs[d], g)) n++;
    else if (weekday(d) !== 0 && weekday(d) !== 6) break;
    d = addDays(d, -1);
  }
  return n;
}

/** Sequência do CTD: todo dia conta, inclusive fim de semana. */
export function dailyStreak(active: Set<string>, today: string) {
  let n = 0;
  let d = active.has(today) ? today : addDays(today, -1);
  while (active.has(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

type LogRow = { day: string; connections: number; likes: number; comments: number; posts: number };

export function toLogs(rows: LogRow[] | null): Logs {
  const out: Logs = {};
  (rows ?? []).forEach((r) => {
    out[r.day] = [r.connections, r.likes, r.comments, r.posts];
  });
  return out;
}
