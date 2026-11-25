-- Link de acesso de uso único: a pessoa cria a própria senha, sem senha trafegar por e-mail
create table public.access_links (
  token_hash text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.access_links enable row level security; -- sem políticas: só as funções abaixo acessam

create function public._hash_token(p_token text) returns text
language sql immutable set search_path = '' as $$
  select encode(extensions.digest(p_token, 'sha256'), 'hex');
$$;

create function public.create_access_link(p_user uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare v_token text := encode(extensions.gen_random_bytes(24), 'hex');
begin
  if not public.is_mentor() then raise exception 'Apenas o mentor pode gerar links de acesso.'; end if;
  if not exists (select 1 from public.profiles where id = p_user and role = 'mentee') then raise exception 'Pessoa não encontrada.'; end if;
  delete from public.access_links where user_id = p_user;
  insert into public.access_links (token_hash, user_id, expires_at) values (public._hash_token(v_token), p_user, now() + interval '7 days');
  return v_token;
end $$;

create function public.access_link_info(p_token text) returns text
language sql stable security definer set search_path = '' as $$
  select split_part(p.name, ' ', 1) from public.access_links l join public.profiles p on p.id = l.user_id
  where l.token_hash = public._hash_token(p_token) and l.used_at is null and l.expires_at > now();
$$;

create function public.redeem_access_link(p_token text, p_password text) returns text
language plpgsql security definer set search_path = '' as $$
declare v_user uuid; v_email text;
begin
  if length(coalesce(p_password, '')) < 8 then raise exception 'A senha precisa ter pelo menos 8 caracteres.'; end if;
  select user_id into v_user from public.access_links
    where token_hash = public._hash_token(p_token) and used_at is null and expires_at > now() for update;
  if v_user is null then raise exception 'Este link não vale mais. Peça um novo ao seu mentor.'; end if;
  update auth.users set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')), updated_at = now() where id = v_user returning email into v_email;
  update public.access_links set used_at = now() where token_hash = public._hash_token(p_token);
  return v_email;
end $$;

revoke execute on function public._hash_token(text) from public, anon, authenticated;
revoke execute on function public.create_access_link(uuid) from public, anon;
grant execute on function public.create_access_link(uuid) to authenticated;
grant execute on function public.access_link_info(text) to anon, authenticated;
grant execute on function public.redeem_access_link(text, text) to anon, authenticated;
