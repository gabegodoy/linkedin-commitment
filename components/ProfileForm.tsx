'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { friendly } from '@/lib/errors';
import { GITHUB_USER_RE } from '@/lib/github';
import { cleanGithub, normalizeWhatsapp, type Profile } from '@/lib/types';

/** Dados que a própria pessoa preenche. No primeiro acesso também pede a senha nova. */
export function ProfileForm({ profile, onboarding = false }: { profile: Profile; onboarding?: boolean }) {
  const showGithub = profile.modules.includes('ctd') || profile.modules.includes('project');
  const [name, setName] = useState(profile.name);
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp ?? '');
  const [linkedin, setLinkedin] = useState(profile.linkedin_url ?? '');
  const [github, setGithub] = useState(profile.github_username ?? '');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fail = (text: string) => setMsg({ ok: false, text });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const wa = normalizeWhatsapp(whatsapp);
    if (wa === false) return fail('Confira o WhatsApp: DDD e número, por exemplo 48 99999-0000.');
    const gh = cleanGithub(github);
    if (gh && !GITHUB_USER_RE.test(gh)) return fail('Usuário do GitHub inválido. Use só o nome, por exemplo: torvalds.');
    const li = linkedin.trim();
    if (li && !/^https?:\/\/([a-z]+\.)?linkedin\.com\//i.test(li)) return fail('O link do LinkedIn precisa começar com https://www.linkedin.com/');
    if (password && password.length < 8) return fail('A senha precisa ter pelo menos 8 caracteres.');
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    if (password) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setBusy(false);
        return fail(friendly(error.message));
      }
    }
    const { error } = await supabase
      .from('profiles')
      .update({ name: name.trim(), whatsapp: wa, linkedin_url: li || null, github_username: gh || null, ...(onboarding ? { onboarded_at: new Date().toISOString() } : {}) })
      .eq('id', profile.id);
    if (error) {
      setBusy(false);
      return fail(friendly(error.message));
    }
    if (onboarding) {
      window.location.assign('/');
      return;
    }
    setBusy(false);
    setMsg({ ok: true, text: 'Salvo.' });
  }

  return (
    <form className="form" onSubmit={submit}>
      <label className="field">
        Seu nome
        <input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </label>
      <label className="field">
        WhatsApp
        <small>Com DDD. Seu mentor usa para falar com você.</small>
        <input type="tel" inputMode="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="48 99999-0000" autoComplete="tel" />
      </label>
      <label className="field">
        Link do seu perfil no LinkedIn
        <small>Abra o seu perfil no LinkedIn, copie o endereço e cole aqui. Pode deixar em branco e preencher depois.</small>
        <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://www.linkedin.com/in/..." />
      </label>
      {showGithub && (
        <label className="field">
          Usuário do GitHub
          <small>O nome que aparece em github.com/seu-usuario.</small>
          <input value={github} onChange={(e) => setGithub(e.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
        </label>
      )}
      {onboarding && (
        <label className="field">
          Crie uma senha só sua
          <small>Pelo menos 8 caracteres. Se preferir continuar com a senha que recebeu, deixe em branco.</small>
          <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" autoCapitalize="none" />
        </label>
      )}
      {msg && (
        <p className={'msg ' + (msg.ok ? 'ok' : 'err')} role="status">
          {msg.text}
        </p>
      )}
      <div className="actions">
        <button className="btn" type="submit" disabled={busy}>
          {onboarding ? (busy ? 'Salvando…' : 'Começar') : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
