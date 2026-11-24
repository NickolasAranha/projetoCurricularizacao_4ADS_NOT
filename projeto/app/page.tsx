import Link from "next/link";
import { listarPublicados } from "@/lib/consultas";
import { GradeProdutos } from "@/components/vitrine/CartaoProduto";
import { RegistrarVisita } from "@/components/RegistrarVisita";

const PASSOS = [
  { titulo: "Tire a foto", texto: "Fotografe o produto com o celular. Até quatro fotos." },
  { titulo: "Fale sobre ele", texto: "Grave um áudio curto ou escreva do seu jeito: o que é, do que é feito, o preço." },
  { titulo: "Confira e publique", texto: "O título e o texto de venda chegam prontos. Você ajusta o que quiser e publica." },
];

export default async function Inicio() {
  const produtos = (await listarPublicados()).slice(0, 8);

  return (
    <main>
      <RegistrarVisita tipo="visita_catalogo" />

      <section className="mx-auto w-full max-w-5xl px-6 pb-12 pt-10 sm:pt-16">
        <h1 className="max-w-3xl font-titulo text-[clamp(2.25rem,1.6rem+3vw,4rem)] font-semibold leading-[1.05]">
          Coisas feitas à mão por gente daqui, com pedido direto no WhatsApp de quem fez.
        </h1>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/catalogo" className="botao-primario">
            Ver os produtos
          </Link>
          <Link href="/criar-conta" className="botao-secundario">
            Sou artesão e quero meu catálogo
          </Link>
        </div>
      </section>

      {produtos.length > 0 && (
        <section aria-labelledby="recentes" className="mx-auto w-full max-w-5xl px-6 pb-16">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 id="recentes" className="text-2xl font-semibold">
              Chegou na banca
            </h2>
            <Link href="/catalogo" className="underline underline-offset-4">
              Ver todos
            </Link>
          </div>
          <GradeProdutos produtos={produtos} />
        </section>
      )}

      <section aria-labelledby="como-funciona" className="border-y border-borda bg-kraft/40">
        <div className="mx-auto w-full max-w-5xl px-6 py-14">
          <h2 id="como-funciona" className="mb-8 text-2xl font-semibold">
            Como o artesão monta o catálogo
          </h2>
          <ol className="grid gap-8 sm:grid-cols-3">
            {PASSOS.map((passo, i) => (
              <li key={passo.titulo} className="flex flex-col gap-2">
                <span className="font-titulo text-4xl font-semibold text-barro" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="text-xl font-semibold">{passo.titulo}</h3>
                <p className="max-w-[34ch]">{passo.texto}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 max-w-prose">
            Não tem taxa sobre a venda. O cliente monta o pedido aqui e ele chega pronto no WhatsApp do artesão, com os
            itens, as quantidades e o total.
          </p>
          <Link href="/criar-conta" className="botao-primario mt-6">
            Criar meu catálogo
          </Link>
        </div>
      </section>
    </main>
  );
}
