'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GITHUB_USER_RE } from '@/lib/github';

export function GithubUserForm({ userId, initial }: { userId: string; initial: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState(initial ?? '');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const user = value.trim().replace(/^@/, '').replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
    if (user && !GITHUB_USER_RE.test(user)) {
      setMsg({ ok: false, text: 'Usuário inválido. Use só o nome, por exemplo: torvalds.' });
      return;
    }
    setBusy(true);
    const { error } = await createClient().from('profiles').update({ github_username: user || null }).eq('id', userId);
    setBusy(false);
    setMsg(error ? { ok: false, text: 'Não foi possível salvar. Tente de novo.' } : { ok: true, text: 'Salvo.' });
    if (!error) router.refresh();
  }

  return (
    <form className="form" onSubmit={submit}>
      <label className="field">
        Usuário do GitHub
        <small>O nome que aparece em github.com/seu-usuario.</small>
        <input value={value} onChange={(e) => setValue(e.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
      </label>
      {msg && (
        <p className={'msg ' + (msg.ok ? 'ok' : 'err')} role="status">
          {msg.text}
        </p>
      )}
      <div className="actions">
        <button className="btn" type="submit" disabled={busy}>
          Salvar
        </button>
      </div>
    </form>
  );
}
