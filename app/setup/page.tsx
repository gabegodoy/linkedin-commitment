import { redirect } from 'next/navigation';
import { SetupForm } from '@/components/SetupForm';
import { createClient } from '@/lib/supabase/server';

export default async function SetupPage() {
  const supabase = await createClient();
  const { data: hasMentor } = await supabase.rpc('mentor_exists');
  if (hasMentor !== false) redirect('/login');
  return (
    <main className="auth">
      <div className="auth-card">
        <div>
          <span className="eyebrow">primeiro acesso</span>
          <h1>
            Conta do mentor<em>.</em>
          </h1>
          <p className="soft" style={{ margin: '8px 0 0' }}>
            Esta tela aparece uma única vez. Depois dela, só você cadastra as pessoas da mentoria.
          </p>
        </div>
        <div className="card pad">
          <SetupForm />
        </div>
      </div>
    </main>
  );
}
