'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { friendly } from '@/lib/errors';
import { GITHUB_USER_RE } from '@/lib/github';
import type { Profile } from '@/lib/types';

type Msg = { ok: boolean; text: string } | null;
const Note = ({ msg }: { msg: Msg }) =>
  msg ? (
    <p className={'msg ' + (msg.ok ? 'ok' : 'err')} role="status">
      {msg.text}
    </p>
  ) : null;

export function NewMenteeForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDev, setIsDev] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { data, error } = await createClient().rpc('create_mentee', { p_email: email, p_password: password, p_name: name, p_is_dev: isDev });
    setBusy(false);
    if (error) {
      setMsg({ ok: false, text: friendly(error.message) });
      return;
    }
    router.push('/mentor/' + data);
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
          <input required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          E-mail
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
        </label>
      </div>
      <label className="field">
        Senha inicial
        <small>Pelo menos 8 caracteres. Você passa para a pessoa, e ela pode trocar depois em Conta.</small>
        <input required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="off" />
      </label>
      <label className="check">
        <input type="checkbox" checked={isDev} onChange={(e) => setIsDev(e.target.checked)} />
        É dev (libera Código todo dia e Projeto da semana)
      </label>
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
    linkedin_url: profile.linkedin_url ?? '',
    github_username: profile.github_username ?? '',
    is_dev: profile.is_dev,
    goal_connections: profile.goal_connections,
    goal_likes: profile.goal_likes,
    goal_comments: profile.goal_comments,
    goal_posts: profile.goal_posts,
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const set = (patch: Partial<typeof f>) => setF({ ...f, ...patch });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const gh = f.github_username.trim().replace(/^@/, '');
    if (gh && !GITHUB_USER_RE.test(gh)) {
      setMsg({ ok: false, text: 'Usuário do GitHub inválido.' });
      return;
    }
    setBusy(true);
    const { error } = await createClient()
      .from('profiles')
      .update({ ...f, name: f.name.trim(), objective: f.objective.trim() || null, linkedin_url: f.linkedin_url.trim() || null, github_username: gh || null })
      .eq('id', profile.id);
    setBusy(false);
    setMsg(error ? { ok: false, text: friendly(error.message) } : { ok: true, text: 'Salvo.' });
    if (!error) router.refresh();
  }

  return (
    <form className="card pad form" onSubmit={submit}>
      <label className="field">
        Nome
        <input required value={f.name} onChange={(e) => set({ name: e.target.value })} />
      </label>
      <label className="field">
        Objetivo
        <small>Aparece na tela inicial da pessoa. Ex.: vaga em Contas a Receber na Grande Florianópolis.</small>
        <input value={f.objective} onChange={(e) => set({ objective: e.target.value })} maxLength={200} />
      </label>
      <label className="field">
        Link do perfil no LinkedIn
        <input type="url" value={f.linkedin_url} onChange={(e) => set({ linkedin_url: e.target.value })} placeholder="https://www.linkedin.com/in/..." />
      </label>
      <div className="field">
        Metas diárias
        <div className="grid4">
          {GOAL_FIELDS.map(([key, label]) => (
            <label key={key} className="field" style={{ fontWeight: 400 }}>
              <small>{label}</small>
              <input type="number" min={0} max={20} required value={f[key]} onChange={(e) => set({ [key]: Number(e.target.value) } as Partial<typeof f>)} />
            </label>
          ))}
        </div>
      </div>
      <label className="check">
        <input type="checkbox" checked={f.is_dev} onChange={(e) => set({ is_dev: e.target.checked })} />
        É dev (libera Código todo dia e Projeto da semana)
      </label>
      {f.is_dev && (
        <label className="field">
          Usuário do GitHub
          <input value={f.github_username} onChange={(e) => set({ github_username: e.target.value })} autoCapitalize="none" spellCheck={false} />
        </label>
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

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await createClient().rpc('set_mentee_password', { p_user: userId, p_password: password });
    setBusy(false);
    setMsg(error ? { ok: false, text: friendly(error.message) } : { ok: true, text: 'Senha trocada. Passe a nova senha para a pessoa.' });
    if (!error) setPassword('');
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
        <label className="field">
          Nova senha para {name}
          <small>Pelo menos 8 caracteres.</small>
          <input required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="off" />
        </label>
        <Note msg={msg} />
        <div className="actions">
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
