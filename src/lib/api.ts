// Cliente HTTP mínimo. As chamadas vão para "/api/*", que o Next.js
// redireciona para o backend Express (ver rewrites em next.config.ts).

interface ErroApi {
  erro?: string;
  detalhes?: { campo: string; mensagem: string }[];
}

export async function api<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const resposta = await fetch(`/api${caminho}`, {
    ...opcoes,
    headers: { "Content-Type": "application/json", ...opcoes.headers },
  });

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const erro = corpo as ErroApi | null;
    const detalhes = erro?.detalhes?.map((d) => d.mensagem).join(" ");
    throw new Error([erro?.erro ?? `Erro ${resposta.status}`, detalhes].filter(Boolean).join(" "));
  }

  return corpo as T;
}

export const post = <T>(caminho: string, dados: unknown) =>
  api<T>(caminho, { method: "POST", body: JSON.stringify(dados) });

export const patch = <T>(caminho: string, dados: unknown) =>
  api<T>(caminho, { method: "PATCH", body: JSON.stringify(dados) });

export const formatarData = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

