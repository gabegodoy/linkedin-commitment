'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { addDays, mondayOf, monthLabel, weekday } from '@/lib/dates';
import { GOAL_COLUMNS, GOAL_LABELS, MILESTONES, ZERO, isFull, score, streak, total, type Counts, type Logs } from '@/lib/progress';
import { CHEERS } from '@/lib/words';

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

function Month({ logs, goals, today }: { logs: Logs; goals: Counts; today: string }) {
  const first = today.slice(0, 8) + '01';
  const days: string[] = [];
  for (let d = first; d.slice(0, 7) === today.slice(0, 7); d = addDays(d, 1)) days.push(d);
  const blanks = (weekday(first) + 6) % 7;
  const full = days.filter((d) => isFull(logs[d], goals)).length;
  const sum = total(goals);
  return (
    <>
      <h2>
        <span>Mês de {monthLabel(today)}</span>
        <span>
          {full} {full === 1 ? 'dia completo' : 'dias completos'}
        </span>
      </h2>
      <div className="card cal" role="img" aria-label={`${full} dias completos em ${monthLabel(today)}`}>
        {DAY_NAMES.map((n) => (
          <span key={n} className="cal-h">
            {n}
          </span>
        ))}
        {Array.from({ length: blanks }, (_, i) => (
          <span key={'b' + i} />
        ))}
        {days.map((d) => {
          const s = score(logs[d] ?? ZERO, goals);
          const cls = s >= sum && sum > 0 ? ' full' : s > 0 ? ' part' : '';
          return (
            <span key={d} className={'cal-d' + cls + (d === today ? ' today' : '') + (d > today ? ' future' : '')}>
              {Number(d.slice(8))}
            </span>
          );
        })}
      </div>
    </>
  );
}

export function Today({ userId, goals, today, initialLogs }: { userId: string; goals: Counts; today: string; initialLogs: Logs }) {
  const [logs, setLogs] = useState<Logs>(initialLogs);
  const [day, setDay] = useState(today);
  const [error, setError] = useState('');
  const yesterday = addDays(today, -1);
  const counts = logs[day] ?? ZERO;
  const sum = total(goals);
  const done = score(counts, goals);
  const run = streak(logs, goals, today);
  const monday = mondayOf(today);
  const week = DAY_NAMES.map((name, i) => ({ name, date: addDays(monday, i) }));
  const fullDays = week.filter((d) => isFull(logs[d.date], goals)).length;
  const hit = (MILESTONES as readonly number[]).includes(run);
  const cheer = done >= sum ? (hit ? CHEERS.milestone(run) : CHEERS.dayDone) : done > 0 ? CHEERS.dayHalf : CHEERS.dayStart;

  async function tap(i: number, j: number) {
    const next = [...counts] as Counts;
    next[i] = counts[i] === j + 1 ? j : j + 1;
    const previous = logs;
    setLogs({ ...logs, [day]: next });
    setError('');
    const row: Record<string, unknown> = { user_id: userId, day, updated_at: new Date().toISOString() };
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
        <span>{day === today ? 'Metas de hoje' : 'Metas de ontem'}</span>
        <span>
          {done} de {sum} feitas
        </span>
      </h2>
      <div className="seg" role="group" aria-label="Dia">
        <button type="button" aria-pressed={day === today} onClick={() => setDay(today)}>
          Hoje
        </button>
        <button type="button" aria-pressed={day === yesterday} onClick={() => setDay(yesterday)}>
          Ontem
        </button>
      </div>
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
      <p className={'msg ' + (done >= sum ? 'ok' : 'soft')} role="status">
        {day === today ? cheer : 'Esqueceu de marcar ontem? Marque aqui o que você fez.'}
      </p>

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

      <Month logs={logs} goals={goals} today={today} />
    </>
  );
}
