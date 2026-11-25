-- Módulos liberados por pessoa (substitui o campo is_dev)
alter table public.profiles add column modules text[] not null default '{daily,checklist}'
  check (modules <@ array['daily', 'checklist', 'ctd', 'project']);
update public.profiles set modules = '{daily,checklist,ctd,project}' where is_dev;
update public.profiles set modules = '{}' where role = 'mentor';

create or replace function public._guard_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.id := old.id;
  new.email := old.email;
  new.role := old.role;
  if (select auth.uid()) is not null and not public.is_mentor() then
    new.modules := old.modules;
    new.objective := old.objective;
    new.linkedin_url := old.linkedin_url;
    new.goal_connections := old.goal_connections;
    new.goal_likes := old.goal_likes;
    new.goal_comments := old.goal_comments;
    new.goal_posts := old.goal_posts;
  end if;
  return new;
end $$;

drop function public.create_mentee(text, text, text, boolean);
drop function public.bootstrap_mentor(text, text, text);
drop function public._create_user(text, text, text, public.user_role, boolean);
alter table public.profiles drop column is_dev;

create function public._create_user(p_email text, p_password text, p_name text, p_role public.user_role, p_modules text[])
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid := gen_random_uuid();
  v_email text := lower(trim(p_email));
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'E-mail inválido.'; end if;
  if length(coalesce(p_password, '')) < 8 then raise exception 'A senha precisa ter pelo menos 8 caracteres.'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'Informe o nome.'; end if;
  if not (p_modules <@ array['daily', 'checklist', 'ctd', 'project']) then raise exception 'Módulo inválido.'; end if;
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

  insert into public.profiles (id, email, name, role, modules) values (v_id, v_email, trim(p_name), p_role, p_modules);
  return v_id;
end $$;

create function public.bootstrap_mentor(p_email text, p_password text, p_name text)
returns uuid language plpgsql security definer set search_path = '' as $$
begin
  lock table public.profiles in share row exclusive mode;
  if public.mentor_exists() then raise exception 'O mentor já foi cadastrado.'; end if;
  return public._create_user(p_email, p_password, p_name, 'mentor', '{}');
end $$;

create function public.create_mentee(p_email text, p_password text, p_name text, p_modules text[] default '{daily,checklist}')
returns uuid language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_mentor() then raise exception 'Apenas o mentor pode cadastrar pessoas.'; end if;
  return public._create_user(p_email, p_password, p_name, 'mentee', coalesce(p_modules, '{}'));
end $$;

revoke execute on function public._create_user(text, text, text, public.user_role, text[]) from public, anon, authenticated;
revoke execute on function public.create_mentee(text, text, text, text[]) from public, anon;
grant execute on function public.create_mentee(text, text, text, text[]) to authenticated;
grant execute on function public.bootstrap_mentor(text, text, text) to anon, authenticated;
