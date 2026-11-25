import Link from 'next/link';
import { NewMenteeForm } from '@/components/MentorForms';
import { TOTAL_ITEMS } from '@/lib/checklist';
import { addDays, formatLong, formatShort, mondayOf, todayISO } from '@/lib/dates';
import { ZERO, isFull, score, streak, toLogs, total, type Logs } from '@/lib/progress';
import { requireMentor } from '@/lib/session';
import { goalsOf, has, type Profile } from '@/lib/types';

export default async function MentorPage() {
  const { supabase } = await requireMentor();
  const today = todayISO();
  const [people, logRows, doneRows] = await Promise.all([
    supabase.from('profiles').select('*').eq('role', 'mentee').order('name'),
    supabase.from('daily_log').select('user_id, day, connections, likes, comments, posts').gte('day', addDays(today, -500)),
    supabase.from('checklist_done').select('user_id').eq('done', true),
  ]);
  const mentees = (people.data ?? []) as Profile[];
  const byUser: Record<string, typeof logRows.data> = {};
  (logRows.data ?? []).forEach((r) => (byUser[r.user_id] ??= [])!.push(r));
  const doneCount: Record<string, number> = {};
  (doneRows.data ?? []).forEach((r) => (doneCount[r.user_id] = (doneCount[r.user_id] ?? 0) + 1));
  const monday = mondayOf(today);
  const week = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  const rows = mentees.map((p) => {
    const goals = goalsOf(p);
    const logs: Logs = toLogs(byUser[p.id] ?? null);
    const active = Object.keys(logs).filter((d) => score(logs[d], goals) > 0).sort();
    const last = active[active.length - 1];
    return {
      p,
      todayScore: score(logs[today] ?? ZERO, goals),
      sum: total(goals),
      run: streak(logs, goals, today),
      weekFull: week.filter((d) => isFull(logs[d], goals)).length,
      done: doneCount[p.id] ?? 0,
      last,
      quiet: !last || last < addDays(today, -3),
    };
  });

  return (
    <>
      <div>
        <span className="eyebrow">{formatLong(today)}</span>
        <h1>
          Pessoas<em>.</em>
        </h1>
        <p className="soft" style={{ margin: 0 }}>
          {mentees.length === 0 ? 'Cadastre a primeira pessoa da mentoria.' : `${mentees.length} ${mentees.length === 1 ? 'pessoa' : 'pessoas'} na mentoria. ${rows.filter((r) => has(r.p, 'daily') && r.todayScore >= r.sum && r.sum > 0).length} já fecharam as metas de hoje.`}
        </p>
      </div>
      <NewMenteeForm />
      {rows.length > 0 && (
        <div className="card people">
          <div className="person head">
            <span>Pessoa</span>
            <span>Hoje</span>
            <span>Dias seguidos</span>
            <span>Semana</span>
            <span>Checklist</span>
            <span className="go" />
          </div>
          {rows.map((r) => (
            <Link key={r.p.id} href={'/mentor/' + r.p.id} className="person">
              <span className="who">
                <b>
                  {r.p.name}
                  {has(r.p, 'ctd') && <span className="tag">dev</span>}
                </b>
                <small className={r.quiet ? 'warn' : undefined}>{r.last ? (r.last === today ? 'ativo hoje' : `última atividade em ${formatShort(r.last)}`) : 'ainda sem atividade'}</small>
              </span>
              <span className="cell">
                <small>Hoje</small>
                {has(r.p, 'daily') ? `${r.todayScore} de ${r.sum}` : '—'}
              </span>
              <span className="cell">
                <small>Dias seguidos</small>
                {has(r.p, 'daily') ? r.run : '—'}
              </span>
              <span className="cell">
                <small>Semana</small>
                {has(r.p, 'daily') ? `${r.weekFull} de 7` : '—'}
              </span>
              <span className="cell">
                <small>Checklist</small>
                {has(r.p, 'checklist') ? `${r.done} de ${TOTAL_ITEMS}` : '—'}
              </span>
              <span className="go muted">abrir →</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
