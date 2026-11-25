'use client';

import { useState } from 'react';
import { PasswordField } from './Fields';
import { createClient } from '@/lib/supabase/client';
import { friendly } from '@/lib/errors';

export function AccessForm({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setError('A senha precisa ter pelo menos 8 caracteres.');
    setBusy(true);
    setError('');
    const supabase = createClient();
    const redeemed = await supabase.rpc('redeem_access_link', { p_token: token, p_password: password });
    if (redeemed.error) {
      setBusy(false);
      return setError(friendly(redeemed.error.message));
    }
    const login = await supabase.auth.signInWithPassword({ email: redeemed.data as string, password });
    if (login.error) {
      setBusy(false);
      return setError('Senha criada. Agora entre pela tela de login com o seu e-mail e essa senha.');
    }
    window.location.assign('/bem-vindo?senha=ok');
  }

  return (
    <form className="form" onSubmit={submit}>
      <PasswordField label="Crie a sua senha" hint="Pelo menos 8 caracteres. Anote em um lugar seguro: você vai usar para entrar das próximas vezes." value={password} onChange={setPassword} startVisible />
      {error && (
        <p className="msg err" role="alert">
          {error}
        </p>
      )}
      <button className="btn" type="submit" disabled={busy}>
        {busy ? 'Entrando…' : 'Criar senha e entrar'}
      </button>
    </form>
  );
}
