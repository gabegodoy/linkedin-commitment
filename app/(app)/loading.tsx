import { Logo } from '@/components/Logo';

export default function Loading() {
  return (
    <div className="loading" role="status" aria-live="polite">
      <Logo size={72} animated />
      <span className="mono">carregando…</span>
      <div className="skel-wrap" aria-hidden="true">
        <div className="skel" style={{ height: 120 }} />
        <div className="skel" style={{ height: 64 }} />
        <div className="skel" style={{ height: 64 }} />
        <div className="skel" style={{ height: 64 }} />
      </div>
    </div>
  );
}
