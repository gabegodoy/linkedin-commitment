import { NextResponse } from 'next/server';
import { welcomeEmail } from '@/lib/emails/welcome';
import { getSession } from '@/lib/session';
import { firstName, type Profile } from '@/lib/types';

/** Gera um link de acesso de uso único e envia por e-mail. Só o mentor pode chamar. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.profile.role !== 'mentor') return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });

  const key = process.env.RESEND_API_KEY;
  if (!key) return NextResponse.json({ error: 'O envio de e-mail ainda não foi configurado.' }, { status: 503 });

  const body = (await request.json().catch(() => null)) as { userId?: string; test?: boolean } | null;
  const origin = process.env.APP_URL || new URL(request.url).origin;
  const mentor = session.profile.name;
  if (body?.test) {
    // Envio de teste: vai para o próprio mentor, com um link que só leva ao site.
    return send(key, session.profile.email, session.profile.email, welcomeEmail({ nome: firstName(mentor), link: origin, mentor }));
  }
  if (!body?.userId || !/^[0-9a-f-]{36}$/i.test(body.userId)) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });

  const { data } = await session.supabase.from('profiles').select('*').eq('id', body.userId).eq('role', 'mentee').maybeSingle();
  if (!data) return NextResponse.json({ error: 'Pessoa não encontrada.' }, { status: 404 });
  const person = data as Profile;
  const link = await session.supabase.rpc('create_access_link', { p_user: person.id });
  if (link.error || !link.data) return NextResponse.json({ error: 'Não foi possível gerar o link de acesso.' }, { status: 500 });

  return send(key, person.email, session.profile.email, welcomeEmail({ nome: firstName(person.name), link: `${origin}/acesso/${link.data}`, mentor }));
}

async function send(key: string, to: string, replyTo: string, mail: { subject: string; html: string; text: string }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.EMAIL_FROM || 'Compromisso <compromisso@neogen.com.br>', to: [to], reply_to: replyTo, subject: mail.subject, html: mail.html, text: mail.text }),
  });
  if (!res.ok) {
    const detail = ((await res.json().catch(() => null)) as { message?: string } | null)?.message ?? '';
    console.error('Resend recusou o envio', res.status, detail);
    return NextResponse.json({ error: `O serviço de e-mail recusou o envio.${detail ? ' Motivo: ' + detail : ''}` }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
