import Link from 'next/link';
import { Today } from '@/components/Today';
import { ALL_ITEMS, TOTAL_ITEMS } from '@/lib/checklist';
import { formatLong, todayISO } from '@/lib/dates';
import { loadMenteeData, requireMentee } from '@/lib/session';
import { firstName, goalsOf, has } from '@/lib/types';

export default async function HojePage() {
  const { supabase, profile } = await requireMentee('daily');
  const today = todayISO();
  const data = await loadMenteeData(supabase, profile.id, today);
  const done = new Set(data.done);
  const focus = data.mentorItems.filter((m) => m.focus && !done.has(m.item_id)).map((m) => ({ ...m, item: ALL_ITEMS.find((it) => it.id === m.item_id)! }));

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
          {profile.linkedin_url && (
            <p style={{ marginTop: 8 }}>
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                Abrir meu perfil no LinkedIn ↗
              </a>
            </p>
          )}
        </div>
      </div>
      <div className={has(profile, 'checklist') ? 'cols' : undefined} style={has(profile, 'checklist') ? undefined : { maxWidth: 560, width: '100%', margin: '0 auto' }}>
        <section>
          <Today userId={profile.id} goals={goalsOf(profile)} today={today} initialLogs={data.logs} />
        </section>
        {has(profile, 'checklist') && (
        <section>
          <h2>
            <span>Checklist do perfil</span>
            <span>
              {done.size} de {TOTAL_ITEMS} itens feitos
            </span>
          </h2>
          <div className="card progress">
            <div className="bar">
              <i style={{ width: Math.round((done.size / TOTAL_ITEMS) * 100) + '%' }} />
            </div>
          </div>
          <h2 className="hi">
            <span>Para fazer esta semana</span>
          </h2>
          {focus.length > 0 ? (
            <div className="card">
              {focus.map((f) => (
                <div key={f.item_id} className="row">
                  <span className="num">{f.item_id}</span>
                  <span className="txt">
                    <span>{f.item.title}</span>
                    <small>{f.note || f.item.hint}</small>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="card pad soft">Nenhum item pendente no foco desta semana.</div>
          )}
          <Link href="/checklist" className="ghost">
            Abrir o checklist completo
          </Link>
        </section>
        )}
      </div>
    </>
  );
}
