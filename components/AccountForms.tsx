'use client';

import { useState } from 'react';
import { PasswordField } from './Fields';
import { createClient } from '@/lib/supabase/client';
import { friendly } from '@/lib/errors';

export function PasswordForm() {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    setMsg(error ? { ok: false, text: friendly(error.message) } : { ok: true, text: 'Senha alterada.' });
    if (!error) setPassword('');
  }

  return (
    <form className="form" onSubmit={submit}>
      <PasswordField label="Nova senha" hint="Pelo menos 8 caracteres." value={password} onChange={setPassword} />
      {msg && (
        <p className={'msg ' + (msg.ok ? 'ok' : 'err')} role="status">
          {msg.text}
        </p>
      )}
      <div className="actions">
        <button className="btn" type="submit" disabled={busy}>
          Trocar senha
        </button>
      </div>
    </form>
  );
}

export function LogoutButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="ghost"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await createClient().auth.signOut();
        window.location.assign('/login');
      }}
    >
      Sair da conta
    </button>
  );
}
