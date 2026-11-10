"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, MessageSquare, RefreshCw, Send } from "lucide-react";
import { PrioridadeBadge, StatusBadge, STATUS_LABEL } from "@/components/badges";
import { CampoSelect } from "@/components/campo-select";
import { Campo, FormDialog } from "@/components/form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatarData, patch, post } from "@/lib/api";
import { STATUS, type ChamadoDetalhado, type Usuario } from "@/lib/types";
import { useApi } from "@/lib/use-api";

export default function ChamadoPage() {
  const { id } = useParams<{ id: string }>();
  const chamado = useApi<ChamadoDetalhado>(`/chamados/${id}`);
  const usuarios = useApi<Usuario[]>("/usuarios");

  const [autorId, setAutorId] = useState("");
  const [comentario, setComentario] = useState("");
  const [erroComentario, setErroComentario] = useState<string | null>(null);

  const opcoesUsuarios = (usuarios.dados ?? []).map((u) => ({ value: String(u.id), label: u.nome }));
  const opcoesAtendentes = (usuarios.dados ?? [])
    .filter((u) => u.papel === "ATENDENTE")
    .map((u) => ({ value: String(u.id), label: u.nome }));

  async function atualizarStatus(dados: FormData) {
    const atendenteId = dados.get("atendenteId");
    const solucao = String(dados.get("solucao") ?? "").trim();
    const texto = String(dados.get("comentario") ?? "").trim();
    await patch(`/chamados/${id}/status`, {
      status: dados.get("status"),
      ...(atendenteId && atendenteId !== "MANTER" ? { atendenteId: Number(atendenteId) } : {}),
      ...(solucao ? { solucao } : {}),
      ...(texto ? { comentario: texto } : {}),
    });
    chamado.recarregar();
  }

  async function comentar(evento: FormEvent) {
    evento.preventDefault();
    setErroComentario(null);
    try {
      await post(`/chamados/${id}/comentarios`, { autorId: Number(autorId), conteudo: comentario });
      setComentario("");
      chamado.recarregar();
    } catch (e) {
      setErroComentario((e as Error).message);
    }
  }

  if (chamado.erro) return <p className="text-sm text-destructive">{chamado.erro}</p>;
  if (!chamado.dados) return <p className="text-sm text-muted-foreground">Carregando...</p>;

  const c = chamado.dados;

  return (
    <div className="grid gap-4">
      <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Voltar para chamados
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Chamado #{c.id}</p>
          <h1 className="text-2xl font-semibold">{c.titulo}</h1>
        </div>

        <FormDialog
          titulo="Alterar status"
          descricao="Ao marcar como Resolvido, a solução é obrigatória. Chamados fechados não podem mudar de status."
          onSubmit={atualizarStatus}
          gatilho={
            <Button disabled={c.status === "FECHADO"}>
              <RefreshCw /> Alterar status
            </Button>
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <Campo label="Novo status">
              <CampoSelect
                name="status"
                defaultValue={c.status}
                opcoes={STATUS.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
              />
            </Campo>
            <Campo label="Atendente">
              <CampoSelect
                name="atendenteId"
                defaultValue="MANTER"
                opcoes={[{ value: "MANTER", label: "Manter atual" }, ...opcoesAtendentes]}
              />
            </Campo>
          </div>
          <Campo label="Solução">
            <Textarea name="solucao" rows={3} defaultValue={c.solucao ?? ""} />
          </Campo>
          <Campo label="Comentário (opcional)">
            <Textarea name="comentario" rows={2} />
          </Campo>
        </FormDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="whitespace-pre-wrap">{c.descricao}</p>
            {c.solucao && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="mb-1 text-sm font-medium text-green-800">Solução</p>
                <p className="whitespace-pre-wrap text-sm">{c.solucao}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <Info label="Status">
              <StatusBadge status={c.status} />
            </Info>
            <Info label="Prioridade">
              <PrioridadeBadge prioridade={c.prioridade} />
            </Info>
            <Info label="Categoria">{c.categoria.nome}</Info>
            <Info label="Solicitante">{c.solicitante.nome}</Info>
            <Info label="Atendente">{c.atendente?.nome ?? "—"}</Info>
            <Info label="Criado em">{formatarData(c.criadoEm)}</Info>
            {c.resolvidoEm && <Info label="Resolvido em">{formatarData(c.resolvidoEm)}</Info>}
            {c.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {c.tags.map(({ tag }) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.nome}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="size-4" /> Comentários ({c.comentarios.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {c.comentarios.map((com) => (
            <div key={com.id} className="rounded-lg border bg-background p-3">
              <p className="mb-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{com.autor.nome}</span> · {formatarData(com.criadoEm)}
              </p>
              <p className="whitespace-pre-wrap text-sm">{com.conteudo}</p>
            </div>
          ))}

          <form onSubmit={comentar} className="grid gap-2 border-t pt-4">
            <div className="flex gap-2">
              <CampoSelect
                className="w-56"
                placeholder="Autor do comentário"
                value={autorId}
                onChange={setAutorId}
                opcoes={opcoesUsuarios}
              />
            </div>
            <Textarea
              placeholder="Escreva um comentário..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
            />
            {erroComentario && <p className="text-sm text-destructive">{erroComentario}</p>}
            <Button type="submit" className="justify-self-end" disabled={!autorId || !comentario.trim()}>
              <Send /> Comentar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span>{children}</span>
    </div>
  );
}
