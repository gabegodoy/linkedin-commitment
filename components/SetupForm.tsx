'use client';

import { useState } from 'react';
import { EmailField, PasswordField } from './Fields';
import { createClient } from '@/lib/supabase/client';
import { friendly } from '@/lib/errors';

export function SetupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const supabase = createClient();
    const created = await supabase.rpc('bootstrap_mentor', { p_email: email, p_password: password, p_name: name });
    if (created.error) {
      setError(friendly(created.error.message));
      setBusy(false);
      return;
    }
    const login = await supabase.auth.signInWithPassword({ email, password });
    if (login.error) {
      setError(friendly(login.error.message));
      setBusy(false);
      return;
    }
    window.location.assign('/');
  }

  return (
    <form className="form" onSubmit={submit}>
      <label className="field">
        Seu nome
        <input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </label>
      <EmailField label="E-mail" value={email} onChange={setEmail} />
      <PasswordField label="Senha" hint="Pelo menos 8 caracteres." value={password} onChange={setPassword} />
      {error && (
        <p className="msg err" role="alert">
          {error}
        </p>
      )}
      <button className="btn" type="submit" disabled={busy}>
        {busy ? 'Criando…' : 'Criar conta de mentor'}
      </button>
    </form>
  );
}
