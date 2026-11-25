'use client';

import { useState } from 'react';
import { GithubField, LinkedinField, PasswordField, PhoneField } from './Fields';
import { createClient } from '@/lib/supabase/client';
import { friendly } from '@/lib/errors';
import { GITHUB_USER_RE } from '@/lib/github';
import { githubUser, linkedinSlug, linkedinUrl, maskPhone } from '@/lib/mask';
import { normalizeWhatsapp, type Profile } from '@/lib/types';

/** Dados que a própria pessoa preenche. No primeiro acesso também oferece trocar a senha. */
export function ProfileForm({ profile, onboarding = false, askPassword = true }: { profile: Profile; onboarding?: boolean; askPassword?: boolean }) {
  const showGithub = profile.modules.includes('ctd') || profile.modules.includes('project');
  const [name, setName] = useState(profile.name);
  const [whatsapp, setWhatsapp] = useState(maskPhone(profile.whatsapp));
  const [linkedin, setLinkedin] = useState(linkedinSlug(profile.linkedin_url));
  const [github, setGithub] = useState(profile.github_username ?? '');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fail = (text: string) => setMsg({ ok: false, text });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const wa = normalizeWhatsapp(whatsapp);
    if (wa === false) return fail('Confira o WhatsApp: DDD e número, por exemplo (48) 99999-0000.');
    const gh = githubUser(github);
    const li = linkedinSlug(linkedin);
    if (gh && !GITHUB_USER_RE.test(gh)) return fail('Usuário do GitHub inválido.');
    if (password && password.length < 8) return fail('A senha precisa ter pelo menos 8 caracteres.');
    if (name.trim().length < 2) return fail('Informe o seu nome.');
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
      .update({ name: name.trim().replace(/\s+/g, ' '), whatsapp: wa, linkedin_url: linkedinUrl(li), github_username: gh || null, ...(onboarding ? { onboarded_at: new Date().toISOString() } : {}) })
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
        <input required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" autoCapitalize="words" />
      </label>
      <PhoneField label="WhatsApp" hint="Com DDD. Seu mentor usa para falar com você." value={whatsapp} onChange={setWhatsapp} />
      <LinkedinField label="Seu perfil no LinkedIn" hint="Pode colar o link inteiro do seu perfil, que a gente ajusta. Se não souber, deixe em branco." value={linkedin} onChange={setLinkedin} />
      {showGithub && <GithubField label="Usuário do GitHub" hint="Pode colar o link do seu perfil ou digitar só o nome." value={github} onChange={setGithub} />}
      {onboarding && askPassword && (
        <PasswordField label="Crie uma senha só sua" hint="Pelo menos 8 caracteres. Para continuar com a senha que recebeu, deixe em branco." value={password} onChange={setPassword} required={false} startVisible />
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
