"use client";

import type { GrupoCarrinho } from "@/lib/carrinho";
import { linkWhatsapp, montarMensagemPedido } from "@/lib/whatsapp";

type Props = {
  grupo: GrupoCarrinho;
  aoClicar?: (grupo: GrupoCarrinho) => void;
  aoEnviar?: (grupo: GrupoCarrinho) => void;
};

export function BotaoComprarWhatsapp({ grupo, aoClicar, aoEnviar }: Props) {
  function comprar() {
    aoClicar?.(grupo);
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
