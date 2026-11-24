"use client";

import Link from "next/link";
import { useCarrinho } from "./useCarrinho";

export function LinkCarrinho() {
  const { totalItens } = useCarrinho();
  return (
    <Link href="/carrinho" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
      Carrinho{totalItens > 0 ? ` (${totalItens})` : ""}
    </Link>
  );
}
