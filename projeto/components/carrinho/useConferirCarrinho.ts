"use client";

import { useEffect, useRef } from "react";
import { criarClienteNavegador } from "@/lib/supabase/navegador";
import { reconciliarCarrinho, type DadosAtuais, type ItemCarrinho } from "@/lib/carrinho";

type Linha = {
  id: string;
  titulo: string | null;
  preco_centavos: number | null;
  produto_fotos: { storage_path: string; ordem: number }[] | null;
  artesao: { id: string; slug: string; nome_exibicao: string; whatsapp: string } | null;
};

// Confere o carrinho com o que está publicado agora: preço, título, foto e WhatsApp atuais;
// produtos que saíram do ar são retirados. Em falha de rede, o carrinho fica como está.
export function useConferirCarrinho(
  itens: ItemCarrinho[],
  atualizar: (transformar: (atuais: ItemCarrinho[]) => ItemCarrinho[]) => void,
) {
  const conferidos = useRef("");
  const ids = itens.map((i) => i.produtoId).sort().join(",");

  useEffect(() => {
    if (!ids || conferidos.current === ids) return;
    conferidos.current = ids;
    criarClienteNavegador()
      .from("produtos")
      .select(
        "id, titulo, preco_centavos, produto_fotos(storage_path, ordem), artesao:artesaos(id, slug, nome_exibicao, whatsapp)",
      )
      .in("id", ids.split(","))
      .eq("status", "publicado")
      .then(({ data, error }) => {
        if (error || !data) return;
        const atuais = new Map<string, DadosAtuais>();
        for (const linha of data as unknown as Linha[]) {
          if (!linha.titulo || !linha.preco_centavos || !linha.artesao) continue;
          const capa = [...(linha.produto_fotos ?? [])].sort((a, b) => a.ordem - b.ordem)[0]?.storage_path ?? null;
          atuais.set(linha.id, {
            titulo: linha.titulo,
            precoCentavos: linha.preco_centavos,
            capa,
            artesao: {
              id: linha.artesao.id,
              slug: linha.artesao.slug,
              nome: linha.artesao.nome_exibicao,
              whatsapp: linha.artesao.whatsapp,
            },
          });
        }
        atualizar((lista) => reconciliarCarrinho(lista, atuais));
      });
  }, [ids, atualizar]);
}
