import { Badge } from "@/components/ui/badge";
import type { PrioridadeChamado, StatusChamado } from "@/lib/types";
import { cn } from "@/lib/utils";

export const STATUS_LABEL: Record<StatusChamado, string> = {
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em andamento",
  AGUARDANDO: "Aguardando",
  RESOLVIDO: "Resolvido",
  FECHADO: "Fechado",
};

export const PRIORIDADE_LABEL: Record<PrioridadeChamado, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  URGENTE: "Urgente",
};

const STATUS_COR: Record<StatusChamado, string> = {
  ABERTO: "bg-blue-100 text-blue-800",
  EM_ANDAMENTO: "bg-amber-100 text-amber-800",
  AGUARDANDO: "bg-purple-100 text-purple-800",
  RESOLVIDO: "bg-green-100 text-green-800",
  FECHADO: "bg-zinc-200 text-zinc-700",
};

const PRIORIDADE_COR: Record<PrioridadeChamado, string> = {
  BAIXA: "bg-zinc-100 text-zinc-700",
  MEDIA: "bg-sky-100 text-sky-800",
  ALTA: "bg-orange-100 text-orange-800",
  URGENTE: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: StatusChamado }) {
  return <Badge className={cn(STATUS_COR[status])}>{STATUS_LABEL[status]}</Badge>;
}

export function PrioridadeBadge({ prioridade }: { prioridade: PrioridadeChamado }) {
  return <Badge className={cn(PRIORIDADE_COR[prioridade])}>{PRIORIDADE_LABEL[prioridade]}</Badge>;
}

