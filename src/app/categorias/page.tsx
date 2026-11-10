"use client";

import { Plus } from "lucide-react";
import { Campo, FormDialog } from "@/components/form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { post } from "@/lib/api";
import type { Categoria } from "@/lib/types";
import { useApi } from "@/lib/use-api";

export default function CategoriasPage() {
  const categorias = useApi<Categoria[]>("/categorias");

  async function criarCategoria(dados: FormData) {
    await post("/categorias", {
      nome: dados.get("nome"),
      descricao: dados.get("descricao") || null,
    });
    categorias.recarregar();
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categorias</h1>
        <FormDialog
          titulo="Nova categoria"
          onSubmit={criarCategoria}
          gatilho={
            <Button>
              <Plus /> Nova categoria
            </Button>
          }
        >
          <Campo label="Nome">
            <Input name="nome" required />
          </Campo>
          <Campo label="Descrição (opcional)">
            <Textarea name="descricao" rows={3} />
          </Campo>
        </FormDialog>
      </div>

      {categorias.erro && <p className="text-sm text-destructive">{categorias.erro}</p>}

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 pl-4">#</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.dados?.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="pl-4 text-muted-foreground">{c.id}</TableCell>
                  <TableCell className="font-medium">{c.nome}</TableCell>
                  <TableCell className="max-w-md truncate">{c.descricao ?? "—"}</TableCell>
                  <TableCell>{c.ativa ? "Ativa" : "Inativa"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

