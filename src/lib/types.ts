// Tipos espelhando as respostas JSON do backend (Prisma serializa datas como string ISO).

export type PapelUsuario = "SOLICITANTE" | "ATENDENTE" | "ADMIN";
export type StatusChamado = "ABERTO" | "EM_ANDAMENTO" | "AGUARDANDO" | "RESOLVIDO" | "FECHADO";
export type PrioridadeChamado = "BAIXA" | "MEDIA" | "ALTA" | "URGENTE";

export const STATUS: StatusChamado[] = ["ABERTO", "EM_ANDAMENTO", "AGUARDANDO", "RESOLVIDO", "FECHADO"];
export const PRIORIDADES: PrioridadeChamado[] = ["BAIXA", "MEDIA", "ALTA", "URGENTE"];
export const PAPEIS: PapelUsuario[] = ["SOLICITANTE", "ATENDENTE", "ADMIN"];

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: PapelUsuario;
  ativo: boolean;
  criadoEm: string;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao: string | null;
  ativa: boolean;
  criadoEm: string;
}

export interface Chamado {
  id: number;
  titulo: string;
  descricao: string;
  status: StatusChamado;
  prioridade: PrioridadeChamado;
  solucao: string | null;
  resolvidoEm: string | null;
  criadoEm: string;
  atualizadoEm: string;
  categoriaId: number;
  solicitanteId: number;
  atendenteId: number | null;
}

export interface Comentario {
  id: number;
  conteudo: string;
  criadoEm: string;
  autorId: number;
  autor: Usuario;
}

export interface ChamadoDetalhado extends Chamado {
  categoria: Categoria;
  solicitante: Usuario;
  atendente: Usuario | null;
  comentarios: Comentario[];
  tags: { tag: { id: number; nome: string } }[];
}

export interface ListaChamados {
  dados: Chamado[];
  paginacao: { pagina: number; limite: number; total: number; totalPaginas: number };
}

export interface Artigo {
  id: number;
  titulo: string;
  conteudo: string;
  autorId: number;
  categoriaId: number;
  criadoEm: string;
}

export interface ResultadoBuscaTexto {
  total: number;
  tempoMs: number;
  resultados: {
    id: number;
    score: number;
    documento: { titulo: string; descricao: string; status?: StatusChamado; categoriaNome?: string };
    highlight: { titulo?: string[]; descricao?: string[]; solucao?: string[] };
  }[];
}

export interface ResultadoBuscaSemantica {
  total: number;
  resultados: {
    id: number;
    similaridade: number;
    chamado: { id: number; titulo: string; descricao: string; status: StatusChamado; categoriaNome: string } | null;
    artigo: { id: number; titulo: string; conteudo: string; categoriaNome: string } | null;
  }[];
}

export interface RespostaRag {
  respostaSugerida: string;
  chamadosCitadosIds: number[];
  artigosCitadosIds: number[];
  totalContextos: number;
}

