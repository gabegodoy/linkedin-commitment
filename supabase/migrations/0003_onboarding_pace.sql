-- WhatsApp, primeiro acesso e ritmo semanal do checklist
alter table public.profiles
  add column whatsapp text check (whatsapp is null or whatsapp ~ '^[0-9]{10,15}$'),
  add column onboarded_at timestamptz,
  add column weekly_items int not null default 3 check (weekly_items between 0 and 10);
update public.profiles set onboarded_at = now() where role = 'mentor';

-- A pessoa passa a poder editar nome, WhatsApp, LinkedIn e GitHub do próprio perfil
create or replace function public._guard_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.id := old.id;
  new.email := old.email;
  new.role := old.role;
  if (select auth.uid()) is not null and not public.is_mentor() then
    new.modules := old.modules;
    new.objective := old.objective;
    new.weekly_items := old.weekly_items;
    new.goal_connections := old.goal_connections;
    new.goal_likes := old.goal_likes;
    new.goal_comments := old.goal_comments;
    new.goal_posts := old.goal_posts;
  end if;
  return new;
end $$;
