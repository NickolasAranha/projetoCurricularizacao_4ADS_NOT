"use client";

import { useEffect, useState } from "react";

// Frases curtas de propósito: precisam caber numa linha em telas de 320px.
const FRASES = [
  "Olhando as fotos…",
  "Entendendo o produto…",
  "Criando o título…",
  "Escrevendo o texto…",
  "Vendo o preço…",
  "Quase pronto…",
];
const FRASE_PRONTO = "Pronto! Abrindo…";
const SEGUNDOS_POR_FRASE = 6;
const DURACAO_FADE_MS = 350;

// Enche rápido no começo e desacelera; sozinha nunca passa de 90%.
function progressoEstimado(segundos: number) {
  return 2 + 88 * (1 - Math.exp(-segundos / 18));
}

export function CarregandoAnuncio({ pronto = false }: { pronto?: boolean }) {
  const [segundos, setSegundos] = useState(0);
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (pronto) return;
    const inicio = Date.now();
    const id = setInterval(() => setSegundos((Date.now() - inicio) / 1000), 500);
    return () => clearInterval(id);
  }, [pronto]);

  const alvo = pronto ? FRASES.length : Math.min(Math.floor(segundos / SEGUNDOS_POR_FRASE), FRASES.length - 1);

  // Enquanto a frase mostrada não alcança a frase-alvo, ela está sumindo;
  // ao fim do fade troca o texto e ela volta a aparecer.
  const saindo = alvo !== indice;

  useEffect(() => {
    if (!saindo) return;
    const id = setTimeout(() => setIndice(alvo), DURACAO_FADE_MS);
    return () => clearTimeout(id);
  }, [saindo, alvo]);

  const frase = indice >= FRASES.length ? FRASE_PRONTO : FRASES[indice];
  const largura = pronto ? 100 : progressoEstimado(segundos);

  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-2.5 py-8 text-center">
      <p
        className="progresso-frase font-titulo text-[1.4rem] font-medium"
        data-saindo={saindo}
      >
        {frase}
      </p>
      <div className="progresso-trilho">
        <div className="progresso-barra" data-pronto={pronto} style={{ width: `${largura}%` }} />
      </div>
      <p className="mt-1 text-[0.95rem] text-tinta-suave">
        Isso pode levar até um minuto. Não feche esta página.
      </p>
    </div>
  );
}
