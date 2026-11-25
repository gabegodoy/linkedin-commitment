import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Landing } from '@/components/Landing';
import { getSession } from '@/lib/session';
import { homeOf } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Compromisso · mentoria de LinkedIn gratuita, com Gabriel Godoy',
  description: 'Um pouco por dia, todo dia. Metas diárias e checklist do perfil para o recrutador chegar até você. Gratuito e por convite.',
  robots: { index: true, follow: true },
};

/** Quem está logado vai direto para o app; quem não está vê a apresentação. */
export default async function Home() {
  const session = await getSession();
  if (session) redirect(session.profile.role === 'mentor' ? '/mentor' : homeOf(session.profile));
  return <Landing />;
}
