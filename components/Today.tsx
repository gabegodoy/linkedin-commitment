'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { addDays, mondayOf } from '@/lib/dates';
import { GOAL_COLUMNS, GOAL_LABELS, MILESTONES, ZERO, isFull, score, streak, total, type Counts, type Logs } from '@/lib/progress';

const DAY_NAMES = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

export function Milestones({ value, unit = 'dias' }: { value: number; unit?: string }) {
  return (
    <div className="miles">
      {MILESTONES.map((m) => (
        <div key={m} className={'mile' + (value >= m ? ' hit' : '')}>
          <b>{m}</b>
          <span>{value >= m ? 'conquistado' : `faltam ${m - value} ${unit}`}</span>
        </div>
      ))}
    </div>
  );
}

export function Today({ userId, goals, today, initialLogs }: { userId: string; goals: Counts; today: string; initialLogs: Logs }) {
  const [logs, setLogs] = useState<Logs>(initialLogs);
  const [error, setError] = useState('');
  const counts = logs[today] ?? ZERO;
  const sum = total(goals);
  const done = score(counts, goals);
  const run = streak(logs, goals, today);
  const monday = mondayOf(today);
  const week = DAY_NAMES.map((name, i) => ({ name, date: addDays(monday, i) }));
  const fullDays = week.filter((d) => isFull(logs[d.date], goals)).length;

  async function tap(i: number, j: number) {
    const next = [...counts] as Counts;
    next[i] = counts[i] === j + 1 ? j : j + 1;
    const previous = logs;
    setLogs({ ...logs, [today]: next });
    setError('');
    const row: Record<string, unknown> = { user_id: userId, day: today, updated_at: new Date().toISOString() };
    GOAL_COLUMNS.forEach((c, k) => (row[c] = next[k]));
    const { error } = await createClient().from('daily_log').upsert(row, { onConflict: 'user_id,day' });
    if (error) {
      setLogs(previous);
      setError('Não foi possível salvar. Verifique a internet e toque de novo.');
    }
  }

  return (
    <>
      <h2>
        <span>Metas de hoje</span>
        <span>
          {done} de {sum} feitas
        </span>
      </h2>
      <div className="card">
        {GOAL_LABELS.map((label, i) =>
          goals[i] > 0 ? (
            <div key={label} className={'goal' + (counts[i] >= goals[i] ? ' done' : '')}>
              <div className="top">
                <span>{label}</span>
                <span>
                  {Math.min(counts[i], goals[i])} de {goals[i]}
                </span>
              </div>
              <div className="boxes">
                {Array.from({ length: goals[i] }, (_, j) => {
                  const on = j < counts[i];
                  return (
                    <button key={j} type="button" className={'box' + (on ? ' on' : '')} aria-pressed={on} aria-label={`${label}: ${j + 1} de ${goals[i]}`} onClick={() => tap(i, j)}>
                      {on ? '✓' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null,
        )}
      </div>
      {error && (
        <p className="msg err" role="alert">
          {error}
        </p>
      )}
      <p className="msg soft">Fez uma ação no LinkedIn? Toque em um quadrado para marcar.</p>

      <h2>
        <span>Esta semana</span>
        <span>{fullDays} de 7 dias completos</span>
      </h2>
      <div className="card week">
        {week.map((d) => {
          const s = score(logs[d.date] ?? ZERO, goals);
          const cls = s >= sum && sum > 0 ? ' full' : s > 0 ? ' part' : '';
          return (
            <div key={d.date} className={'day' + cls + (d.date === today ? ' today' : '')}>
              <i />
              {d.date === today ? 'hoje' : d.name}
            </div>
          );
        })}
      </div>

      <h2>
        <span>Dias seguidos</span>
        <span>
          {run} {run === 1 ? 'dia' : 'dias'}
        </span>
      </h2>
      <Milestones value={run} />
      <p className="msg muted">Um dia conta quando todas as metas são cumpridas. Sábado e domingo não quebram a sequência.</p>
    </>
  );
}
