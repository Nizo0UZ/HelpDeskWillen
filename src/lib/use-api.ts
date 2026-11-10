"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// Busca dados de um endpoint GET ao montar e sempre que `caminho` mudar.
// `recarregar()` refaz a requisição (ex.: após criar um registro).
export function useApi<T>(caminho: string) {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let ativo = true;
    api<T>(caminho)
      .then((resposta) => {
        if (!ativo) return;
        setDados(resposta);
        setErro(null);
      })
      .catch((e: Error) => ativo && setErro(e.message));
    return () => {
      ativo = false;
    };
  }, [caminho, versao]);

  return { dados, erro, recarregar: () => setVersao((v) => v + 1) };
}

