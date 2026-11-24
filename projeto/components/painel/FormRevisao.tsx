"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { publicar, salvarRascunho, type EstadoRevisao } from "@/app/painel/produtos/[id]/revisar/acoes";
import { CATEGORIAS } from "@/lib/categorias";
import { LIMITE_TITULO } from "@/lib/ia/esquema";
import type { Atributo, StatusProduto } from "@/lib/tipos";

type Props = {
  id: string;
  status: StatusProduto;
  titulo: string;
  descricao: string;
  categoria: string;
  atributos: Atributo[];
  precoTexto: string;
  linkProduto: string;
};

const estadoInicial: EstadoRevisao = {};

export function FormRevisao(props: Props) {
  const [estadoPublicar, acaoPublicar, publicando] = useActionState(publicar, estadoInicial);
  const [estadoRascunho, acaoRascunho, salvando] = useActionState(salvarRascunho, estadoInicial);
  const [titulo, setTitulo] = useState(props.titulo);
  const [atributos, setAtributos] = useState<Atributo[]>(props.atributos);

  const erro = estadoPublicar.erro ?? estadoRascunho.erro;
  const publicado = estadoPublicar.salvo === "publicado";

  if (publicado) {
    return (
      <div className="flex flex-col gap-4" role="status">
        <p className="text-lg font-semibold">Produto publicado.</p>
        <p>
          Link do produto: <Link href={props.linkProduto} className="underline break-all">{props.linkProduto}</Link>
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/painel/novo" className="botao-primario">Cadastrar outro produto</Link>
          <Link href="/painel" className="botao-secundario">Voltar ao meu catálogo</Link>
        </div>
      </div>
    );
  }

  function mudarAtributo(i: number, campo: keyof Atributo, valor: string) {
    setAtributos((lista) => lista.map((a, j) => (j === i ? { ...a, [campo]: valor } : a)));
  }

  return (
    <form action={acaoPublicar} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={props.id} />
      <input type="hidden" name="atributos" value={JSON.stringify(atributos)} />

      <label className="flex flex-col gap-1">
        <span>Título</span>
        <input
          name="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={LIMITE_TITULO}
          className="campo"
        />
        <span className="text-sm">
          {titulo.length} de {LIMITE_TITULO} letras
        </span>
      </label>

      <label className="flex flex-col gap-1">
        <span>Descrição</span>
        <textarea name="descricao" defaultValue={props.descricao} rows={6} maxLength={2000} className="campo" />
      </label>

      <label className="flex flex-col gap-1">
        <span>Categoria</span>
        <select name="categoria" defaultValue={props.categoria} className="campo">
          <option value="">Escolha</option>
          {CATEGORIAS.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.nome}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1">Detalhes</legend>
        {atributos.map((a, i) => (
          <div key={i} className="flex gap-2">
            <input
              aria-label={`Nome do detalhe ${i + 1}`}
              placeholder="Ex.: Sabor"
              value={a.nome}
              onChange={(e) => mudarAtributo(i, "nome", e.target.value)}
              className="campo w-2/5"
            />
            <input
              aria-label={`Valor do detalhe ${i + 1}`}
              placeholder="Ex.: Morango"
              value={a.valor}
              onChange={(e) => mudarAtributo(i, "valor", e.target.value)}
              className="campo flex-1"
            />
            <button
              type="button"
              onClick={() => setAtributos((lista) => lista.filter((_, j) => j !== i))}
              className="botao-secundario"
              aria-label={`Remover detalhe ${i + 1}`}
            >
              Remover
            </button>
          </div>
        ))}
        {atributos.length < 8 && (
          <button
            type="button"
            onClick={() => setAtributos((lista) => [...lista, { nome: "", valor: "" }])}
            className="botao-secundario self-start"
          >
            Adicionar detalhe
          </button>
        )}
      </fieldset>

      <label className="flex flex-col gap-1">
        <span>Preço (R$)</span>
        <input
          name="preco"
          defaultValue={props.precoTexto}
          inputMode="decimal"
          placeholder="Ex.: 12,50"
          className="campo"
        />
      </label>

      {erro && <p role="alert" className="aviso-erro">{erro}</p>}
      {estadoRascunho.salvo === "rascunho" && <p role="status">Rascunho salvo.</p>}

      <button type="submit" disabled={publicando} className="botao-primario">
        {publicando ? "Publicando..." : props.status === "publicado" ? "Salvar alterações" : "Publicar"}
      </button>
      {props.status === "rascunho" && (
        <button type="submit" formAction={acaoRascunho} disabled={salvando} className="botao-secundario">
          {salvando ? "Salvando..." : "Salvar e terminar depois"}
        </button>
      )}
    </form>
  );
}
