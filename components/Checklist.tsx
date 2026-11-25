'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GROUPS, TOTAL_ITEMS, type Item } from '@/lib/checklist';
import type { MentorItem } from '@/lib/types';
import { weekPlan } from '@/lib/plan';
import { CHEERS } from '@/lib/words';

type Extra = { focus: boolean; note: string | null };

type Props = { userId: string; initialDoneAt: Record<number, string>; mentorItems: MentorItem[]; weeklyTarget: number; monday: string; today: string; mentor?: boolean };

export function Checklist({ userId, initialDoneAt, mentorItems, weeklyTarget, monday, today, mentor = false }: Props) {
  const [doneAt, setDoneAt] = useState(initialDoneAt);
  const done = new Set(Object.keys(doneAt).map(Number));
  const [extra, setExtra] = useState<Record<number, Extra>>(() => Object.fromEntries(mentorItems.map((m) => [m.item_id, { focus: m.focus, note: m.note }])));
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const fail = () => setError('Não foi possível salvar. Verifique a internet e tente de novo.');

  async function toggle(id: number) {
    const value = !done.has(id);
    const next = { ...doneAt };
    if (value) next[id] = today;
    else delete next[id];
    const previous = doneAt;
    setDoneAt(next);
    setError('');
    const { error } = await createClient()
      .from('checklist_done')
      .upsert({ user_id: userId, item_id: id, done: value, updated_at: new Date().toISOString() }, { onConflict: 'user_id,item_id' });
    if (error) {
      setDoneAt(previous);
      fail();
    }
  }

  async function saveExtra(id: number, patch: Partial<Extra>) {
    const current = extra[id] ?? { focus: false, note: null };
    const next = { ...current, ...patch };
    const previous = extra;
    setExtra({ ...extra, [id]: next });
    setError('');
    const { error } = await createClient()
      .from('mentor_items')
      .upsert({ user_id: userId, item_id: id, focus: next.focus, note: next.note }, { onConflict: 'user_id,item_id' });
    if (error) {
      setExtra(previous);
      fail();
    }
  }

  function row(it: Item) {
    const isDone = done.has(it.id);
    const ex = extra[it.id];
    const hint = ex?.note || it.hint;
    const text = (
      <>
        <span className="num">{it.id}</span>
        <span className="txt">
          <span>{it.title}</span>
          <small>{hint}</small>
        </span>
      </>
    );
    if (!mentor) {
      return (
        <button key={it.id} type="button" className={'row' + (isDone ? ' f' : '')} aria-pressed={isDone} onClick={() => toggle(it.id)}>
          <span className="mark">{isDone ? '✓' : ''}</span>
          {text}
        </button>
      );
    }
    return (
      <div key={it.id} className={'row' + (isDone ? ' f' : '')}>
        <button type="button" className="mark" aria-pressed={isDone} aria-label={`${it.title}: marcar como feito`} onClick={() => toggle(it.id)}>
          {isDone ? '✓' : ''}
        </button>
        <span className="num">{it.id}</span>
        <div className="txt">
          <span>{it.title}</span>
          {editing === it.id ? (
            <>
              <textarea className="in" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={it.hint} aria-label={`Orientação para ${it.title}`} />
              <div className="row-tools">
                <button
                  type="button"
                  className="btn sm"
                  onClick={() => {
                    saveExtra(it.id, { note: draft.trim() || null });
                    setEditing(null);
                  }}
                >
                  Salvar orientação
                </button>
                <button type="button" className="ghost sm" onClick={() => setEditing(null)}>
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <>
              <small>{hint}</small>
              <div className="row-tools">
                <button type="button" className={'ghost sm' + (ex?.focus ? ' on' : '')} aria-pressed={!!ex?.focus} onClick={() => saveExtra(it.id, { focus: !ex?.focus })}>
                  {ex?.focus ? '✓ Foco desta semana' : 'Colocar no foco da semana'}
                </button>
                <button
                  type="button"
                  className="ghost sm"
                  onClick={() => {
                    setDraft(ex?.note ?? '');
                    setEditing(it.id);
                  }}
                >
                  {ex?.note ? 'Editar orientação' : 'Escrever orientação'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const focusIds = new Set(Object.keys(extra).map(Number).filter((id) => extra[id].focus));
  const plan = weekPlan(doneAt, focusIds, weeklyTarget, monday);
  const planIds = new Set(plan.map((p) => p.item.id));
  const planDone = plan.filter((p) => p.done).length;
  const focus = plan.map((p) => p.item);
  const isFocus = (it: Item) => planIds.has(it.id);
  const pct = Math.round((done.size / TOTAL_ITEMS) * 100);

  return (
    <>
      <div className="card progress">
        <div className="top">
          <span>
            {done.size} de {TOTAL_ITEMS} itens feitos
          </span>
          <span>{pct}%</span>
        </div>
        <div className="bar">
          <i style={{ width: pct + '%' }} />
        </div>
        {!mentor && <span className="soft" style={{ fontSize: 15 }}>Terminou um item? Toque nele para marcar como feito.</span>}
      </div>
      {error && (
        <p className="msg err" role="alert">
          {error}
        </p>
      )}
      {focus.length > 0 && (
        <>
          <h2 className="hi">
            <span>Para fazer esta semana</span>
            <span>
              {planDone} de {plan.length} feitos
            </span>
          </h2>
          <div className="card" style={{ borderColor: 'var(--line-2)' }}>
            {focus.map(row)}
          </div>
          {planDone >= plan.length && (
            <p className="msg ok" role="status">
              {CHEERS.weekDone}
            </p>
          )}
        </>
      )}
      {GROUPS.map((g) => {
        const items = mentor ? g.items : g.items.filter((it) => !isFocus(it));
        if (!items.length) return null;
        return (
          <div key={g.name} className="stack">
            <h2>
              <span>{g.name}</span>
              <span>
                {g.items.filter((it) => done.has(it.id)).length} de {g.items.length}
              </span>
            </h2>
            <div className="card">{items.map(row)}</div>
          </div>
        );
      })}
    </>
  );
}
