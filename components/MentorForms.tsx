'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { friendly } from '@/lib/errors';
import { GITHUB_USER_RE } from '@/lib/github';
import { MODULES, normalizeWhatsapp, type Module, type Profile } from '@/lib/types';
import { EmailField, GithubField, LinkedinField, PasswordField, PhoneField, Stepper } from './Fields';
import { githubUser, linkedinSlug, linkedinUrl, maskPhone } from '@/lib/mask';

type Msg = { ok: boolean; text: string } | null;
function ModulePicker({ value, onChange }: { value: Module[]; onChange: (v: Module[]) => void }) {
  return (
    <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
      <legend style={{ padding: 0, marginBottom: 6 }}>O que liberar para esta pessoa</legend>
      {MODULES.map((m) => (
        <label key={m.id} className="check" style={{ alignItems: 'flex-start' }}>
          <input
            type="checkbox"
            style={{ marginTop: 2, flexShrink: 0 }}
            checked={value.includes(m.id)}
            onChange={(e) => onChange(MODULES.map((x) => x.id).filter((id) => (id === m.id ? e.target.checked : value.includes(id))))}
          />
          <span>
            {m.label}
            <small style={{ display: 'block' }}>{m.hint}</small>
          </span>
        </label>
      ))}
    </fieldset>
  );
}

const Note = ({ msg }: { msg: Msg }) =>
  msg ? (
    <p className={'msg ' + (msg.ok ? 'ok' : 'err')} role="status">
      {msg.text}
    </p>
  ) : null;

/** Senha fácil de ditar: sem letras e números que se confundem (0/O, 1/l). */
function easyPassword() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

/** Devolve '' se enviou, ou a mensagem de erro. */
async function sendWelcome(userId: string, password: string) {
  try {
    const res = await fetch('/api/welcome', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, password }) });
    if (res.ok) return '';
    return ((await res.json().catch(() => null)) as { error?: string } | null)?.error ?? 'Não foi possível enviar o e-mail.';
  } catch {
    return 'Não foi possível enviar o e-mail.';
  }
}

function SendEmailCheck({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

const cleanName = (v: string) => v.trim().replace(/\s+/g, ' ');

export function NewMenteeForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modules, setModules] = useState<Module[]>(['daily', 'checklist']);
  const [whatsapp, setWhatsapp] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [created, setCreated] = useState<{ id: string; warning: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const isDev = modules.includes('ctd') || modules.includes('project');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const wa = normalizeWhatsapp(whatsapp);
    if (wa === false) return setMsg({ ok: false, text: 'Confira o WhatsApp: DDD e número.' });
    const gh = githubUser(github);
    const li = linkedinSlug(linkedin);
    if (gh && !GITHUB_USER_RE.test(gh)) return setMsg({ ok: false, text: 'Usuário do GitHub inválido.' });
    if (password.length < 8) return setMsg({ ok: false, text: 'A senha inicial precisa ter pelo menos 8 caracteres.' });
    if (modules.length === 0) return setMsg({ ok: false, text: 'Libere pelo menos um módulo.' });
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc('create_mentee', { p_email: email, p_password: password, p_name: cleanName(name), p_modules: modules });
    if (error) {
      setBusy(false);
      return setMsg({ ok: false, text: friendly(error.message) });
    }
    if (wa || li || (isDev && gh)) {
      await supabase.from('profiles').update({ whatsapp: wa, linkedin_url: linkedinUrl(li), github_username: isDev && gh ? gh : null }).eq('id', data);
    }
    if (sendEmail) {
      const warning = await sendWelcome(data, password);
      if (warning) {
        setBusy(false);
        setCreated({ id: data, warning });
        router.refresh();
        return;
      }
    }
    router.push('/mentor/' + data);
  }

  if (created) {
    return (
      <div className="card pad stack">
        <b>Pessoa cadastrada, mas o e-mail não saiu.</b>
        <span className="soft">{created.warning} Passe o e-mail e a senha para ela por outro meio: {email} / {password}</span>
        <div className="actions">
          <button type="button" className="btn" onClick={() => router.push('/mentor/' + created.id)}>
            Abrir a página da pessoa
          </button>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="actions">
        <button type="button" className="btn" onClick={() => setOpen(true)}>
          Cadastrar pessoa
        </button>
      </div>
    );
  }
  return (
    <form className="card pad form" onSubmit={submit}>
      <div className="grid2">
        <label className="field">
          Nome
          <input required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" autoCapitalize="words" placeholder="Nome e sobrenome" />
        </label>
        <EmailField label="E-mail" value={email} onChange={setEmail} autoComplete="off" />
      </div>
      <PasswordField label="Senha inicial" hint="Você passa para a pessoa. No primeiro acesso ela pode criar uma senha própria." value={password} onChange={setPassword} autoComplete="off" startVisible />
      <div className="actions">
        <button type="button" className="ghost sm" onClick={() => setPassword(easyPassword())}>
          Gerar uma senha
        </button>
      </div>
      <ModulePicker value={modules} onChange={setModules} />
      <div className="field">
        Opcionais
        <small>O que ficar em branco a própria pessoa preenche no primeiro acesso.</small>
      </div>
      <div className="grid2">
        <PhoneField light label="WhatsApp" value={whatsapp} onChange={setWhatsapp} />
        <LinkedinField light label="Perfil no LinkedIn" value={linkedin} onChange={setLinkedin} />
      </div>
      {isDev && <GithubField light label="Usuário do GitHub" value={github} onChange={setGithub} />}
      <SendEmailCheck checked={sendEmail} onChange={setSendEmail} label="Enviar e-mail de boas-vindas com os dados de acesso" />
      <Note msg={msg} />
      <div className="actions">
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Cadastrando…' : 'Cadastrar'}
        </button>
        <button type="button" className="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

const GOAL_FIELDS = [
  ['goal_connections', 'Conexões'],
  ['goal_likes', 'Curtidas'],
  ['goal_comments', 'Comentários'],
  ['goal_posts', 'Posts'],
] as const;

export function MenteeSettings({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [f, setF] = useState({
    name: profile.name,
    objective: profile.objective ?? '',
    linkedin: linkedinSlug(profile.linkedin_url),
    github_username: profile.github_username ?? '',
    whatsapp: maskPhone(profile.whatsapp),
    weekly_items: profile.weekly_items,
    modules: profile.modules,
    goal_connections: profile.goal_connections,
    goal_likes: profile.goal_likes,
    goal_comments: profile.goal_comments,
    goal_posts: profile.goal_posts,
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const set = (patch: Partial<typeof f>) => setF({ ...f, ...patch });
  const isDev = f.modules.includes('ctd') || f.modules.includes('project');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const wa = normalizeWhatsapp(f.whatsapp);
    if (wa === false) return setMsg({ ok: false, text: 'Confira o WhatsApp: DDD e número.' });
    const gh = githubUser(f.github_username);
    if (gh && !GITHUB_USER_RE.test(gh)) return setMsg({ ok: false, text: 'Usuário do GitHub inválido.' });
    setBusy(true);
    const { linkedin, ...rest } = f;
    const { error } = await createClient()
      .from('profiles')
      .update({ ...rest, name: cleanName(f.name), objective: f.objective.trim() || null, linkedin_url: linkedinUrl(linkedinSlug(linkedin)), github_username: gh || null, whatsapp: wa })
      .eq('id', profile.id);
    setBusy(false);
    setMsg(error ? { ok: false, text: friendly(error.message) } : { ok: true, text: 'Salvo.' });
    if (!error) router.refresh();
  }

  return (
    <form className="card pad form" onSubmit={submit}>
      <label className="field">
        Nome
        <input required maxLength={80} value={f.name} onChange={(e) => set({ name: e.target.value })} autoCapitalize="words" />
      </label>
      <label className="field">
        Objetivo
        <small>Aparece na tela inicial da pessoa. Ex.: vaga em Contas a Receber na Grande Florianópolis. ({f.objective.length}/200)</small>
        <input value={f.objective} onChange={(e) => set({ objective: e.target.value })} maxLength={200} />
      </label>
      <PhoneField label="WhatsApp" value={f.whatsapp} onChange={(whatsapp) => set({ whatsapp })} />
      <LinkedinField label="Perfil no LinkedIn" hint="Pode colar o link inteiro." value={f.linkedin} onChange={(linkedin) => set({ linkedin })} />
      {isDev && <GithubField label="Usuário do GitHub" value={f.github_username} onChange={(github_username) => set({ github_username })} />}
      <ModulePicker value={f.modules} onChange={(modules) => set({ modules })} />
      {f.modules.includes('daily') && (
        <div className="field">
          Metas diárias
          <div className="grid4">
            {GOAL_FIELDS.map(([key, label]) => (
              <Stepper key={key} label={label} value={f[key]} onChange={(v) => set({ [key]: v } as Partial<typeof f>)} />
            ))}
          </div>
        </div>
      )}
      {f.modules.includes('checklist') && (
        <div className="field">
          Itens do checklist por semana
          <small>A pessoa vê essa quantidade em "Para fazer esta semana". O que você colocar no foco entra primeiro; o resto segue a ordem do checklist.</small>
          <div style={{ maxWidth: 180 }}>
            <Stepper label="Itens por semana" value={f.weekly_items} onChange={(weekly_items) => set({ weekly_items })} max={10} />
          </div>
        </div>
      )}
      <Note msg={msg} />
      <div className="actions">
        <button className="btn" type="submit" disabled={busy}>
          Salvar
        </button>
      </div>
    </form>
  );
}

export function MenteeAccess({ userId, name }: { userId: string; name: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [armed, setArmed] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setMsg({ ok: false, text: 'A senha precisa ter pelo menos 8 caracteres.' });
    setBusy(true);
    const { error } = await createClient().rpc('set_mentee_password', { p_user: userId, p_password: password });
    if (error) {
      setBusy(false);
      return setMsg({ ok: false, text: friendly(error.message) });
    }
    const warning = sendEmail ? await sendWelcome(userId, password) : '';
    setBusy(false);
    setMsg(
      sendEmail && !warning
        ? { ok: true, text: 'Senha trocada e enviada por e-mail.' }
        : { ok: !warning, text: `Senha trocada. ${warning ? warning + ' ' : ''}Anote e passe para a pessoa: ${password}` },
    );
    setPassword('');
  }

  async function remove() {
    if (!armed) {
      setArmed(true);
      setTimeout(() => setArmed(false), 4000);
      return;
    }
    setBusy(true);
    const { error } = await createClient().rpc('delete_mentee', { p_user: userId });
    if (error) {
      setBusy(false);
      setMsg({ ok: false, text: friendly(error.message) });
      return;
    }
    router.push('/mentor');
    router.refresh();
  }

  return (
    <div className="card pad form">
      <form className="form" onSubmit={reset}>
        <PasswordField label={`Nova senha para ${name}`} hint="Pelo menos 8 caracteres." value={password} onChange={setPassword} autoComplete="off" startVisible />
        <SendEmailCheck checked={sendEmail} onChange={setSendEmail} label="Enviar os dados de acesso por e-mail" />
        <Note msg={msg} />
        <div className="actions">
          <button type="button" className="ghost sm" onClick={() => setPassword(easyPassword())}>
            Gerar uma senha
          </button>
          <button className="ghost" type="submit" disabled={busy}>
            Trocar senha
          </button>
          <button type="button" className="ghost danger" disabled={busy} onClick={remove}>
            {armed ? 'Clique de novo para apagar tudo' : 'Remover pessoa'}
          </button>
        </div>
      </form>
    </div>
  );
}
