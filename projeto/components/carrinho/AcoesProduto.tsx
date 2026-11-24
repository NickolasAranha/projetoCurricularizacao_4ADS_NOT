"use client";

import { useState } from "react";
import Link from "next/link";
import { agruparPorArtesao, type ItemCarrinho } from "@/lib/carrinho";
import { useCarrinho } from "./useCarrinho";
import { BotaoComprarWhatsapp } from "./BotaoComprarWhatsapp";
import { SeletorQuantidade } from "./SeletorQuantidade";

type Props = { item: Omit<ItemCarrinho, "quantidade"> };

export function AcoesProduto({ item }: Props) {
  const { adicionar } = useCarrinho();
  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);
  const [grupo] = agruparPorArtesao([{ ...item, quantidade }]);

  return (
    <div className="flex flex-col gap-4">
      <SeletorQuantidade valor={quantidade} aoMudar={setQuantidade} rotulo={item.titulo} />
      <BotaoComprarWhatsapp grupo={grupo} />
      <button
        type="button"
        onClick={() => {
          adicionar({ ...item, quantidade });
          setAdicionado(true);
        }}
        className="botao-secundario"
      >
        Adicionar ao carrinho
      </button>
      {adicionado && (
        <p role="status">
          Adicionado. <Link href="/carrinho" className="underline">Ver carrinho</Link>
        </p>
      )}
    </div>
  );
}
