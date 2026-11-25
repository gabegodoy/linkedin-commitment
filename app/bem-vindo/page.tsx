import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/ProfileForm';
import { WordOfDay } from '@/components/Word';
import { todayISO } from '@/lib/dates';
import { requireProfile } from '@/lib/session';
import { firstName } from '@/lib/types';

export default async function BemVindoPage({ searchParams }: { searchParams: Promise<{ senha?: string }> }) {
  const hasOwnPassword = (await searchParams).senha === 'ok';
  const { profile } = await requireProfile();
  if (profile.role === 'mentor' || profile.onboarded_at) redirect('/');
  return (
    <main className="auth">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div>
          <span className="eyebrow">primeiro acesso</span>
          <h1>
            Que bom ter você aqui, {firstName(profile.name)}
            <em>.</em>
          </h1>
          <p className="soft" style={{ margin: '8px 0 0' }}>
            Este é o seu espaço para cuidar do LinkedIn um pouco por dia. Confira seus dados e vamos começar. Você não está sozinho nessa caminhada.
          </p>
          <WordOfDay day={todayISO()} />
        </div>
        <div className="card pad">
          <ProfileForm profile={profile} onboarding askPassword={!hasOwnPassword} />
        </div>
      </div>
    </main>
  );
}
