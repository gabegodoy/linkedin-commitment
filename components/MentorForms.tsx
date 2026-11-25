'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { friendly } from '@/lib/errors';
import { GITHUB_USER_RE } from '@/lib/github';
import { MODULES, cleanGithub, normalizeWhatsapp, type Module, type Profile } from '@/lib/types';

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
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const wa = normalizeWhatsapp(whatsapp);
    const gh = cleanGithub(github);
    if (wa === false) return setMsg({ ok: false, text: 'Confira o WhatsApp: DDD e número.' });
    if (gh && !GITHUB_USER_RE.test(gh)) return setMsg({ ok: false, text: 'Usuário do GitHub inválido.' });
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc('create_mentee', { p_email: email, p_password: password, p_name: name, p_modules: modules });
    setBusy(false);
    if (error) {
      setMsg({ ok: false, text: friendly(error.message) });
      return;
    }
    if (wa || gh || linkedin.trim()) {
      await supabase.from('profiles').update({ whatsapp: wa, github_username: gh || null, linkedin_url: linkedin.trim() || null }).eq('id', data);
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
      <ModulePicker value={modules} onChange={setModules} />
      <div className="field">
        Opcionais
        <small>Se ficar em branco, a própria pessoa preenche no primeiro acesso.</small>
      </div>
      <div className="grid2">
        <label className="field" style={{ fontWeight: 400 }}>
          <small>WhatsApp, com DDD</small>
          <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="48 99999-0000" />
        </label>
        <label className="field" style={{ fontWeight: 400 }}>
          <small>Link do perfil no LinkedIn</small>
          <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://www.linkedin.com/in/..." />
        </label>
      </div>
      {(modules.includes('ctd') || modules.includes('project')) && (
        <label className="field" style={{ fontWeight: 400 }}>
          <small>Usuário do GitHub</small>
          <input value={github} onChange={(e) => setGithub(e.target.value)} autoCapitalize="none" spellCheck={false} />
        </label>
      )}
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
    whatsapp: profile.whatsapp ?? '',
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const gh = cleanGithub(f.github_username);
    const wa = normalizeWhatsapp(f.whatsapp);
    if (wa === false) {
      setMsg({ ok: false, text: 'Confira o WhatsApp: DDD e número.' });
      return;
    }
    if (gh && !GITHUB_USER_RE.test(gh)) {
      setMsg({ ok: false, text: 'Usuário do GitHub inválido.' });
      return;
    }
    setBusy(true);
    const { error } = await createClient()
      .from('profiles')
      .update({ ...f, name: f.name.trim(), objective: f.objective.trim() || null, linkedin_url: f.linkedin_url.trim() || null, github_username: gh || null, whatsapp: wa })
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
        WhatsApp, com DDD
        <input type="tel" value={f.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} placeholder="48 99999-0000" />
      </label>
      <label className="field">
        Link do perfil no LinkedIn
        <input type="url" value={f.linkedin_url} onChange={(e) => set({ linkedin_url: e.target.value })} placeholder="https://www.linkedin.com/in/..." />
      </label>
      {f.modules.includes('daily') && (
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
      )}
      {f.modules.includes('checklist') && (
        <label className="field">
          Itens do checklist por semana
          <small>A pessoa vê esse número de itens em "Para fazer esta semana". O que você colocar no foco entra primeiro; o resto segue a ordem do checklist.</small>
          <input type="number" min={0} max={10} required value={f.weekly_items} onChange={(e) => set({ weekly_items: Number(e.target.value) })} style={{ maxWidth: 120 }} />
        </label>
      )}
      <ModulePicker value={f.modules} onChange={(modules) => set({ modules })} />
      {(f.modules.includes('ctd') || f.modules.includes('project')) && (
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
