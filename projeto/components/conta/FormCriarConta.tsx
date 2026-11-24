"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { criarConta, type EstadoForm } from "@/app/criar-conta/acoes";
import { normalizarApelido } from "@/lib/apelido";

const estadoInicial: EstadoForm = {};

export function FormCriarConta({ site }: { site: string }) {
  const [estado, acao, enviando] = useActionState(criarConta, estadoInicial);
  const [apelido, setApelido] = useState("");
  const normalizado = normalizarApelido(apelido);

  return (
    <form action={acao} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1">
        <span>Seu nome</span>
        <input name="nome" required autoComplete="name" className="campo" />
      </label>

      <label className="flex flex-col gap-1">
        <span>Apelido para entrar</span>
        <input
          name="apelido"
          required
          autoCapitalize="none"
          autoComplete="username"
          value={apelido}
          onChange={(e) => setApelido(e.target.value)}
          className="campo"
        />
        {normalizado && (
          <span className="text-sm">
            Seu link: {site.replace(/^https?:\/\//, "")}/artesao/{normalizado}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span>WhatsApp com DDD</span>
        <input name="whatsapp" required type="tel" inputMode="tel" autoComplete="tel" className="campo" />
      </label>

      <label className="flex flex-col gap-1">
        <span>PIN de 6 números</span>
        <input
          name="pin"
          required
          type="password"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          autoComplete="new-password"
          className="campo"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span>Repita o PIN</span>
        <input
          name="pin_confirmacao"
          required
          type="password"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          autoComplete="new-password"
          className="campo"
        />
      </label>

      {estado.erro && (
        <p role="alert" className="aviso-erro">
          {estado.erro}
        </p>
      )}

      <button type="submit" disabled={enviando} className="botao-primario">
        {enviando ? "Criando..." : "Criar minha conta"}
      </button>

      <p>
        Já tem conta? <Link href="/entrar" className="underline">Entrar</Link>
      </p>
    </form>
  );
}
