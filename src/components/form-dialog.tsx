"use client";

import { useState, type FormEvent, type ReactElement, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface FormDialogProps {
  gatilho: ReactElement;
  titulo: string;
  descricao?: string;
  onSubmit: (dados: FormData) => Promise<void>;
  children: ReactNode;
}

// Modal genérico de formulário: abre pelo `gatilho`, envia o FormData para
// `onSubmit`, mostra erros da API e fecha sozinho em caso de sucesso.
export function FormDialog({ gatilho, titulo, descricao, onSubmit, children }: FormDialogProps) {
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      await onSubmit(new FormData(evento.currentTarget));
      setAberto(false);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(abrir) => {
        setAberto(abrir);
        setErro(null);
      }}
    >
      <DialogTrigger render={gatilho} />
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={enviar} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{titulo}</DialogTitle>
            {descricao && <DialogDescription>{descricao}</DialogDescription>}
          </DialogHeader>

          {children}

          {erro && <p className="text-sm text-destructive">{erro}</p>}

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={enviando}>
              {enviando && <Loader2 className="animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Rótulo + campo, para manter os formulários enxutos.
export function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

