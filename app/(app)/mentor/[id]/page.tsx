import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Checklist } from '@/components/Checklist';
import { Contributions } from '@/components/Contributions';
import { MenteeAccess, MenteeSettings } from '@/components/MentorForms';
import { ProjectHistory } from '@/components/ProjectPanel';
import { Today } from '@/components/Today';
import { todayISO } from '@/lib/dates';
import { getContributions } from '@/lib/github';
import { loadMenteeData, requireMentor } from '@/lib/session';
import { goalsOf, has, type Profile, type Project } from '@/lib/types';

export default async function MenteePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireMentor();
  const { data } = await supabase.from('profiles').select('*').eq('id', id).eq('role', 'mentee').maybeSingle();
  if (!data) notFound();
  const person = data as Profile;
  const today = todayISO();
  const [mentee, projects, days] = await Promise.all([
    loadMenteeData(supabase, id, today),
    has(person, 'project') ? supabase.from('weekly_projects').select('*').eq('user_id', id).order('week_start', { ascending: false }).limit(30) : null,
    has(person, 'ctd') && person.github_username ? getContributions(person.github_username) : null,
  ]);

  return (
    <>
      <div>
        <Link href="/mentor" className="mono" style={{ fontSize: 13 }}>
          ← todas as pessoas
        </Link>
        <h1>
          {person.name}
          <em>.</em>
        </h1>
        <p className="soft" style={{ margin: 0 }}>
          {person.email}
          {person.linkedin_url && (
            <>
              {' · '}
              <a href={person.linkedin_url} target="_blank" rel="noopener noreferrer">
                perfil no LinkedIn ↗
              </a>
            </>
          )}
        </p>
      </div>
      <div className="cols">
        <section>
          {has(person, 'daily') && <Today userId={id} goals={goalsOf(person)} today={today} initialLogs={mentee.logs} />}
          <h2>
            <span>Dados e metas</span>
          </h2>
          <MenteeSettings key={JSON.stringify(person)} profile={person} />
          <h2>
            <span>Acesso</span>
          </h2>
          <MenteeAccess userId={id} name={person.name} />
        </section>
        <section>
          <h2>
            <span>Checklist do perfil</span>
          </h2>
          {has(person, 'checklist') ? (
            <Checklist userId={id} initialDone={mentee.done} mentorItems={mentee.mentorItems} mentor />
          ) : (
            <div className="card pad soft">Checklist não liberado para esta pessoa. Marque o módulo em Dados e metas.</div>
          )}
        </section>
      </div>
      {(has(person, 'ctd') || has(person, 'project')) && (
        <section>
          {!has(person, 'ctd') ? null : days && person.github_username ? (
            <Contributions days={days} today={today} username={person.github_username} />
          ) : (
            <div className="card pad soft">{person.github_username ? 'Não consegui ler as contribuições deste usuário do GitHub.' : 'Sem usuário do GitHub cadastrado.'}</div>
          )}
          <ProjectHistory projects={((projects?.data ?? []) as Project[])} />
        </section>
      )}
    </>
  );
}
