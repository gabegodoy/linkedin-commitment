import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'compromisso. · mentoria LinkedIn',
    short_name: 'compromisso',
    description: 'Suas metas diárias e o checklist do LinkedIn, um pouco por dia.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0908',
    theme_color: '#0b0908',
    lang: 'pt-BR',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
