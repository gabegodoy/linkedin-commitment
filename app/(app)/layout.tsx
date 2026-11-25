import { Nav, type NavLink } from '@/components/Nav';
import { requireProfile } from '@/lib/session';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireProfile();
  const links: NavLink[] =
    profile.role === 'mentor'
      ? [
          { href: '/mentor', label: 'Pessoas' },
          { href: '/conta', label: 'Conta' },
        ]
      : [
          { href: '/hoje', label: 'Hoje' },
          { href: '/checklist', label: 'Checklist' },
          ...(profile.is_dev
            ? [
                { href: '/ctd', label: 'Código' },
                { href: '/projeto', label: 'Projeto' },
              ]
            : []),
          { href: '/conta', label: 'Conta' },
        ];
  return (
    <>
      <Nav links={links} />
      <main className="wrap">{children}</main>
    </>
  );
}
