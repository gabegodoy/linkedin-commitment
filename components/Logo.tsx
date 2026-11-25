/** Marca do compromisso: o "c" com o ponto laranja. Com `animated`, o traço se desenha em laço. */
export function Logo({ size = 64, animated = false }: { size?: number; animated?: boolean }) {
  return (
    <svg className={animated ? 'logo spin' : 'logo'} width={size} height={size} viewBox="0 0 512 512" role="img" aria-label={animated ? 'Carregando' : 'compromisso'}>
      <path className="logo-c" d="M318 176a104 104 0 1 0 0 160" fill="none" stroke="currentColor" strokeWidth="52" strokeLinecap="round" pathLength={100} />
      <circle className="logo-dot" cx="372" cy="336" r="30" />
    </svg>
  );
}
