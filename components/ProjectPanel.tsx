'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UrlField } from './Fields';
import { createClient } from '@/lib/supabase/client';
import { addDays, formatShort } from '@/lib/dates';
import type { Project } from '@/lib/types';
import { completeUrl } from '@/lib/mask';

function weekLabel(weekStart: string) {
  return `${formatShort(weekStart)} a ${formatShort(addDays(weekStart, 6))}`;
}

function useSave(userId: string) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function save(weekStart: string, patch: Partial<Project>) {
    setBusy(true);
    setError('');
    const { error } = await createClient()
      .from('weekly_projects')
      .upsert({ user_id: userId, week_start: weekStart, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'user_id,week_start' });
    setBusy(false);
    if (error) setError('Não foi possível salvar. Verifique a internet e tente de novo.');
    else router.refresh();
    return !error;
  }
  return { busy, error, save };
}

function PostForm({ userId, project }: { userId: string; project: Project }) {
  const { busy, error, save } = useSave(userId);
  const [url, setUrl] = useState(project.post_url ?? '');
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        save(project.week_start, { title: project.title, post_url: completeUrl(url) || null });
      }}
    >
      <UrlField label="Link do post no LinkedIn" hint="No post, toque nos três pontinhos e em Copiar link." required value={url} onChange={setUrl} placeholder="https://www.linkedin.com/posts/..." />
      {error && <p className="msg err">{error}</p>}
      <div className="actions">
        <button className="btn" type="submit" disabled={busy}>
          Registrar post
        </button>
      </div>
    </form>
  );
}

export function ProjectPanel({ userId, weekStart, current, pendingPost }: { userId: string; weekStart: string; current: Project | null; pendingPost: Project | null }) {
  const { busy, error, save } = useSave(userId);
  const [editing, setEditing] = useState(!current);
  const [title, setTitle] = useState(current?.title ?? '');
  const [description, setDescription] = useState(current?.description ?? '');
  const [repo, setRepo] = useState(current?.repo_url ?? '');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await save(weekStart, { title: title.trim(), description: description.trim() || null, repo_url: completeUrl(repo) || null });
    if (ok) setEditing(false);
  }

  return (
    <>
      {pendingPost && (
        <>
          <h2 className="hi">
            <span>Post de segunda</span>
            <span>semana de {weekLabel(pendingPost.week_start)}</span>
          </h2>
          <div className="card pad stack">
            <div>
              <b>{pendingPost.title}</b>
              <div className="muted" style={{ fontSize: 14 }}>
                {pendingPost.delivered_at ? 'Projeto entregue. Agora conte no LinkedIn o que você construiu.' : 'A semana fechou sem entrega marcada. Ainda vale postar o que você aprendeu.'}
              </div>
            </div>
            <PostForm userId={userId} project={pendingPost} />
          </div>
        </>
      )}

      <h2>
        <span>Projeto desta semana</span>
        <span>{weekLabel(weekStart)}</span>
      </h2>
      {current && !editing ? (
        <div className="card pad stack">
          <div>
            <b style={{ fontSize: 20 }}>{current.title}</b>
            {current.description && <p className="soft" style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap' }}>{current.description}</p>}
            {current.repo_url && (
              <p style={{ margin: '6px 0 0' }}>
                <a href={current.repo_url} target="_blank" rel="noopener noreferrer">
                  Abrir o repositório ↗
                </a>
              </p>
            )}
          </div>
          <p className={'msg ' + (current.delivered_at ? 'ok' : 'soft')}>{current.delivered_at ? '✓ Entregue. Na segunda de manhã, faça o post.' : 'Entrega até domingo.'}</p>
          {error && <p className="msg err">{error}</p>}
          <div className="actions">
            {current.delivered_at ? (
              <button type="button" className="ghost" disabled={busy} onClick={() => save(weekStart, { title: current.title, delivered_at: null })}>
                Desfazer entrega
              </button>
            ) : (
              <button type="button" className="btn" disabled={busy} onClick={() => save(weekStart, { title: current.title, delivered_at: new Date().toISOString() })}>
                Marcar como entregue
              </button>
            )}
            <button type="button" className="ghost" onClick={() => setEditing(true)}>
              Editar
            </button>
          </div>
        </div>
      ) : (
        <form className="card pad form" onSubmit={submit}>
          <label className="field">
            Qual é o projeto?
            <small>Escolha na segunda algo que caiba em uma semana.</small>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
          </label>
          <label className="field">
            O que ele vai fazer?
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} />
          </label>
          <UrlField label="Link do repositório (opcional)" value={repo} onChange={setRepo} placeholder="https://github.com/usuario/projeto" />
          {error && <p className="msg err">{error}</p>}
          <div className="actions">
            <button className="btn" type="submit" disabled={busy}>
              {current ? 'Salvar' : 'Começar projeto'}
            </button>
            {current && (
              <button type="button" className="ghost" onClick={() => setEditing(false)}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
    </>
  );
}

export function ProjectHistory({ projects }: { projects: Project[] }) {
  if (!projects.length) return null;
  return (
    <>
      <h2>
        <span>Semanas anteriores</span>
        <span>
          {projects.filter((p) => p.delivered_at).length} de {projects.length} entregues
        </span>
      </h2>
      <div className="card">
        {projects.map((p) => (
          <div key={p.week_start} className="row">
            <span className="txt">
              <span>{p.title}</span>
              <small>
                {weekLabel(p.week_start)} · {p.delivered_at ? 'entregue' : 'não entregue'} ·{' '}
                {p.post_url ? (
                  <a href={p.post_url} target="_blank" rel="noopener noreferrer">
                    ver post ↗
                  </a>
                ) : (
                  'sem post'
                )}
              </small>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
