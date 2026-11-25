import type { Counts } from './progress';

export const MODULES = [
  { id: 'daily', label: 'Metas diárias do LinkedIn', hint: 'Conexões, curtidas, comentários e posts de cada dia.', href: '/hoje', nav: 'Hoje' },
  { id: 'checklist', label: 'Checklist completo do perfil', hint: 'Os 33 itens da consultoria.', href: '/checklist', nav: 'Checklist' },
  { id: 'ctd', label: 'Código todo dia', hint: 'Ladrilhos do GitHub com sequência e marcos.', href: '/ctd', nav: 'Código' },
  { id: 'project', label: 'Projeto da semana', hint: 'Um projeto por semana, com entrega e post.', href: '/projeto', nav: 'Projeto' },
] as const;
export type Module = (typeof MODULES)[number]['id'];

export function has(p: { modules: Module[] }, m: Module) {
  return p.modules.includes(m);
}

/** Primeira tela liberada para a pessoa. */
export function homeOf(p: { modules: Module[] }) {
  return MODULES.find((m) => p.modules.includes(m.id))?.href ?? '/conta';
}

export type Profile = {
  id: string;
  email: string;
  name: string;
  role: 'mentor' | 'mentee';
  modules: Module[];
  objective: string | null;
  linkedin_url: string | null;
  github_username: string | null;
  goal_connections: number;
  goal_likes: number;
  goal_comments: number;
  goal_posts: number;
  created_at: string;
};

export type MentorItem = { item_id: number; focus: boolean; note: string | null };

export type Project = {
  user_id: string;
  week_start: string;
  title: string;
  description: string | null;
  repo_url: string | null;
  delivered_at: string | null;
  post_url: string | null;
};

export function goalsOf(p: Profile): Counts {
  return [p.goal_connections, p.goal_likes, p.goal_comments, p.goal_posts];
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}
