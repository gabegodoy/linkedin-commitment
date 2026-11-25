'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { friendly } from '@/lib/errors';

export function PasswordForm() {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
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
      <label className="field">
        Nova senha
        <small>Pelo menos 8 caracteres.</small>
        <input type={show ? 'text' : 'password'} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
      </label>
      <label className="check">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
        Mostrar a senha
      </label>
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
