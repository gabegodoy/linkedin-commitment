-- compromisso. — esquema inicial
create type public.user_role as enum ('mentor', 'mentee');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null,
  role public.user_role not null default 'mentee',
  is_dev boolean not null default false,
  objective text,
  linkedin_url text,
  github_username text,
  goal_connections int not null default 4 check (goal_connections between 0 and 20),
  goal_likes int not null default 3 check (goal_likes between 0 and 20),
  goal_comments int not null default 2 check (goal_comments between 0 and 20),
  goal_posts int not null default 1 check (goal_posts between 0 and 20),
  created_at timestamptz not null default now()
);

-- Itens do checklist marcados como feitos (pelo mentorado ou pelo mentor)
create table public.checklist_done (
  user_id uuid not null references public.profiles (id) on delete cascade,
  item_id int not null check (item_id between 1 and 33),
  done boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

-- O que só o mentor define por item: foco da semana e orientação personalizada
create table public.mentor_items (
  user_id uuid not null references public.profiles (id) on delete cascade,
  item_id int not null check (item_id between 1 and 33),
  focus boolean not null default false,
  note text,
  primary key (user_id, item_id)
);

create table public.daily_log (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  connections int not null default 0 check (connections between 0 and 50),
  likes int not null default 0 check (likes between 0 and 50),
  comments int not null default 0 check (comments between 0 and 50),
  posts int not null default 0 check (posts between 0 and 50),
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

create table public.weekly_projects (
  user_id uuid not null references public.profiles (id) on delete cascade,
  week_start date not null,
  title text not null,
  description text,
  repo_url text,
  delivered_at timestamptz,
  post_url text,
  updated_at timestamptz not null default now(),
  primary key (user_id, week_start)
);

-- ---------- helpers ----------
create function public.is_mentor() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'mentor');
$$;

create function public.mentor_exists() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where role = 'mentor');
$$;

-- Mentorado só altera nome e usuário do GitHub no próprio perfil
create function public._guard_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.id := old.id;
  new.email := old.email;
  new.role := old.role;
  if (select auth.uid()) is not null and not public.is_mentor() then
    new.is_dev := old.is_dev;
    new.objective := old.objective;
    new.linkedin_url := old.linkedin_url;
    new.goal_connections := old.goal_connections;
    new.goal_likes := old.goal_likes;
    new.goal_comments := old.goal_comments;
    new.goal_posts := old.goal_posts;
  end if;
  return new;
end $$;
create trigger guard_profile before update on public.profiles
  for each row execute function public._guard_profile();

-- Cadastro público fechado: contas só nascem pelas funções abaixo
create function public._block_signup() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(current_setting('app.allow_user_create', true), '') <> '1' then
    raise exception 'Cadastro fechado. Peça acesso ao seu mentor.';
  end if;
  return new;
end $$;
create trigger block_signup before insert on auth.users
  for each row execute function public._block_signup();

create function public._create_user(p_email text, p_password text, p_name text, p_role public.user_role, p_is_dev boolean)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid := gen_random_uuid();
  v_email text := lower(trim(p_email));
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'E-mail inválido.'; end if;
  if length(coalesce(p_password, '')) < 8 then raise exception 'A senha precisa ter pelo menos 8 caracteres.'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'Informe o nome.'; end if;
  if exists (select 1 from auth.users where email = v_email) then raise exception 'Já existe uma conta com este e-mail.'; end if;

  perform set_config('app.allow_user_create', '1', true);
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change)
  values ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  perform set_config('app.allow_user_create', '', true);

  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), v_id, v_id::text,
    jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true, 'phone_verified', false),
    'email', now(), now(), now());

  insert into public.profiles (id, email, name, role, is_dev) values (v_id, v_email, trim(p_name), p_role, p_is_dev);
  return v_id;
end $$;

-- Primeiro acesso: cria o mentor, só funciona enquanto não existir nenhum
create function public.bootstrap_mentor(p_email text, p_password text, p_name text)
returns uuid language plpgsql security definer set search_path = '' as $$
begin
  lock table public.profiles in share row exclusive mode;
  if public.mentor_exists() then raise exception 'O mentor já foi cadastrado.'; end if;
  return public._create_user(p_email, p_password, p_name, 'mentor', false);
end $$;

create function public.create_mentee(p_email text, p_password text, p_name text, p_is_dev boolean default false)
returns uuid language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_mentor() then raise exception 'Apenas o mentor pode cadastrar pessoas.'; end if;
  return public._create_user(p_email, p_password, p_name, 'mentee', coalesce(p_is_dev, false));
end $$;

create function public.set_mentee_password(p_user uuid, p_password text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_mentor() then raise exception 'Apenas o mentor pode trocar senhas.'; end if;
  if length(coalesce(p_password, '')) < 8 then raise exception 'A senha precisa ter pelo menos 8 caracteres.'; end if;
  if not exists (select 1 from public.profiles where id = p_user and role = 'mentee') then raise exception 'Pessoa não encontrada.'; end if;
  update auth.users set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')), updated_at = now() where id = p_user;
end $$;

create function public.delete_mentee(p_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_mentor() then raise exception 'Apenas o mentor pode remover pessoas.'; end if;
  if not exists (select 1 from public.profiles where id = p_user and role = 'mentee') then raise exception 'Pessoa não encontrada.'; end if;
  delete from auth.users where id = p_user;
end $$;

revoke execute on function public._create_user(text, text, text, public.user_role, boolean) from public, anon, authenticated;
revoke execute on function public._guard_profile() from public, anon, authenticated;
revoke execute on function public._block_signup() from public, anon, authenticated;
revoke execute on function public.create_mentee(text, text, text, boolean) from public, anon;
revoke execute on function public.set_mentee_password(uuid, text) from public, anon;
revoke execute on function public.delete_mentee(uuid) from public, anon;
revoke execute on function public.is_mentor() from public, anon;
grant execute on function public.create_mentee(text, text, text, boolean) to authenticated;
grant execute on function public.set_mentee_password(uuid, text) to authenticated;
grant execute on function public.delete_mentee(uuid) to authenticated;
grant execute on function public.is_mentor() to authenticated;
grant execute on function public.mentor_exists() to anon, authenticated;
grant execute on function public.bootstrap_mentor(text, text, text) to anon, authenticated;

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.checklist_done enable row level security;
alter table public.mentor_items enable row level security;
alter table public.daily_log enable row level security;
alter table public.weekly_projects enable row level security;

create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_mentor());
create policy profiles_update on public.profiles for update to authenticated
  using (id = (select auth.uid()) or public.is_mentor())
  with check (id = (select auth.uid()) or public.is_mentor());

create policy checklist_all on public.checklist_done for all to authenticated
  using (user_id = (select auth.uid()) or public.is_mentor())
  with check (user_id = (select auth.uid()) or public.is_mentor());

create policy daily_all on public.daily_log for all to authenticated
  using (user_id = (select auth.uid()) or public.is_mentor())
  with check (user_id = (select auth.uid()) or public.is_mentor());

create policy projects_all on public.weekly_projects for all to authenticated
  using (user_id = (select auth.uid()) or public.is_mentor())
  with check (user_id = (select auth.uid()) or public.is_mentor());

create policy mentor_items_select on public.mentor_items for select to authenticated
  using (user_id = (select auth.uid()) or public.is_mentor());
create policy mentor_items_write on public.mentor_items for all to authenticated
  using (public.is_mentor()) with check (public.is_mentor());
