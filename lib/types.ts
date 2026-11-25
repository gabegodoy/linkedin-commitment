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
  whatsapp: string | null;
  onboarded_at: string | null;
  toured_at: string | null;
  weekly_items: number;
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

/** Só dígitos, com 55 na frente quando vier sem o código do país. Vazio vira null. */
export function normalizeWhatsapp(raw: string): string | null | false {
  const d = raw.replace(/\D/g, '');
  if (!d) return null;
  const full = d.length <= 11 ? '55' + d : d;
  return /^[0-9]{12,15}$/.test(full) ? full : false;
}

export function whatsappLink(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** Mensagem pronta para o mentor mandar, conforme a pessoa está ativa ou parada. */
export function nudgeMessage(name: string, quiet: boolean, run: number) {
  const first = firstName(name);
  if (quiet) {
    return `Oi, ${first}! Senti sua falta no compromisso. Tudo bem por aí? Que tal retomar hoje, nem que seja com uma meta só? "Não nos cansemos então de fazer o bem, porque a seu tempo viremos a recolher muitas bênçãos, se formos perseverantes." (Gálatas 6:9) Conte comigo!`;
  }
  if (run >= 3) return `Oi, ${first}! Vi que você está há ${run} dias seguidos cumprindo as metas. Que orgulho! Continue firme, o resultado vem.`;
  return `Oi, ${first}! Passando para dizer que estou acompanhando seu progresso. Um pouco por dia, todo dia. Conte comigo!`;
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}
