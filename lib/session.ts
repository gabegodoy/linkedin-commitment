import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';
import type { MentorItem, Profile } from './types';
import { addDays } from './dates';
import { toLogs } from './progress';

export const getSession = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
  if (!profile) return null;
  return { supabase, profile: profile as Profile };
});

export async function requireProfile() {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

export async function requireMentee() {
  const session = await requireProfile();
  if (session.profile.role === 'mentor') redirect('/mentor');
  return session;
}

export async function requireMentor() {
  const session = await requireProfile();
  if (session.profile.role !== 'mentor') redirect('/hoje');
  return session;
}

type Client = Awaited<ReturnType<typeof createClient>>;

export async function loadMenteeData(supabase: Client, userId: string, today: string) {
  const [logs, done, items] = await Promise.all([
    supabase.from('daily_log').select('day, connections, likes, comments, posts').eq('user_id', userId).gte('day', addDays(today, -500)),
    supabase.from('checklist_done').select('item_id').eq('user_id', userId).eq('done', true),
    supabase.from('mentor_items').select('item_id, focus, note').eq('user_id', userId),
  ]);
  return {
    logs: toLogs(logs.data),
    done: (done.data ?? []).map((r) => r.item_id as number),
    mentorItems: (items.data ?? []) as MentorItem[],
  };
}
