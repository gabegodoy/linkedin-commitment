import { LogoutButton, PasswordForm } from '@/components/AccountForms';
import { GithubUserForm } from '@/components/GithubUserForm';
import { requireProfile } from '@/lib/session';

export default async function ContaPage() {
  const { profile } = await requireProfile();
  return (
    <section style={{ maxWidth: 560, width: '100%', margin: '0 auto' }}>
      <div>
        <span className="eyebrow">conta</span>
        <h1>
          {profile.name}
          <em>.</em>
        </h1>
        <p className="soft" style={{ margin: 0 }}>
          {profile.email}
        </p>
      </div>
      {profile.is_dev && (
        <>
          <h2>
            <span>GitHub</span>
          </h2>
          <div className="card pad">
            <GithubUserForm userId={profile.id} initial={profile.github_username} />
          </div>
        </>
      )}
      <h2>
        <span>Senha</span>
      </h2>
      <div className="card pad">
        <PasswordForm />
      </div>
      <div className="actions">
        <LogoutButton />
      </div>
    </section>
  );
}
