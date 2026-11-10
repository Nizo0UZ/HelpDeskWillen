"use client";

import { Plus } from "lucide-react";
import { CampoSelect } from "@/components/campo-select";
import { Campo, FormDialog } from "@/components/form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatarData, post } from "@/lib/api";
import { PAPEIS, type Usuario } from "@/lib/types";
import { useApi } from "@/lib/use-api";

export default function UsuariosPage() {
  const usuarios = useApi<Usuario[]>("/usuarios");

  async function criarUsuario(dados: FormData) {
    await post("/usuarios", {
      nome: dados.get("nome"),
      email: dados.get("email"),
      senha: dados.get("senha"),
      papel: dados.get("papel"),
    });
    usuarios.recarregar();
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Usuários</h1>
        <FormDialog
          titulo="Novo usuário"
          onSubmit={criarUsuario}
          gatilho={
            <Button>
              <Plus /> Novo usuário
            </Button>
          }
        >
          <Campo label="Nome">
            <Input name="nome" required />
          </Campo>
          <Campo label="E-mail">
            <Input name="email" type="email" required />
          </Campo>
          <Campo label="Senha (mín. 6 caracteres)">
            <Input name="senha" type="password" minLength={6} required />
          </Campo>
          <Campo label="Papel">
            <CampoSelect name="papel" defaultValue="SOLICITANTE" opcoes={PAPEIS.map((p) => ({ value: p, label: p }))} />
          </Campo>
        </FormDialog>
      </div>

      {usuarios.erro && <p className="text-sm text-destructive">{usuarios.erro}</p>}

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 pl-4">#</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.dados?.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="pl-4 text-muted-foreground">{u.id}</TableCell>
                  <TableCell className="font-medium">{u.nome}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.papel === "SOLICITANTE" ? "secondary" : "default"}>{u.papel}</Badge>
                  </TableCell>
                  <TableCell>{u.ativo ? "Ativo" : "Inativo"}</TableCell>
                  <TableCell>{formatarData(u.criadoEm)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

