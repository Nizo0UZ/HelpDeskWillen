"use client";

import { Plus } from "lucide-react";
import { CampoSelect } from "@/components/campo-select";
import { Campo, FormDialog } from "@/components/form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatarData, post } from "@/lib/api";
import type { Artigo, Categoria, Usuario } from "@/lib/types";
import { useApi } from "@/lib/use-api";

export default function ArtigosPage() {
  const artigos = useApi<Artigo[]>("/artigos");
  const categorias = useApi<Categoria[]>("/categorias");
  const usuarios = useApi<Usuario[]>("/usuarios");

  const nomeCategoria = (id: number) => categorias.dados?.find((c) => c.id === id)?.nome ?? `#${id}`;
  const nomeUsuario = (id: number) => usuarios.dados?.find((u) => u.id === id)?.nome ?? `#${id}`;

  async function criarArtigo(dados: FormData) {
    await post("/artigos", {
      titulo: dados.get("titulo"),
      conteudo: dados.get("conteudo"),
      autorId: Number(dados.get("autorId")),
      categoriaId: Number(dados.get("categoriaId")),
    });
    artigos.recarregar();
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Base de conhecimento</h1>
        <FormDialog
          titulo="Novo artigo"
          onSubmit={criarArtigo}
          gatilho={
            <Button>
              <Plus /> Novo artigo
            </Button>
          }
        >
          <Campo label="Título">
            <Input name="titulo" required />
          </Campo>
          <Campo label="Conteúdo">
            <Textarea name="conteudo" rows={6} required />
          </Campo>
          <div className="grid grid-cols-2 gap-4">
            <Campo label="Autor">
              <CampoSelect
                name="autorId"
                opcoes={(usuarios.dados ?? []).map((u) => ({ value: String(u.id), label: u.nome }))}
              />
            </Campo>
            <Campo label="Categoria">
              <CampoSelect
                name="categoriaId"
                opcoes={(categorias.dados ?? []).map((c) => ({ value: String(c.id), label: c.nome }))}
              />
            </Campo>
          </div>
        </FormDialog>
      </div>

      {artigos.erro && <p className="text-sm text-destructive">{artigos.erro}</p>}
      {artigos.dados?.length === 0 && <p className="text-sm text-muted-foreground">Nenhum artigo cadastrado.</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {artigos.dados?.map((a) => (
          <Card key={a.id}>
            <CardHeader>
              <CardTitle>{a.titulo}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="secondary">{nomeCategoria(a.categoriaId)}</Badge>
                {nomeUsuario(a.autorId)} · {formatarData(a.criadoEm)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-4 whitespace-pre-wrap text-sm">{a.conteudo}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

