import { wordOfDay } from '@/lib/words';

export function WordOfDay({ day }: { day: string }) {
  const w = wordOfDay(day);
  return (
    <blockquote className="word">
      <p>{w.text}</p>
      {w.ref && <cite>{w.ref}</cite>}
    </blockquote>
  );
}
