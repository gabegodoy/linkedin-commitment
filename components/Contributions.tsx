import { Milestones } from './Today';
import { weekday } from '@/lib/dates';
import { dailyStreak } from '@/lib/progress';
import type { ContribDay } from '@/lib/github';

export function Contributions({ days, today, username }: { days: ContribDay[]; today: string; username: string }) {
  const past = days.filter((d) => d.date <= today);
  const active = new Set(past.filter((d) => d.count > 0).map((d) => d.date));
  const run = dailyStreak(active, today);
  const todayCount = past.find((d) => d.date === today)?.count ?? 0;
  const blanks = past.length ? weekday(past[0].date) : 0;
  return (
    <>
      <h2>
        <span>Código todo dia</span>
        <span>
          {run} {run === 1 ? 'dia seguido' : 'dias seguidos'}
        </span>
      </h2>
      <div className="card pad">
        <b>{todayCount > 0 ? `Hoje: ${todayCount} ${todayCount === 1 ? 'contribuição' : 'contribuições'}.` : 'Hoje ainda não tem commit.'}</b>
        <div className="muted" style={{ fontSize: 14 }}>
          Dados públicos de github.com/{username}, atualizados a cada 30 minutos. Dias ativos no último ano: {active.size}.
        </div>
      </div>
      <div className="card tiles-scroll" role="img" aria-label={`Contribuições no GitHub no último ano: ${active.size} dias ativos`}>
        <div className="tiles">
          {Array.from({ length: blanks }, (_, i) => (
            <span key={'b' + i} className="tile blank" />
          ))}
          {past.map((d) => (
            <span key={d.date} className={'tile' + (d.level ? ' l' + d.level : '')} title={`${d.date}: ${d.count}`} />
          ))}
        </div>
      </div>
      <Milestones value={run} />
    </>
  );
}
