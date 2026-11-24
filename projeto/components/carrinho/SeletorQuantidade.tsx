"use client";

type Props = { valor: number; aoMudar: (valor: number) => void; rotulo: string; minimo?: number };

export function SeletorQuantidade({ valor, aoMudar, rotulo, minimo = 1 }: Props) {
  return (
    <div className="flex items-center gap-3" role="group" aria-label={`Quantidade de ${rotulo}`}>
      <button
        type="button"
        onClick={() => aoMudar(Math.max(minimo, valor - 1))}
        className="botao-secundario w-12"
        aria-label="Diminuir quantidade"
      >
        −
      </button>
      <span className="min-w-8 text-center text-lg font-semibold" aria-live="polite">
        {valor}
      </span>
      <button
        type="button"
        onClick={() => aoMudar(Math.min(99, valor + 1))}
        className="botao-secundario w-12"
        aria-label="Aumentar quantidade"
      >
        +
      </button>
    </div>
  );
}
