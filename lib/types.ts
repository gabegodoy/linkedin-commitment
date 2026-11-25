import type { Counts } from './progress';

export type Profile = {
  id: string;
  email: string;
  name: string;
  role: 'mentor' | 'mentee';
  is_dev: boolean;
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
