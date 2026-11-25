import { Checklist } from '@/components/Checklist';
import { mondayOf, todayISO } from '@/lib/dates';
import { loadMenteeData, requireMentee } from '@/lib/session';

export default async function ChecklistPage() {
  const { supabase, profile } = await requireMentee('checklist');
  const today = todayISO();
  const data = await loadMenteeData(supabase, profile.id, today);
  return (
    <section style={{ maxWidth: 760, width: '100%', margin: '0 auto' }}>
      <div>
        <span className="eyebrow">consultoria linkedin estratégico</span>
        <h1>
          Checklist do perfil<em>.</em>
        </h1>
      </div>
      <Checklist userId={profile.id} initialDoneAt={data.doneAt} mentorItems={data.mentorItems} weeklyTarget={profile.weekly_items} monday={mondayOf(today)} today={today} />
    </section>
  );
}
