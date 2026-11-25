import { redirect } from 'next/navigation';
import { InstallPrompt } from '@/components/InstallPrompt';
import { Nav, type NavLink } from '@/components/Nav';
import { requireProfile } from '@/lib/session';
import { MODULES, has } from '@/lib/types';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireProfile();
  if (profile.role === 'mentee' && !profile.onboarded_at) redirect('/bem-vindo');
  if (profile.role === 'mentee' && !profile.toured_at) redirect('/passeio');
  const links: NavLink[] =
    profile.role === 'mentor'
      ? [
          { href: '/mentor', label: 'Pessoas' },
          { href: '/conta', label: 'Conta' },
        ]
      : [...MODULES.filter((m) => has(profile, m.id)).map((m) => ({ href: m.href, label: m.nav })), { href: '/conta', label: 'Conta' }];
  return (
    <>
      <Nav links={links} />
      <main className="wrap">
        <InstallPrompt />
        {children}
      </main>
    </>
  );
}
