import { ALL_ITEMS, type Item } from './checklist';

export type PlanItem = { item: Item; done: boolean; focus: boolean };

/**
 * Itens da semana: o que já foi feito desde segunda, o foco definido pelo mentor
 * e, se ainda faltar para a meta semanal, os próximos pendentes na ordem do checklist.
 */
export function weekPlan(doneAt: Record<number, string>, focus: Set<number>, target: number, monday: string): PlanItem[] {
  const isDone = (id: number) => id in doneAt;
  const picked = ALL_ITEMS.filter((it) => (isDone(it.id) && doneAt[it.id] >= monday) || (focus.has(it.id) && !isDone(it.id)));
  const ids = new Set(picked.map((it) => it.id));
  for (const it of ALL_ITEMS) {
    if (ids.size >= target) break;
    if (!isDone(it.id) && !ids.has(it.id)) ids.add(it.id);
  }
  return ALL_ITEMS.filter((it) => ids.has(it.id)).map((item) => ({ item, done: isDone(item.id), focus: focus.has(item.id) }));
}
