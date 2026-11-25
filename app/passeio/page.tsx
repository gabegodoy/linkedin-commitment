import { redirect } from 'next/navigation';
import { Tour } from '@/components/Tour';
import { todayISO } from '@/lib/dates';
import { requireProfile } from '@/lib/session';
import { firstName } from '@/lib/types';

/** Passo a passo guiado. Aparece sozinho depois das boas-vindas e pode ser revisto pela Conta. */
export default async function PasseioPage() {
  const { supabase, profile } = await requireProfile();
  if (profile.role === 'mentor') redirect('/mentor');
  if (!profile.onboarded_at) redirect('/bem-vindo');
  const { data } = await supabase.rpc('mentor_name');
  return <Tour userId={profile.id} name={firstName(profile.name)} mentor={(data as string | null) || 'Seu mentor'} modules={profile.modules} today={todayISO()} />;
}
