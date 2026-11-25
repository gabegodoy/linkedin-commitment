'use client';

import { useState } from 'react';
import { Logo } from './Logo';
import { createClient } from '@/lib/supabase/client';
import { wordOfDay } from '@/lib/words';
import type { Module } from '@/lib/types';

type StepKey = 'welcome' | 'method' | 'goals' | 'streak' | 'checklist' | 'code' | 'project' | 'mentor' | 'badge';

const CHECK = (
  <svg className="t-pop" width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

function Confetti() {
  const colors = ['var(--sun)', 'var(--sun-2)', 'var(--fg)', 'var(--prog)'];
  return (
    <>
      {Array.from({ length: 16 }, (_, i) => (
        <span
          key={i}
          className="t-fall"
          aria-hidden="true"
          style={{ left: `${(i * 61) % 100}%`, width: 6 + (i % 3) * 3, height: 6 + (i % 3) * 3, background: colors[i % colors.length], animationDelay: `${((i * 0.37) % 2.6).toFixed(2)}s` }}
        />
      ))}
    </>
  );
}

function Reward({ children }: { children: React.ReactNode }) {
  return (
    <div className="t-reward t-pop" role="status">
      <b>+10</b>
      <span>{children}</span>
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="t-hint t-pulse">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5" />
        <path d="M6 11l6-6 6 6" />
      </svg>
      {children}
    </p>
  );
}

function Rule({ icon, title, children, cls }: { icon: React.ReactNode; title: string; children: React.ReactNode; cls: string }) {
  return (
    <div className={'t-rule card ' + cls}>
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--sun)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {icon}
      </svg>
      <div>
        <b>{title}</b>
        <span>{children}</span>
      </div>
    </div>
  );
}

const ITEMS = [
  ['Foto', 'Nítida, de rosto, sorrindo.'],
  ['Título', 'As palavras da vaga que você procura.'],
  ['Customizar URL', 'Um endereço com o seu nome.'],
];
const WEEK = ['seg', 'ter', 'hoje', 'qui', 'sex', 'sáb', 'dom'];

export function Tour({ userId, name, mentor, modules, today }: { userId: string; name: string; mentor: string; modules: Module[]; today: string }) {
  const steps: StepKey[] = [
    'welcome',
    'method',
    ...(modules.includes('daily') ? (['goals', 'streak'] as StepKey[]) : []),
    ...(modules.includes('checklist') ? (['checklist'] as StepKey[]) : []),
    ...(modules.includes('ctd') ? (['code'] as StepKey[]) : []),
    ...(modules.includes('project') ? (['project'] as StepKey[]) : []),
    'mentor',
    'badge',
  ];
  const [idx, setIdx] = useState(0);
  const [boxes, setBoxes] = useState(0);
  const [lit, setLit] = useState(false);
  const [checked, setChecked] = useState<number[]>([]);
  const [commit, setCommit] = useState(false);
  const [busy, setBusy] = useState(false);
  const step = steps[idx];
  const last = steps.length - 1;
  const features = steps.filter((s) => !['welcome', 'method', 'badge'].includes(s));
  const featureNo = features.indexOf(step) + 1;
  const tasks: Partial<Record<StepKey, boolean>> = { goals: boxes >= 4, streak: lit, checklist: checked.length > 0, code: commit };
  const taskDone = tasks[step] ?? true;
  const points = (idx >= 1 ? 10 : 0) + steps.filter((s) => tasks[s]).length * 10 + (idx >= last ? 10 : 0);
  const word = wordOfDay(today);
  const eyebrow = (label: string) => (
    <span className="eyebrow t-rise">
      {featureNo} de {features.length} · {label}
    </span>
  );

  async function finish() {
    setBusy(true);
    await createClient().from('profiles').update({ toured_at: new Date().toISOString() }).eq('id', userId);
    window.location.assign('/');
  }

  return (
    <main className="tour">
      <div className="tour-top">
        <span className="brand">
          <b>
            compromisso<i>.</i>
          </b>
        </span>
        <div className="tour-top-r">
          <span className="t-points mono" aria-live="polite">
            {points} pontos
          </span>
          {idx < last && (
            <button type="button" className="t-link" onClick={() => setIdx(last)}>
              Pular
            </button>
          )}
        </div>
      </div>
      <div className="t-segs" role="img" aria-label={`Passo ${idx + 1} de ${steps.length}`}>
        {steps.map((s, i) => (
          <span key={s} className={i <= idx ? 'on' : undefined} />
        ))}
      </div>

      <div className={'tour-body' + (step === 'welcome' || step === 'badge' ? ' center' : '')} key={step}>
        {step === 'welcome' && (
          <>
            <Confetti />
            <div className="t-float">
              <Logo size={132} animated />
            </div>
            <span className="eyebrow t-rise">você chegou</span>
            <h1 className="t-rise2">
              Parabéns, {name}
              <em>!</em>
            </h1>
            <p className="t-lead t-rise3">Decidir cuidar da sua carreira é o passo mais difícil. E você acabou de dar.</p>
            <p className="t-sub t-rise3">Em um minuto eu mostro como funciona. Você aprende brincando e já ganha seus primeiros pontos.</p>
          </>
        )}

        {step === 'method' && (
          <>
            <span className="eyebrow t-rise">antes de tudo · como a gente joga</span>
            <h1 className="t-rise">
              Aqui, o recrutador vem até você<em>.</em>
            </h1>
            <Rule
              cls="t-rise"
              title="Nada de sair atirando currículo"
              icon={
                <>
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="12" cy="12" r="1.2" fill="var(--sun)" />
                </>
              }
            >
              A gente arruma o seu perfil para o recrutador encontrar você.
            </Rule>
            <Rule
              cls="t-rise2"
              title="Tudo aponta para a vaga que você quer"
              icon={
                <>
                  <path d="M4 19h16" />
                  <path d="M5 15l5-5 4 3 5-7" />
                  <path d="M15 6h4v4" />
                </>
              }
            >
              Título, experiências, competências: as mesmas palavras do anúncio. É a ajudinha para o algoritmo.
            </Rule>
            <Rule
              cls="t-rise3"
              title="Conexão certa abre porta"
              icon={
                <>
                  <circle cx="8" cy="9" r="3" />
                  <circle cx="17" cy="10" r="2.4" />
                  <path d="M2.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6" />
                  <path d="M15 14.6c2.8-.5 5.3.9 6.2 4" />
                </>
              }
            >
              Gente da sua área, convite sempre com uma nota, e conversa nos posts de recrutadores. Perfil ativo é perfil quente.
            </Rule>
            <p className="t-sub t-rise3">É por isso que as metas são pequenas e diárias: constância é o que o algoritmo enxerga.</p>
          </>
        )}

        {step === 'goals' && (
          <>
            {eyebrow('metas do dia')}
            <h1 className="t-rise">
              Fez no LinkedIn? Toque aqui<em>.</em>
            </h1>
            <p className="t-lead t-rise2">Todo dia você tem metas pequenas. Cada quadrado é uma ação feita. Experimente: finja que mandou 4 convites com nota para gente da sua área.</p>
            <div className="card pad t-rise3">
              <div className="goal" style={{ padding: 0 }}>
                <div className={'top'}>
                  <span>Novas conexões</span>
                  <span style={boxes >= 4 ? { color: 'var(--sun-2)' } : undefined}>{boxes} de 4</span>
                </div>
                <div className="boxes">
                  {[0, 1, 2, 3].map((i) => (
                    <button key={i} type="button" className={'box t-box' + (i < boxes ? ' on' : '')} aria-pressed={i < boxes} aria-label={`Conexão ${i + 1} de 4`} onClick={() => setBoxes(boxes === i + 1 ? i : i + 1)}>
                      {i < boxes ? CHECK : null}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {boxes >= 4 ? <Reward>Isso! É só isso mesmo. Meta batida, dia mais leve.</Reward> : <Hint>Toque nos quadrados para marcar</Hint>}
          </>
        )}

        {step === 'streak' && (
          <>
            {eyebrow('dias seguidos')}
            <h1 className="t-rise">
              Um dia puxa o outro<em>.</em>
            </h1>
            <p className="t-lead t-rise2">Bateu todas as metas? O dia acende. Dias acesos em sequência viram conquistas: 10, 30, 45 e 100 dias.</p>
            <div className="card t-streak t-rise3">
              <svg className={lit ? 't-flame' : undefined} width="56" height="56" viewBox="0 0 24 24" fill={lit ? 'var(--sun)' : 'none'} stroke={lit ? 'var(--sun-2)' : 'var(--line-2)'} strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2.5c.6 3.2-1.2 4.8-2.6 6.6C8 10.9 7 12.6 7 14.6A5 5 0 0 0 12 20a5 5 0 0 0 5-5.4c0-2.2-1.2-3.6-2.2-5 .1 1.6-.5 2.6-1.4 3.2.4-3.6-.2-7.4-1.4-10.3z" />
              </svg>
              <div>
                <b style={{ color: lit ? 'var(--sun)' : 'var(--dim)' }}>{lit ? 1 : 0}</b>
                <span>{lit ? 'dia seguido' : 'dias seguidos'}</span>
              </div>
            </div>
            <div className="card week t-rise3">
              {WEEK.map((d) => (
                <div key={d} className={'day' + (d === 'hoje' ? ' today' + (lit ? ' full' : '') : '')}>
                  <i />
                  {d}
                </div>
              ))}
            </div>
            {lit ? (
              <Reward>Primeiro dia aceso. Fim de semana não apaga a sequência, pode descansar.</Reward>
            ) : (
              <button type="button" className="t-dashed t-pulse" onClick={() => setLit(true)}>
                Acender o dia de hoje
              </button>
            )}
          </>
        )}

        {step === 'checklist' && (
          <>
            {eyebrow('checklist da semana')}
            <h1 className="t-rise">
              Seu perfil, poucos itens por vez<em>.</em>
            </h1>
            <p className="t-lead t-rise2">São 33 itens no total, mas você só vê os da semana. Terminou um? Toque nele. Experimente riscar o primeiro.</p>
            <div className="card t-rise3">
              {ITEMS.map(([title, hint], i) => {
                const on = checked.includes(i);
                return (
                  <button key={title} type="button" className={'row' + (on ? ' f' : '')} aria-pressed={on} onClick={() => setChecked(on ? checked.filter((x) => x !== i) : [...checked, i])}>
                    <span className="mark">{on ? CHECK : null}</span>
                    <span className="txt">
                      <span>{title}</span>
                      <small>{hint}</small>
                    </span>
                  </button>
                );
              })}
            </div>
            {checked.length > 0 ? <Reward>Gostoso riscar, né? Cada item deixa seu perfil mais forte.</Reward> : <Hint>Toque em um item para riscar</Hint>}
          </>
        )}

        {step === 'code' && (
          <>
            {eyebrow('código todo dia')}
            <h1 className="t-rise">
              Um commit por dia<em>.</em>
            </h1>
            <p className="t-lead t-rise2">Os quadradinhos verdes vêm direto do seu GitHub. Aqui você não marca nada: é só programar e subir o código. Experimente fazer o commit de hoje.</p>
            <div className="card pad t-rise3">
              <div className="t-tiles">
                {Array.from({ length: 28 }, (_, i) => (
                  <span key={i} className={'tile' + (i === 27 ? (commit ? ' l3 t-pop' : '') : [0, 2, 1, 0, 3, 1, 2, 0, 1, 4, 2, 1, 0, 2, 3, 1, 1, 2, 0, 3, 2, 1, 4, 2, 1, 3, 2][i] ? ' l' + [0, 2, 1, 0, 3, 1, 2, 0, 1, 4, 2, 1, 0, 2, 3, 1, 1, 2, 0, 3, 2, 1, 4, 2, 1, 3, 2][i] : '')} />
                ))}
              </div>
            </div>
            {commit ? (
              <Reward>Quadrado verde! Todo dia um, inclusive fim de semana.</Reward>
            ) : (
              <button type="button" className="t-dashed t-pulse" onClick={() => setCommit(true)}>
                Fazer o commit de hoje
              </button>
            )}
          </>
        )}

        {step === 'project' && (
          <>
            {eyebrow('projeto da semana')}
            <h1 className="t-rise">
              Um projeto por semana<em>.</em>
            </h1>
            <p className="t-lead t-rise2">Pequeno, do começo ao fim. É ele que vira assunto no seu LinkedIn e mostra o que você sabe fazer.</p>
            <div className="card t-rise3">
              {[
                ['Segunda', 'Escolha um projeto que caiba em uma semana.'],
                ['Domingo', 'Entregue. Feito é melhor que perfeito.'],
                ['Segunda de manhã', 'Conte no LinkedIn o que você construiu.'],
              ].map(([when, what], i) => (
                <div key={when} className="row">
                  <span className="t-num">{i + 1}</span>
                  <span className="txt">
                    <span>{when}</span>
                    <small>{what}</small>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 'mentor' && (
          <>
            {eyebrow('você não está só')}
            <h1 className="t-rise">
              Seu mentor caminha junto<em>.</em>
            </h1>
            <p className="t-lead t-rise2">Ele vê o seu progresso, escolhe o foco da semana e aparece no WhatsApp para dar aquela força.</p>
            <div className="t-bubble card t-rise2">
              <span className="mono">{mentor}, seu mentor</span>
              Oi, {name}! Vi que você começou hoje. Que orgulho. Conte comigo!
            </div>
            <div className="t-bubble me t-rise3">Obrigado! Bora, um pouco por dia.</div>
            <blockquote className="word t-rise3" style={{ marginTop: 'auto' }}>
              <span className="mono t-word-label">E todo dia, uma palavra para animar</span>
              <p>{word.text}</p>
              {word.ref && <cite>{word.ref}</cite>}
            </blockquote>
          </>
        )}

        {step === 'badge' && (
          <>
            <Confetti />
            <svg className="t-pop" width="150" height="150" viewBox="0 0 120 120" role="img" aria-label="Selo Primeiro passo">
              <path d="M44 70 34 112l26-12 26 12-10-42" fill="var(--card-2)" stroke="var(--line-2)" strokeWidth="3" strokeLinejoin="round" />
              <circle cx="60" cy="48" r="38" fill="var(--card)" stroke="var(--sun)" strokeWidth="4" />
              <circle cx="60" cy="48" r="29" fill="none" stroke="var(--line-2)" strokeWidth="2" strokeDasharray="3 5" />
              <path d="M46 49l10 10 19-21" fill="none" stroke="var(--sun-2)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="eyebrow t-rise">selo conquistado</span>
            <h1 className="t-rise2">
              Primeiro passo<em>.</em>
            </h1>
            <p className="t-lead t-rise3">
              Você fechou o passeio com <strong style={{ color: 'var(--sun-2)' }}>{points} pontos</strong>. Agora é de verdade, {name}: bora fazer o seu primeiro dia?
            </p>
          </>
        )}
      </div>

      <div className="tour-foot">
        {step === 'badge' ? (
          <button type="button" className="btn t-cta t-pop" disabled={busy} onClick={finish}>
            {busy ? 'Abrindo…' : 'Começar meu primeiro dia'}
          </button>
        ) : taskDone ? (
          <button type="button" className="btn t-cta t-pop" key={'n' + idx} onClick={() => setIdx(idx + 1)}>
            {step === 'welcome' ? 'Vamos lá' : step === 'method' ? 'Entendi, bora' : idx === last - 1 ? 'Ver meu selo' : 'Próximo'}
          </button>
        ) : (
          <button type="button" className="ghost t-cta" onClick={() => setIdx(idx + 1)}>
            Continuar sem experimentar
          </button>
        )}
        {idx > 0 && idx < last && (
          <button type="button" className="t-link" onClick={() => setIdx(idx - 1)}>
            Voltar
          </button>
        )}
      </div>
    </main>
  );
}
