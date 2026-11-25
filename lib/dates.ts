export const TZ = 'America/Sao_Paulo';

/** Data de hoje no fuso de Brasília, como AAAA-MM-DD. */
export function todayISO(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
}

function toDate(iso: string) {
  return new Date(iso + 'T00:00:00Z');
}

export function addDays(iso: string, n: number): string {
  const d = toDate(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** 0 = domingo ... 6 = sábado */
export function weekday(iso: string): number {
  return toDate(iso).getUTCDay();
}

export function mondayOf(iso: string): string {
  return addDays(iso, -((weekday(iso) + 6) % 7));
}

/** Converte um instante (timestamp ISO) para a data no fuso de Brasília. */
export function dateInTZ(timestamp: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(timestamp));
}

export function monthLabel(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' }).format(toDate(iso));
}

export function formatLong(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(toDate(iso));
}

export function formatShort(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }).format(toDate(iso));
}
