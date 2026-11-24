"use client";

import { useEffect } from "react";
import { registrarEvento } from "@/lib/eventos";
import type { TipoEvento } from "@/lib/tipos";

type Props = { tipo: Exclude<TipoEvento, "clique_whatsapp">; artesaoId?: string; produtoId?: string };

export function RegistrarVisita({ tipo, artesaoId, produtoId }: Props) {
  useEffect(() => {
    registrarEvento({ tipo, artesaoId, produtoId });
  }, [tipo, artesaoId, produtoId]);
  return null;
}
