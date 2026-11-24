"use client";

import Link from "next/link";
import { agruparPorArtesao } from "@/lib/carrinho";
import { formatarReais } from "@/lib/dinheiro";
import { urlPublicaFoto } from "@/lib/storage";
import { useCarrinho } from "./useCarrinho";
import { BotaoComprarWhatsapp } from "./BotaoComprarWhatsapp";
import { SeletorQuantidade } from "./SeletorQuantidade";

export function ListaCarrinho() {
  const { itens, mudarQuantidade, esvaziarArtesao } = useCarrinho();
  const grupos = agruparPorArtesao(itens);

  if (!grupos.length) {
    return (
      <div className="flex flex-col gap-4">
        <p>Seu carrinho está vazio.</p>
        <Link href="/catalogo" className="botao-primario self-start">
          Ver o catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {grupos.length > 1 && (
        <p>Seus itens são de {grupos.length} artesãos. Cada um recebe o próprio pedido pelo WhatsApp.</p>
      )}
      {grupos.map((grupo) => (
        <section key={grupo.artesao.id} className="flex flex-col gap-4 rounded-lg border border-borda p-4">
          <h2 className="text-xl font-semibold">
            Pedido para <Link href={`/artesao/${grupo.artesao.slug}`} className="underline">{grupo.artesao.nome}</Link>
          </h2>
          <ul className="flex flex-col gap-4">
            {grupo.itens.map((item) => (
              <li key={item.produtoId} className="flex flex-wrap items-center gap-4">
                {item.capa ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={urlPublicaFoto(item.capa)} alt="" className="h-16 w-16 rounded-lg object-cover" />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-borda" />
                )}
                <div className="min-w-0 flex-1">
                  <Link href={`/produto/${item.produtoId}`} className="font-medium">
                    {item.titulo}
                  </Link>
                  <p>{formatarReais(item.precoCentavos)}</p>
                </div>
                <SeletorQuantidade
                  valor={item.quantidade}
                  minimo={0}
                  rotulo={item.titulo}
                  aoMudar={(q) => mudarQuantidade(item.produtoId, q)}
                />
              </li>
            ))}
          </ul>
          <p className="text-lg font-semibold">Total: {formatarReais(grupo.totalCentavos)}</p>
          <BotaoComprarWhatsapp grupo={grupo} aoEnviar={(g) => esvaziarArtesao(g.artesao.id)} />
        </section>
      ))}
    </div>
  );
}
