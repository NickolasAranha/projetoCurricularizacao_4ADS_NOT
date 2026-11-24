"use client";

import { useActionState } from "react";
import Link from "next/link";
import { entrar, type EstadoForm } from "@/app/entrar/acoes";

const estadoInicial: EstadoForm = {};

export function FormEntrar() {
  const [estado, acao, enviando] = useActionState(entrar, estadoInicial);

  return (
    <form action={acao} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1">
        <span>Apelido</span>
        <input name="apelido" required autoCapitalize="none" autoComplete="username" className="campo" />
      </label>

      <label className="flex flex-col gap-1">
        <span>PIN</span>
        <input
          name="pin"
          required
          type="password"
          inputMode="numeric"
          maxLength={6}
          autoComplete="current-password"
          className="campo"
        />
      </label>

      {estado.erro && (
        <p role="alert" className="aviso-erro">
          {estado.erro}
        </p>
      )}

      <button type="submit" disabled={enviando} className="botao-primario">
        {enviando ? "Entrando..." : "Entrar"}
      </button>

      <p>
        Primeira vez? <Link href="/criar-conta" className="underline">Criar conta</Link>
      </p>
    </form>
  );
}
