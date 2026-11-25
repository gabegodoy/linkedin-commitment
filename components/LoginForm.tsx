'use client';

import { useState } from 'react';
import { EmailField, PasswordField } from './Fields';
import { createClient } from '@/lib/supabase/client';
import { friendly } from '@/lib/errors';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    if (error) {
      setError(friendly(error.message));
      setBusy(false);
      return;
    }
    window.location.assign('/');
  }

  return (
    <form className="form" onSubmit={submit} noValidate={false}>
      <EmailField label="E-mail" value={email} onChange={setEmail} />
      <PasswordField label="Senha" value={password} onChange={setPassword} autoComplete="current-password" meter={false} />
      {error && (
        <p className="msg err" role="alert">
          {error}
        </p>
      )}
      <button className="btn" type="submit" disabled={busy}>
        {busy ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
