import { ProjectHistory, ProjectPanel } from '@/components/ProjectPanel';
import { addDays, mondayOf, todayISO } from '@/lib/dates';
import { requireMentee } from '@/lib/session';
import type { Project } from '@/lib/types';

export default async function ProjetoPage() {
  const { supabase, profile } = await requireMentee('project');
  const weekStart = mondayOf(todayISO());
  const { data } = await supabase.from('weekly_projects').select('*').eq('user_id', profile.id).order('week_start', { ascending: false }).limit(30);
  const projects = (data ?? []) as Project[];
  const current = projects.find((p) => p.week_start === weekStart) ?? null;
  const last = projects.find((p) => p.week_start === addDays(weekStart, -7)) ?? null;
  return (
    <section style={{ maxWidth: 760, width: '100%', margin: '0 auto' }}>
      <div>
        <span className="eyebrow">um projeto por semana</span>
        <h1>
          Projeto da semana<em>.</em>
        </h1>
        <p className="soft" style={{ margin: 0 }}>
          Começa na segunda, entrega no domingo e vira post na segunda de manhã.
        </p>
      </div>
      <ProjectPanel key={current?.title ?? 'novo'} userId={profile.id} weekStart={weekStart} current={current} pendingPost={last && !last.post_url ? last : null} />
      <ProjectHistory projects={projects.filter((p) => p.week_start < weekStart)} />
    </section>
  );
}
