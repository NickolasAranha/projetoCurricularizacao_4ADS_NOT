"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { excluir } from "@/app/painel/produtos/[id]/revisar/acoes";

function Confirmar() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="botao-primario w-full">
      {pending ? "Excluindo..." : "Sim, excluir"}
    </button>
  );
}

// Excluir não tem volta, então pede confirmação na própria tela (sem janela do navegador).
export function BotaoExcluir({ id, titulo }: { id: string; titulo: string }) {
  const [confirmando, setConfirmando] = useState(false);

  if (!confirmando) {
    return (
      <button type="button" onClick={() => setConfirmando(true)} className="botao-secundario">
        Excluir
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label={`Confirmar exclusão de ${titulo}`}
      data-confirmando
      className="flex flex-wrap items-center justify-end gap-2"
    >
      <p className="font-medium whitespace-normal">Excluir de vez? Não tem como desfazer.</p>
      <div className="flex gap-2">
        <form action={excluir.bind(null, id)} className="flex-1">
          <Confirmar />
        </form>
        <button type="button" onClick={() => setConfirmando(false)} className="botao-secundario flex-1">
          Cancelar
        </button>
      </div>
    </div>
  );
}
