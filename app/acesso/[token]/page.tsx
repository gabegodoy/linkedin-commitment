import Link from 'next/link';
import { AccessForm } from '@/components/AccessForm';
import { createClient } from '@/lib/supabase/server';

export default async function AcessoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data: name } = /^[0-9a-f]{48}$/.test(token) ? await supabase.rpc('access_link_info', { p_token: token }) : { data: null };
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
            {name ? `Olá, ${name}` : 'Link expirado'}
            <em>.</em>
          </h1>
          <p className="soft" style={{ margin: '8px 0 0' }}>
            {name ? 'Falta só um passo: criar a senha que você vai usar para entrar.' : 'Este link já foi usado ou passou do prazo. Peça um novo ao seu mentor.'}
          </p>
        </div>
        {name ? (
          <div className="card pad">
            <AccessForm token={token} />
          </div>
        ) : (
          <Link href="/login" className="ghost">
            Ir para a tela de login
          </Link>
        )}
      </div>
    </main>
  );
}
