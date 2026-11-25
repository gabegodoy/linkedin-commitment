'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<string | null>(null);
  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') || 'dark');
  }, []);
  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch {}
    setTheme(next);
  }
  return (
    <button type="button" className="ghost sm" onClick={toggle} aria-label="Alternar tema claro e escuro">
      {theme === 'light' ? 'Tema escuro' : 'Tema claro'}
    </button>
  );
}
