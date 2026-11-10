"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PrioridadeBadge, PRIORIDADE_LABEL, StatusBadge, STATUS_LABEL } from "@/components/badges";
import { CampoSelect } from "@/components/campo-select";
import { Campo, FormDialog } from "@/components/form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatarData, post } from "@/lib/api";
import { PRIORIDADES, STATUS, type Categoria, type ListaChamados, type Usuario } from "@/lib/types";
import { useApi } from "@/lib/use-api";

const TODOS = "TODOS";

export default function ChamadosPage() {
  const [status, setStatus] = useState(TODOS);
  const [prioridade, setPrioridade] = useState(TODOS);
  const [categoriaId, setCategoriaId] = useState(TODOS);
  const [pagina, setPagina] = useState(1);

  const filtros = new URLSearchParams({ pagina: String(pagina), limite: "10" });
  if (status !== TODOS) filtros.set("status", status);
  if (prioridade !== TODOS) filtros.set("prioridade", prioridade);
  if (categoriaId !== TODOS) filtros.set("categoriaId", categoriaId);

  const chamados = useApi<ListaChamados>(`/chamados?${filtros}`);
  const categorias = useApi<Categoria[]>("/categorias");
  const usuarios = useApi<Usuario[]>("/usuarios");

  const nomeCategoria = (id: number) => categorias.dados?.find((c) => c.id === id)?.nome ?? `#${id}`;
  const nomeUsuario = (id: number) => usuarios.dados?.find((u) => u.id === id)?.nome ?? `#${id}`;

  // Ao trocar um filtro, volta para a primeira página.
  const filtrar = (definir: (v: string) => void) => (valor: string) => {
    definir(valor);
    setPagina(1);
  };

  async function criarChamado(dados: FormData) {
    const atendenteId = dados.get("atendenteId");
    await post("/chamados", {
      titulo: dados.get("titulo"),
      descricao: dados.get("descricao"),
      categoriaId: Number(dados.get("categoriaId")),
      solicitanteId: Number(dados.get("solicitanteId")),
      atendenteId: atendenteId && atendenteId !== "NENHUM" ? Number(atendenteId) : null,
      prioridade: dados.get("prioridade"),
    });
    chamados.recarregar();
  }

  const opcoesCategorias = (categorias.dados ?? []).map((c) => ({ value: String(c.id), label: c.nome }));
  const opcoesUsuarios = (usuarios.dados ?? []).map((u) => ({ value: String(u.id), label: u.nome }));
  const opcoesAtendentes = (usuarios.dados ?? [])
    .filter((u) => u.papel === "ATENDENTE")
    .map((u) => ({ value: String(u.id), label: u.nome }));

  const paginacao = chamados.dados?.paginacao;

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chamados</h1>

        <FormDialog
          titulo="Novo chamado"
          descricao="O backend gera o embedding do chamado na criação (requer GEMINI_API_KEY)."
          onSubmit={criarChamado}
          gatilho={
            <Button>
              <Plus /> Novo chamado
            </Button>
          }
        >
          <Campo label="Título">
            <Input name="titulo" required />
          </Campo>
          <Campo label="Descrição">
            <Textarea name="descricao" rows={4} required />
          </Campo>
          <div className="grid grid-cols-2 gap-4">
            <Campo label="Categoria">
              <CampoSelect name="categoriaId" opcoes={opcoesCategorias} />
            </Campo>
            <Campo label="Prioridade">
              <CampoSelect
                name="prioridade"
                defaultValue="MEDIA"
                opcoes={PRIORIDADES.map((p) => ({ value: p, label: PRIORIDADE_LABEL[p] }))}
              />
            </Campo>
            <Campo label="Solicitante">
              <CampoSelect name="solicitanteId" opcoes={opcoesUsuarios} />
            </Campo>
            <Campo label="Atendente (opcional)">
              <CampoSelect
                name="atendenteId"
                defaultValue="NENHUM"
                opcoes={[{ value: "NENHUM", label: "Nenhum" }, ...opcoesAtendentes]}
              />
            </Campo>
          </div>
        </FormDialog>
      </div>

      <div className="flex flex-wrap gap-2">
        <CampoSelect
          className="w-44"
          value={status}
          onChange={filtrar(setStatus)}
          opcoes={[{ value: TODOS, label: "Todos os status" }, ...STATUS.map((s) => ({ value: s, label: STATUS_LABEL[s] }))]}
        />
        <CampoSelect
          className="w-44"
          value={prioridade}
          onChange={filtrar(setPrioridade)}
          opcoes={[
            { value: TODOS, label: "Todas as prioridades" },
            ...PRIORIDADES.map((p) => ({ value: p, label: PRIORIDADE_LABEL[p] })),
          ]}
        />
        <CampoSelect
          className="w-44"
          value={categoriaId}
          onChange={filtrar(setCategoriaId)}
          opcoes={[{ value: TODOS, label: "Todas as categorias" }, ...opcoesCategorias]}
        />
      </div>

      {chamados.erro && <p className="text-sm text-destructive">{chamados.erro}</p>}

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 pl-4">#</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chamados.dados?.dados.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="pl-4 text-muted-foreground">{c.id}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    <Link href={`/chamados/${c.id}`} className="font-medium hover:underline">
                      {c.titulo}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                  <TableCell>
                    <PrioridadeBadge prioridade={c.prioridade} />
                  </TableCell>
                  <TableCell>{nomeCategoria(c.categoriaId)}</TableCell>
                  <TableCell>{nomeUsuario(c.solicitanteId)}</TableCell>
                  <TableCell>{formatarData(c.criadoEm)}</TableCell>
                </TableRow>
              ))}
              {chamados.dados?.dados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Nenhum chamado encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {paginacao && (
        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
          <span>
            Página {paginacao.pagina} de {Math.max(1, paginacao.totalPaginas)} · {paginacao.total} chamados
          </span>
          <Button variant="outline" size="icon" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={pagina >= paginacao.totalPaginas}
            onClick={() => setPagina(pagina + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
}
