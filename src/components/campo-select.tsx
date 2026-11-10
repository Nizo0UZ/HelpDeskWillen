"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface Opcao {
  value: string;
  label: string;
}

interface CampoSelectProps {
  opcoes: Opcao[];
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (valor: string) => void;
  placeholder?: string;
  className?: string;
}

// Wrapper do Select do shadcn/ui: recebe uma lista simples de opções.
// Com `name`, o valor é enviado normalmente dentro de um <form> (FormData).
export function CampoSelect({ opcoes, name, value, defaultValue, onChange, placeholder, className }: CampoSelectProps) {
  const rotulos = Object.fromEntries(opcoes.map((o) => [o.value, o.label]));

  return (
    <Select
      name={name}
      items={rotulos}
      value={value === "" ? null : value}
      defaultValue={defaultValue}
      onValueChange={(v) => onChange?.(String(v ?? ""))}
    >
      <SelectTrigger className={className ?? "w-full"}>
        <SelectValue placeholder={placeholder ?? "Selecione..."} />
      </SelectTrigger>
      <SelectContent>
        {opcoes.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
