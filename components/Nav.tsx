'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

export type NavLink = { href: string; label: string };

export function Nav({ links }: { links: NavLink[] }) {
  const path = usePathname();
  const items = links.map((l) => (
    <Link key={l.href} href={l.href} aria-current={path === l.href || path.startsWith(l.href + '/') ? 'page' : undefined}>
      {l.label}
    </Link>
  ));
  return (
    <>
      <header className="nav">
        <div className="nav-in">
          <Link href="/" className="brand">
            <b>
              compromisso<i>.</i>
            </b>
            <span>mentoria linkedin</span>
          </Link>
          <nav className="links" aria-label="Seções">
            {items}
          </nav>
          <div className="nav-right">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <nav className="tabbar" aria-label="Seções">
        {items}
      </nav>
    </>
  );
}
