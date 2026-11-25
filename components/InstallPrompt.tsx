'use client';

import { useEffect, useState } from 'react';
import { Logo } from './Logo';

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const KEY = 'install-dismissed';

/** Convite para colocar o app na tela inicial. Android: botão que instala. iPhone: passo a passo. */
export function InstallPrompt() {
  const [mode, setMode] = useState<'none' | 'android' | 'ios' | 'inapp'>('none');
  const [event, setEvent] = useState<InstallEvent | null>(null);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(KEY) === '1';
    } catch {}
    if (standalone || dismissed) return;
    const ua = navigator.userAgent;
    const mobile = /Android|iPhone|iPad|iPod/i.test(ua);
    if (!mobile) return;
    // Navegador embutido de app de e-mail ou rede social não instala: orientar a abrir no navegador.
    if (/FBAN|FBAV|Instagram|LinkedInApp|GSA\/|; wv\)/i.test(ua)) return setMode('inapp');
    if (/iPhone|iPad|iPod/i.test(ua)) return setMode('ios');
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
      setMode('android');
    };
    const onInstalled = () => setMode('none');
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(KEY, '1');
    } catch {}
    setMode('none');
  }

  async function install() {
    if (!event) return;
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === 'accepted') setMode('none');
  }

  if (mode === 'none') return null;
  return (
    <aside className="install card" aria-label="Instalar o aplicativo">
      <Logo size={44} />
      <div className="install-txt">
        <b>Coloque o compromisso na tela inicial</b>
        {mode === 'android' && <span>Assim você abre com um toque, como um aplicativo.</span>}
        {mode === 'ios' && (
          <span>
            Toque em <b>Compartilhar</b> (o quadrado com a seta para cima) e depois em <b>Adicionar à Tela de Início</b>.
          </span>
        )}
        {mode === 'inapp' && (
          <span>
            Você está dentro de outro aplicativo. Toque nos três pontinhos e escolha <b>Abrir no navegador</b>; lá aparece a opção de instalar.
          </span>
        )}
      </div>
      <div className="actions">
        {mode === 'android' && (
          <button type="button" className="btn sm" onClick={install}>
            Instalar
          </button>
        )}
        <button type="button" className="ghost sm" onClick={dismiss}>
          {mode === 'android' ? 'Agora não' : 'Entendi'}
        </button>
      </div>
    </aside>
  );
}
