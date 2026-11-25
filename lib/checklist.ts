export type Item = { id: number; title: string; hint: string };
export type Group = { name: string; items: Item[] };

const i = (id: number, title: string, hint: string): Item => ({ id, title, hint });

/** Checklist da Consultoria LinkedIn Estratégico (33 itens). */
export const GROUPS: Group[] = [
  {
    name: 'Perfil',
    items: [
      i(1, 'Imagem de fundo (capa)', 'Capa de 1400x425 ligada à sua área. O pixabay.com tem imagens gratuitas.'),
      i(2, 'Foto', 'Foto nítida, de rosto, com fundo neutro e sorrindo.'),
      i(3, 'Título', 'Usar as palavras da vaga que você procura, separadas por barras.'),
      i(4, 'Resumo', 'Abrir pelo objetivo, incluir números reais e fechar com palavras-chave e contato.'),
      i(5, 'Informações pessoais e de contato', 'Conferir e-mail e telefone no painel de contato.'),
      i(6, 'Customizar URL', 'Trocar a URL automática por uma com o seu nome.'),
      i(7, 'URL no currículo e e-mail', 'Colocar a URL nova no currículo e na assinatura do e-mail.'),
      i(8, 'Sessões do perfil', 'Ativar as seções que faltam, como Destaques e Cursos.'),
      i(9, 'Descrever a experiência', 'Em cada cargo: o que fazia, para quem e um resultado.'),
      i(10, 'Experiência atual (em busca de vaga)', 'Dar um nome descritivo à ocupação atual e explicar o que você faz.'),
      i(11, 'Mídia: documentos, fotos, sites e vídeos', 'Anexar currículo, certificados e trabalhos nos Destaques.'),
      i(12, 'Idiomas', 'Incluir Português como nativo e os demais com o nível real.'),
      i(13, 'Competências técnicas e comportamentais', 'Fixar no topo as três mais importantes para a vaga.'),
      i(14, 'Cursos, projetos e voluntariado', 'Incluir os cursos feitos, projetos e trabalho voluntário.'),
      i(15, 'Formação acadêmica', 'Curso, instituição e período.'),
      i(16, 'Interesses: grupos, empresas e instituições', 'Seguir de 15 a 20 empresas onde você gostaria de trabalhar.'),
      i(17, 'Recomendar competências', 'Recomendar ex-colegas para receber de volta.'),
      i(18, 'Solicitar recomendações 360º', 'Pedir a um ex-gestor, um ex-colega e um cliente.'),
      i(19, 'Fornecer recomendações', 'Escrever uma ou duas para ex-colegas.'),
      i(20, 'Interesses de carreira', 'Ativar o "Open to work" com os cargos que batem com o seu título.'),
      i(21, 'Escrever artigos', 'Um artigo de autoria própria, depois dos primeiros posts.'),
    ],
  },
  {
    name: 'Rede e vagas',
    items: [
      i(22, 'Convites: avaliar para aceitar', 'Aceitar quem é da área, da região ou de RH.'),
      i(23, 'Adicionar conexões simples', 'Começar por quem você já conhece.'),
      i(24, 'Adicionar conexões personalizadas', 'Convite com nota curta para recrutadores e gestores da área.'),
      i(25, 'Vagas: candidatura', 'Candidatar-se toda semana às vagas da área.'),
      i(26, 'Alerta de vagas', 'Criar alertas com os cargos que você procura.'),
    ],
  },
  {
    name: 'Conteúdo e engajamento',
    items: [
      i(27, 'Compartilhar artigos, fotos, vídeos e ideias', 'Primeiro post: apresentação curta com o objetivo profissional.'),
      i(28, 'Utilizar # e seguir #', 'De 3 a 5 hashtags da sua área em cada post.'),
      i(29, 'Curtir, comentar e compartilhar', 'Faz parte das metas diárias.'),
      i(30, 'Notificações diárias', 'Um horário fixo por dia para abrir as notificações.'),
      i(31, 'Interagir com grupos', 'Entrar em dois ou três grupos da área e da região.'),
    ],
  },
  {
    name: 'Monitoramento',
    items: [
      i(32, 'SSI: monitorar', 'Anotar o SSI de hoje como ponto de partida.'),
      i(33, 'Indicadores do perfil: monitorar', 'Anotar visualizações e aparições em buscas toda semana.'),
    ],
  },
];

export const ALL_ITEMS = GROUPS.flatMap((g) => g.items);
export const TOTAL_ITEMS = ALL_ITEMS.length;
