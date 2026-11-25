import Link from 'next/link';
import { Today } from '@/components/Today';
import { WordOfDay } from '@/components/Word';
import { TOTAL_ITEMS } from '@/lib/checklist';
import { formatLong, mondayOf, todayISO } from '@/lib/dates';
import { weekPlan } from '@/lib/plan';
import { loadMenteeData, requireMentee } from '@/lib/session';
import { firstName, goalsOf, has } from '@/lib/types';

export default async function HojePage() {
  const { supabase, profile } = await requireMentee('daily');
  const today = todayISO();
  const data = await loadMenteeData(supabase, profile.id, today);
  const withChecklist = has(profile, 'checklist');
  const plan = weekPlan(data.doneAt, new Set(data.mentorItems.filter((m) => m.focus).map((m) => m.item_id)), profile.weekly_items, mondayOf(today));
  const notes = Object.fromEntries(data.mentorItems.map((m) => [m.item_id, m.note]));
  const planDone = plan.filter((p) => p.done).length;

  return (
    <>
      <div className="hero">
        <div>
          <span className="eyebrow">{formatLong(today)}</span>
          <h1>
            Olá, {firstName(profile.name)}
            <em>.</em>
          </h1>
          <p>Um pouco por dia, todo dia.{profile.objective ? ` Objetivo: ${profile.objective}` : ''}</p>
          <WordOfDay day={today} />
          {profile.linkedin_url && (
            <p style={{ marginTop: 14 }}>
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                Abrir meu perfil no LinkedIn ↗
              </a>
            </p>
          )}
        </div>
      </div>
      <div className={withChecklist ? 'cols' : undefined} style={withChecklist ? undefined : { maxWidth: 560, width: '100%', margin: '0 auto' }}>
        <section>
          <Today userId={profile.id} goals={goalsOf(profile)} today={today} initialLogs={data.logs} />
        </section>
        {withChecklist && (
          <section>
            <h2>
              <span>Checklist do perfil</span>
              <span>
                {data.done.length} de {TOTAL_ITEMS} itens feitos
              </span>
            </h2>
            <div className="card progress">
              <div className="bar">
                <i style={{ width: Math.round((data.done.length / TOTAL_ITEMS) * 100) + '%' }} />
              </div>
            </div>
            {plan.length > 0 && (
              <>
                <h2 className="hi">
                  <span>Para fazer esta semana</span>
                  <span>
                    {planDone} de {plan.length} feitos
                  </span>
                </h2>
                <div className="card">
                  {plan.map((p) => (
                    <div key={p.item.id} className={'row planned' + (p.done ? ' f' : '')}>
                      <span className="mark">{p.done ? '✓' : ''}</span>
                      <span className="num">{p.item.id}</span>
                      <span className="txt">
                        <span>{p.item.title}</span>
                        <small>{notes[p.item.id] || p.item.hint}</small>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
            <Link href="/checklist" className="ghost">
              {planDone < plan.length ? 'Abrir o checklist para marcar' : 'Abrir o checklist completo'}
            </Link>
          </section>
        )}
      </div>
    </>
  );
}
