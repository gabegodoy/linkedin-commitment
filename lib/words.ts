export type Word = { text: string; ref?: string };

/** Versículos curtos (tradução Almeida) e frases de incentivo. Um por dia, em rodízio. */
export const WORDS: Word[] = [
  { text: 'Tudo posso naquele que me fortalece.', ref: 'Filipenses 4:13' },
  { text: 'Constância vence talento quando o talento não tem constância.' },
  { text: 'Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.', ref: 'Salmos 37:5' },
  { text: 'Um pouco por dia vira muito em um mês.' },
  { text: 'E não nos cansemos de fazer o bem, porque a seu tempo ceifaremos, se não houvermos desfalecido.', ref: 'Gálatas 6:9' },
  { text: 'Você não precisa fazer tudo hoje. Precisa fazer o de hoje.' },
  { text: 'Confia ao Senhor as tuas obras, e teus pensamentos serão estabelecidos.', ref: 'Provérbios 16:3' },
  { text: 'Quem aparece todo dia é lembrado na hora da vaga.' },
  { text: 'Esforça-te, e tem bom ânimo; não temas, nem te espantes, porque o Senhor, teu Deus, é contigo.', ref: 'Josué 1:9' },
  { text: 'Cada conexão de hoje é uma porta que pode se abrir amanhã.' },
  { text: 'Os que esperam no Senhor renovarão as suas forças.', ref: 'Isaías 40:31' },
  { text: 'O que parece pequeno hoje é o alicerce do que vem depois.' },
  { text: 'E tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor e não aos homens.', ref: 'Colossenses 3:23' },
  { text: 'Feito é melhor que perfeito. Marque o primeiro quadrado.' },
  { text: 'Pedi, e dar-se-vos-á; buscai e encontrareis; batei, e abrir-se-vos-á.', ref: 'Mateus 7:7' },
  { text: 'Seu perfil trabalha por você enquanto você descansa. Cuide dele.' },
  { text: 'Quem é fiel no mínimo também é fiel no muito.', ref: 'Lucas 16:10' },
  { text: 'Dia difícil também conta. Faça o que der e volte amanhã.' },
  { text: 'Em todo trabalho há proveito.', ref: 'Provérbios 14:23' },
  { text: 'Ninguém colhe no dia em que planta. Continue plantando.' },
  { text: 'Tudo quanto te vier à mão para fazer, faze-o conforme as tuas forças.', ref: 'Eclesiastes 9:10' },
  { text: 'O Senhor é o meu pastor; nada me faltará.', ref: 'Salmos 23:1' },
  { text: 'Pois quem despreza o dia das coisas pequenas?', ref: 'Zacarias 4:10' },
  { text: 'A mão dos diligentes dominará.', ref: 'Provérbios 12:24' },
];

export function wordOfDay(iso: string): Word {
  const days = Math.floor(Date.parse(iso + 'T00:00:00Z') / 86400000);
  return WORDS[((days % WORDS.length) + WORDS.length) % WORDS.length];
}

export const CHEERS = {
  dayDone: 'Dia completo! Você cumpriu o combinado de hoje. Descanse com a consciência tranquila.',
  dayStart: 'Comece pelo mais fácil. Um quadrado marcado já muda o dia.',
  dayHalf: 'Você já começou, e começar é a parte mais difícil. Falta pouco.',
  weekDone: 'Semana do checklist fechada! Seu perfil está melhor do que estava na segunda.',
  milestone: (n: number) => `${n} dias seguidos! Isso é constância de verdade. Parabéns!`,
};
