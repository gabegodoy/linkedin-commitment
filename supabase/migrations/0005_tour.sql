-- Passo a passo guiado: quando a pessoa concluiu (ou pulou) o passeio
alter table public.profiles add column toured_at timestamptz;
update public.profiles set toured_at = now() where role = 'mentor';

-- Primeiro nome do mentor, para o passeio (o mentorado não lê o perfil do mentor)
create function public.mentor_name() returns text
language sql stable security definer set search_path = '' as $$
  select split_part(name, ' ', 1) from public.profiles where role = 'mentor' order by created_at limit 1;
$$;
revoke execute on function public.mentor_name() from public, anon;
grant execute on function public.mentor_name() to authenticated;
