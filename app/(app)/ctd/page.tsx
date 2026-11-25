import { redirect } from 'next/navigation';
import { Contributions } from '@/components/Contributions';
import { GithubUserForm } from '@/components/GithubUserForm';
import { todayISO } from '@/lib/dates';
import { getContributions } from '@/lib/github';
import { requireMentee } from '@/lib/session';

export default async function CtdPage() {
  const { profile } = await requireMentee();
  if (!profile.is_dev) redirect('/hoje');
  const days = profile.github_username ? await getContributions(profile.github_username) : null;
  return (
    <section style={{ maxWidth: 900, width: '100%', margin: '0 auto' }}>
      <div>
        <span className="eyebrow">ctd</span>
        <h1>
          Código todo dia<em>.</em>
        </h1>
        <p className="soft" style={{ margin: 0 }}>
          Um commit por dia, todos os dias. Os quadrados vêm direto do seu GitHub.
        </p>
      </div>
      {days && profile.github_username ? (
        <Contributions days={days} today={todayISO()} username={profile.github_username} />
      ) : (
        <div className="card pad stack">
          <b>{profile.github_username ? `Não consegui ler as contribuições de "${profile.github_username}".` : 'Informe o seu usuário do GitHub para começar.'}</b>
          {profile.github_username && <span className="muted">Confira se o nome está certo e se o perfil é público.</span>}
          <GithubUserForm userId={profile.id} initial={profile.github_username} />
        </div>
      )}
    </section>
  );
}
