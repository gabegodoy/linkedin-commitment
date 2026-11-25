import Image from 'next/image';
import Link from 'next/link';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

const LINKEDIN = 'https://www.linkedin.com/in/gabrielgodoy-dev/';

const Check = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--sun)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function Head({ no, label, children, lead }: { no: string; label: string; children: React.ReactNode; lead?: string }) {
  return (
    <div className="lp-head">
      <span className="lp-kicker mono">
        {no} — {label}
      </span>
      <h2>{children}</h2>
      {lead && <p className="lp-lead">{lead}</p>}
    </div>
  );
}

const TIMELINE: [string, string, string][] = [
  ['2023–2025', 'De front-end a full stack', 'Nexum Tecnology, no produto interno da empresa.'],
  ['2025', 'Desenvolvedor full stack sênior', 'Front-end e back-end de ponta a ponta.'],
  ['hoje', 'Tech Lead', 'Liderando time e arquitetura, com experiência em plataformas com IA nas áreas jurídica e de saúde.'],
];
const TILES = [1, 3, 0, 2, 4, 1, 2, 3, 1, 0, 2, 4, 3, 2];

export function Landing() {
  return (
    <div className="lp">
      <header className="lp-nav">
        <div className="lp-in lp-nav-in">
          <span className="brand">
            <b>
              compromisso<i>.</i>
            </b>
          </span>
          <nav aria-label="Seções">
            <a href="#metodo">O método</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#mentor">O mentor</a>
            <ThemeToggle />
            <Link href="/login" className="ghost sm">
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      <section className="lp-hero">
        <div className="lp-in lp-hero-in">
          <div className="lp-hero-txt">
            <span className="eyebrow">mentoria de linkedin · gratuita</span>
            <h1>
              Um pouco por dia, todo dia<em>.</em>
            </h1>
            <p className="lp-lead">O Compromisso é onde quem faz mentoria de LinkedIn comigo acompanha as metas do dia e arruma o perfil, item por item, até o recrutador chegar.</p>
            <div className="actions">
              <a href="#participar" className="btn">
                Quero participar
              </a>
              <Link href="/login" className="ghost">
                Já tenho acesso
              </Link>
            </div>
            <p className="lp-small">Não tem plano, mensalidade nem cadastro aberto. Cada pessoa entra pela mão do mentor.</p>
          </div>
          <div className="lp-phone" role="img" aria-label="Exemplo da tela de metas do dia">
            <div className="lp-phone-top">
              <span className="brand">
                <b>
                  compromisso<i>.</i>
                </b>
              </span>
              <span className="mono">3 dias seguidos</span>
            </div>
            <div className="lp-phone-h mono">
              <span>Metas de hoje</span>
              <span>7 de 10 feitas</span>
            </div>
            <div className="card">
              {(
                [
                  ['Novas conexões', 4, 4],
                  ['Curtidas', 2, 3],
                  ['Comentários', 1, 2],
                ] as const
              ).map(([label, done, total]) => (
                <div key={label} className="goal">
                  <div className="top">
                    <span>{label}</span>
                    <span style={done >= total ? { color: 'var(--sun-2)' } : undefined}>
                      {done} de {total}
                    </span>
                  </div>
                  <div className="boxes">
                    {Array.from({ length: total }, (_, i) => (
                      <span key={i} className={'box lp-box' + (i < done ? ' on' : '')}>
                        {i < done ? <Check /> : null}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="lp-week">
              {['full', 'full', 'part', '', '', '', ''].map((c, i) => (
                <i key={i} className={c} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="lp-sec">
        <div className="lp-in lp-three">
          <div>
            <b>
              É gratuito<em>.</em>
            </b>
            <span>Não é um produto à venda. É a ferramenta que eu uso para acompanhar quem eu ajudo.</span>
          </div>
          <div>
            <b>
              É por convite<em>.</em>
            </b>
            <span>Só o mentor cria contas. Assim cada pessoa que entra tem alguém olhando o progresso dela de verdade.</span>
          </div>
          <div>
            <b>
              É simples<em>.</em>
            </b>
            <span>Abre no celular, com um toque. Feito para quem não tem intimidade com computador.</span>
          </div>
        </div>
      </section>

      <section id="metodo" className="lp-sec">
        <div className="lp-in lp-stack">
          <Head no="01" label="o método" lead="A ideia não é mandar currículo para cem vagas. É deixar o perfil tão alinhado com a vaga que você quer, e tão ativo, que o LinkedIn passa a mostrar você para quem contrata.">
            Aqui, o recrutador vem até você<em>.</em>
          </Head>
          <div className="lp-cards">
            <div className="card lp-card">
              <Icon>
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="12" cy="12" r="1.2" fill="var(--sun)" />
              </Icon>
              <b>Nada de sair atirando currículo</b>
              <span>Poucas candidaturas, e certeiras. O trabalho de verdade é no perfil, para ele ser encontrado.</span>
            </div>
            <div className="card lp-card">
              <Icon>
                <path d="M4 19h16" />
                <path d="M5 15l5-5 4 3 5-7" />
                <path d="M15 6h4v4" />
              </Icon>
              <b>Tudo aponta para a vaga que você quer</b>
              <span>Título, resumo, experiências, competências: as mesmas palavras do anúncio. É a ajuda que o algoritmo precisa.</span>
            </div>
            <div className="card lp-card">
              <Icon>
                <circle cx="8" cy="9" r="3" />
                <circle cx="17" cy="10" r="2.4" />
                <path d="M2.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6" />
                <path d="M15 14.6c2.8-.5 5.3.9 6.2 4" />
              </Icon>
              <b>Conexão certa abre porta</b>
              <span>Gente da sua área, convite sempre com uma nota, e conversa nos posts de recrutadores. Perfil ativo é perfil quente.</span>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="lp-sec">
        <div className="lp-in lp-stack">
          <Head no="02" label="como funciona">
            Pequeno o bastante para fazer hoje<em>.</em>
          </Head>
          <div className="lp-cards">
            <div className="card lp-card">
              <div className="lp-4321" aria-hidden="true">
                4<i>·</i>3<i>·</i>2<i>·</i>1
              </div>
              <b>Metas do dia</b>
              <span>4 conexões novas, 3 curtidas, 2 comentários e 1 post. Fez no LinkedIn, tocou no quadrado. O mentor pode ajustar os números para cada pessoa.</span>
            </div>
            <div className="card lp-card">
              <div className="lp-miles" aria-hidden="true">
                <b className="hit">10</b>
                <b>30</b>
                <b>45</b>
                <b>100</b>
              </div>
              <b>Dias seguidos</b>
              <span>Bateu todas as metas, o dia acende. A sequência vira conquista aos 10, 30, 45 e 100 dias. Sábado e domingo não quebram.</span>
            </div>
            <div className="card lp-card">
              <div className="lp-list" aria-hidden="true">
                <span className="done">
                  <i />
                  Foto
                </span>
                <span>
                  <i />
                  Título
                </span>
                <span>
                  <i />
                  Customizar URL
                </span>
              </div>
              <b>Checklist do perfil</b>
              <span>São 33 itens, da foto às recomendações. Você só vê os da semana, com a orientação do mentor em cada um.</span>
            </div>
          </div>
          <div className="lp-cards">
            <div className="card lp-card">
              <span className="lp-tag mono">Para quem é dev</span>
              <div className="lp-tiles" aria-hidden="true">
                {TILES.map((l, i) => (
                  <span key={i} className={'tile' + (l ? ' l' + l : '')} />
                ))}
              </div>
              <b>Código todo dia e projeto da semana</b>
              <span>Os quadradinhos verdes vêm direto do GitHub. E toda semana um projeto pequeno: começa na segunda, entrega no domingo, vira post na segunda seguinte.</span>
            </div>
            <div className="card lp-card">
              <span className="lp-tag mono">Você não está só</span>
              <div className="lp-bubble">Vi que você fechou a semana. Que orgulho! Bora para a próxima?</div>
              <b>Mentor ao lado</b>
              <span>Eu vejo o progresso de cada pessoa, escolho o foco da semana e apareço no WhatsApp quando alguém some.</span>
            </div>
          </div>
        </div>
      </section>

      <section id="mentor" className="lp-sec">
        <div className="lp-in lp-mentor">
          <aside>
            <Image src="/gabriel-godoy.jpg" alt="Gabriel Godoy" width={460} height={460} className="lp-photo" />
            <div>
              <b className="lp-name">Gabriel Godoy</b>
              <span className="lp-small">Tech Lead · Joinville, SC</span>
            </div>
            <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">
              Ver meu perfil no LinkedIn ↗
            </a>
          </aside>
          <div className="lp-stack" style={{ gap: 22 }}>
            <Head no="03" label="o mentor">
              Eu recomecei do zero. E foi o LinkedIn que abriu a porta<em>.</em>
            </Head>
            <p className="lp-lead">Eu fiz graduação em Letras e era professor em um excelente colégio. Em 2022 decidi mudar de área e comecei de novo, do zero. Meses depois consegui meu primeiro emprego como desenvolvedor. A vaga chegou pelo LinkedIn.</p>
            <p className="lp-lead" style={{ color: 'var(--fg)' }}>
              Eu sei como é estar começando. E sei como é recomeçar: deixar para trás uma carreira que você já dominava, voltar a ser iniciante e ter que provar tudo de novo.
            </p>
            <p className="lp-p">De lá para cá virei full stack, cheguei a desenvolvedor sênior e hoje sou Tech Lead. O método do Compromisso não saiu de um livro: é a rotina que eu segui, organizada em passos. Testei primeiro em mim. Agora passo adiante para quem busca a primeira vaga, para quem quer voltar ao mercado e para quem está trocando de carreira, como eu troquei.</p>

            <div className="card lp-time">
              <div className="lp-row">
                <span className="mono">2016–2021</span>
                <div>
                  <b>Letras e sala de aula</b>
                  <small>Graduação em Letras, Português e Inglês, na UTFPR. Presidente do centro acadêmico e professor.</small>
                </div>
              </div>
              <div className="lp-row lp-turn">
                <span className="mono">
                  2022
                  <br />a virada
                </span>
                <div>
                  <b>Recomeço do zero, com método</b>
                  <p>Voltar a ser iniciante assusta. O que me tirou do lugar não foi talento nem sorte: foi rotina. Código todo dia, um projeto por semana, um post toda segunda, e o perfil arrumado item por item.</p>
                  <p className="strong">Meses depois, o primeiro emprego como dev. A vaga veio pelo LinkedIn.</p>
                  <div className="lp-pills">
                    <div>
                      <b className="mono">Método</b>
                      <span>Passos claros, na ordem certa. Sem achismo.</span>
                    </div>
                    <div>
                      <b className="mono">Organização</b>
                      <span>Poucas tarefas por semana, uma de cada vez.</span>
                    </div>
                    <div>
                      <b className="mono">Disciplina</b>
                      <span>Um pouco por dia, todo dia. Mesmo sem vontade.</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lp-row">
                <span className="mono">out. 2022</span>
                <div>
                  <b>Primeiro emprego como dev</b>
                  <small>Web designer e desenvolvedor na 2RS Soluções Web. A vaga veio pelo LinkedIn.</small>
                </div>
              </div>
              {TIMELINE.map(([when, title, text]) => (
                <div key={when} className="lp-row">
                  <span className="mono">{when}</span>
                  <div>
                    <b>{title}</b>
                    <small>{text}</small>
                  </div>
                </div>
              ))}
            </div>

            <figure className="lp-quote">
              <figcaption className="lp-kicker mono">Por que eu faço isso de graça</figcaption>
              <blockquote>
                Não nos cansemos então de fazer o bem, porque a seu tempo viremos a recolher muitas bênçãos, se formos perseverantes<em>.</em>
              </blockquote>
              <cite className="mono">Gálatas 6:9</cite>
            </figure>
          </div>
        </div>
      </section>

      <section id="participar" className="lp-cta">
        <Logo size={72} />
        <h2>
          Quer caminhar junto<em>?</em>
        </h2>
        <p className="lp-lead">Não tem formulário nem cadastro. Me chame no LinkedIn, conte qual vaga você procura, e a gente conversa. Se fizer sentido, eu crio o seu acesso.</p>
        <div className="actions" style={{ justifyContent: 'center' }}>
          <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="btn">
            Falar com o Gabriel no LinkedIn
          </a>
          <Link href="/login" className="ghost">
            Já tenho acesso
          </Link>
        </div>
      </section>

      <footer className="lp-foot">
        <div className="lp-in mono">
          <span>compromisso. · mentoria de linkedin gratuita</span>
          <a href="https://neogen.com.br" target="_blank" rel="noopener noreferrer">
            feito pela neogen.
          </a>
        </div>
      </footer>
    </div>
  );
}
