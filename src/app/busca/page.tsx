"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Bot, Loader2, Search } from "lucide-react";
import { StatusBadge } from "@/components/badges";
import { CampoSelect } from "@/components/campo-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api, post } from "@/lib/api";
import type { RespostaRag, ResultadoBuscaSemantica, ResultadoBuscaTexto, StatusChamado } from "@/lib/types";

// Formato único para exibir resultados das duas buscas.
interface Resultado {
  id: number;
  titulo: string;
  trecho: string;
  status?: StatusChamado;
  categoria?: string;
  pontuacao: string;
}

export default function BuscaPage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Busca</h1>
      <Tabs defaultValue="busca">
        <TabsList>
          <TabsTrigger value="busca">
            <Search /> Buscar chamados
          </TabsTrigger>
          <TabsTrigger value="rag">
            <Bot /> Assistente (RAG)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="busca" className="pt-2">
          <BuscaChamados />
        </TabsContent>
        <TabsContent value="rag" className="pt-2">
          <Assistente />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BuscaChamados() {
  const [termo, setTermo] = useState("");
  const [modo, setModo] = useState("texto");
  const [resultados, setResultados] = useState<Resultado[] | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function buscar(evento: FormEvent) {
    evento.preventDefault();
    setCarregando(true);
    setErro(null);
    try {
      const q = encodeURIComponent(termo);
      if (modo === "texto") {
        const r = await api<ResultadoBuscaTexto>(`/busca/texto?q=${q}&k=10`);
        setResultados(
          r.resultados.map((h) => ({
            id: h.id,
            titulo: h.documento.titulo,
            trecho: h.documento.descricao,
            status: h.documento.status,
            categoria: h.documento.categoriaNome,
            pontuacao: `score ${h.score.toFixed(2)}`,
          }))
        );
      } else {
        const r = await api<ResultadoBuscaSemantica>(`/busca/semantica?q=${q}&k=10`);
        setResultados(
          r.resultados
            .filter((d) => d.chamado)
            .map((d) => ({
              id: d.chamado!.id,
              titulo: d.chamado!.titulo,
              trecho: d.chamado!.descricao,
              status: d.chamado!.status,
              categoria: d.chamado!.categoriaNome,
              pontuacao: `${(d.similaridade * 100).toFixed(0)}% similar`,
            }))
        );
      }
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="grid gap-4">
      <form onSubmit={buscar} className="flex gap-2">
        <Input placeholder="Ex.: impressora não imprime" value={termo} onChange={(e) => setTermo(e.target.value)} />
        <CampoSelect
          className="w-56"
          value={modo}
          onChange={setModo}
          opcoes={[
            { value: "texto", label: "Texto (Elasticsearch)" },
            { value: "semantica", label: "Semântica (pgvector)" },
          ]}
        />
        <Button type="submit" disabled={!termo.trim() || carregando}>
          {carregando ? <Loader2 className="animate-spin" /> : <Search />} Buscar
        </Button>
      </form>

      {erro && <p className="text-sm text-destructive">{erro}</p>}
      {resultados?.length === 0 && <p className="text-sm text-muted-foreground">Nenhum resultado encontrado.</p>}

      {resultados?.map((r) => (
        <Card key={r.id} size="sm">
          <CardContent className="grid gap-1">
            <div className="flex items-center gap-2">
              <Link href={`/chamados/${r.id}`} className="font-medium hover:underline">
                #{r.id} {r.titulo}
              </Link>
              {r.status && <StatusBadge status={r.status} />}
              <span className="ml-auto text-xs text-muted-foreground">{r.pontuacao}</span>
            </div>
            {r.categoria && <p className="text-xs text-muted-foreground">{r.categoria}</p>}
            <p className="line-clamp-2 text-sm">{r.trecho}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Assistente() {
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState<RespostaRag | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function perguntar(evento: FormEvent) {
    evento.preventDefault();
    setCarregando(true);
    setErro(null);
    try {
      setResposta(await post<RespostaRag>("/rag/perguntar", { pergunta }));
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="grid gap-4">
      <form onSubmit={perguntar} className="grid gap-2">
        <Textarea
          placeholder="Descreva o problema. O assistente responde com base em chamados resolvidos e artigos."
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          rows={3}
        />
        <Button type="submit" className="justify-self-end" disabled={!pergunta.trim() || carregando}>
          {carregando ? <Loader2 className="animate-spin" /> : <Bot />} Perguntar
        </Button>
      </form>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      {resposta && (
        <Card>
          <CardHeader>
            <CardTitle>Resposta sugerida</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <p className="whitespace-pre-wrap text-sm">{resposta.respostaSugerida}</p>
            {resposta.chamadosCitadosIds.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Chamados usados como contexto:{" "}
                {resposta.chamadosCitadosIds.map((id) => (
                  <Link key={id} href={`/chamados/${id}`} className="mr-2 text-foreground hover:underline">
                    #{id}
                  </Link>
                ))}
              </p>
            )}
            {resposta.artigosCitadosIds.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Artigos usados como contexto: {resposta.artigosCitadosIds.map((id) => `#${id}`).join(", ")}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

