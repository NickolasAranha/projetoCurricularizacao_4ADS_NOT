"use client";

import type { GrupoCarrinho } from "@/lib/carrinho";
import { registrarEvento } from "@/lib/eventos";
import { linkWhatsapp, montarMensagemPedido } from "@/lib/whatsapp";

type Props = {
  grupo: GrupoCarrinho;
  aoEnviar?: (grupo: GrupoCarrinho) => void;
};

export function BotaoComprarWhatsapp({ grupo, aoEnviar }: Props) {
  function comprar() {
    registrarEvento({
      tipo: "clique_whatsapp",
      artesaoId: grupo.artesao.id,
      produtoId: grupo.itens.length === 1 ? grupo.itens[0].produtoId : undefined,
      valorCentavos: grupo.totalCentavos,
    });
    const link = linkWhatsapp(grupo.artesao.whatsapp, montarMensagemPedido(grupo));
    aoEnviar?.(grupo);
    window.location.href = link;
  }

  return (
    <button type="button" onClick={comprar} className="botao-primario botao-whatsapp">
      Comprar no WhatsApp
    </button>
  );
}
