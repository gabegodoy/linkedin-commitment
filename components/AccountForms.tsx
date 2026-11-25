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

export function TestEmailButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  async function send() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/welcome', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ test: true }) });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setMsg(res.ok ? { ok: true, text: 'Enviado. Confira a sua caixa de entrada (e o spam).' } : { ok: false, text: data?.error ?? 'Não foi possível enviar.' });
    } catch {
      setMsg({ ok: false, text: 'Sem conexão. Tente de novo.' });
    }
    setBusy(false);
  }
  return (
    <div className="form">
      <span className="soft">Envia para o seu e-mail o mesmo modelo de e-mail de acesso que as pessoas recebem. No teste, o botão só abre o site.</span>
      {msg && (
        <p className={'msg ' + (msg.ok ? 'ok' : 'err')} role="status">
          {msg.text}
        </p>
      )}
      <div className="actions">
        <button type="button" className="ghost" disabled={busy} onClick={send}>
          {busy ? 'Enviando…' : 'Enviar e-mail de teste para mim'}
        </button>
      </div>
    </div>
  );
}
