import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/LoginForm';
import { getSession } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';

export default async function LoginPage() {
  if (await getSession()) redirect('/');
  const supabase = await createClient();
  const { data: hasMentor } = await supabase.rpc('mentor_exists');
  return (
    <main className="auth">
      <div className="auth-card">
        <div>
          <div className="brand">
            <b>
              compromisso<i>.</i>
            </b>
            <span>mentoria linkedin</span>
          </div>
          <h1>
            Entrar<em>.</em>
          </h1>
          <p className="soft" style={{ margin: '8px 0 0' }}>
            Use o seu e-mail e a sua senha.
          </p>
        </div>
        <div className="card pad">
          <LoginForm />
        </div>
        {hasMentor === false ? (
          <p className="msg">
            Primeira vez aqui? <Link href="/setup">Criar a conta do mentor</Link>
          </p>
        ) : (
          <p className="msg muted">Esqueceu a senha? Peça uma nova ao seu mentor.</p>
        )}
      </div>
    </main>
  );
}
