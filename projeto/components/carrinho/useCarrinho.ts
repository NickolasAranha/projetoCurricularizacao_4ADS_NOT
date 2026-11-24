"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  adicionarItem,
  alterarQuantidade,
  removerArtesao,
  type ItemCarrinho,
} from "@/lib/carrinho";

const CHAVE = "catalogo:carrinho:v1";
const EVENTO = "catalogo:carrinho";
const VAZIO: ItemCarrinho[] = [];

let cacheBruto: string | null = null;
let cacheItens: ItemCarrinho[] = VAZIO;

function ler(): ItemCarrinho[] {
  const bruto = localStorage.getItem(CHAVE);
  if (bruto === cacheBruto) return cacheItens;
  cacheBruto = bruto;
  try {
    const lista = bruto ? JSON.parse(bruto) : [];
    cacheItens = Array.isArray(lista) ? lista : VAZIO;
  } catch {
    cacheItens = VAZIO;
  }
  return cacheItens;
}

function gravar(itens: ItemCarrinho[]) {
  localStorage.setItem(CHAVE, JSON.stringify(itens));
  window.dispatchEvent(new Event(EVENTO));
}

function assinar(aviso: () => void) {
  window.addEventListener(EVENTO, aviso);
  window.addEventListener("storage", aviso);
  return () => {
    window.removeEventListener(EVENTO, aviso);
    window.removeEventListener("storage", aviso);
  };
}

export function useCarrinho() {
  const itens = useSyncExternalStore(assinar, ler, () => VAZIO);

  const adicionar = useCallback((item: ItemCarrinho) => gravar(adicionarItem(ler(), item)), []);
  const mudarQuantidade = useCallback(
    (produtoId: string, quantidade: number) => gravar(alterarQuantidade(ler(), produtoId, quantidade)),
    [],
  );
  const esvaziarArtesao = useCallback((artesaoId: string) => gravar(removerArtesao(ler(), artesaoId)), []);
  const atualizar = useCallback((transformar: (atuais: ItemCarrinho[]) => ItemCarrinho[]) => {
    const atuais = ler();
    const novos = transformar(atuais);
    if (novos !== atuais) gravar(novos);
  }, []);

  const totalItens = itens.reduce((soma, i) => soma + i.quantidade, 0);

  return { itens, totalItens, adicionar, mudarQuantidade, esvaziarArtesao, atualizar };
}
