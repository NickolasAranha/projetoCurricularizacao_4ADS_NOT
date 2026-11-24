import Link from "next/link";
import { formatarReais } from "@/lib/dinheiro";
import { urlPublicaFoto } from "@/lib/storage";
import type { ProdutoComCapa } from "@/lib/consultas";

export function CartaoProduto({ produto, mostrarArtesao = true }: { produto: ProdutoComCapa; mostrarArtesao?: boolean }) {
  return (
    <article className="flex flex-col gap-2">
      <Link href={`/produto/${produto.id}`} className="group flex flex-col gap-2">
        <div className="relative">
          {produto.capa ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={urlPublicaFoto(produto.capa)}
              alt=""
              loading="lazy"
              className="aspect-[4/5] w-full rounded-md object-cover"
            />
          ) : (
            <div className="aspect-[4/5] w-full rounded-md bg-kraft" />
          )}
          {produto.preco_centavos ? (
            <span className="etiqueta absolute bottom-3 left-0 -rotate-2">{formatarReais(produto.preco_centavos)}</span>
          ) : null}
        </div>
        <h3 className="text-lg font-medium leading-snug group-hover:underline group-hover:underline-offset-4">
          {produto.titulo}
        </h3>
      </Link>
      {mostrarArtesao && (
        <Link href={`/artesao/${produto.artesao.slug}`} className="text-tinta-suave underline underline-offset-4">
          {produto.artesao.nome_exibicao}
        </Link>
      )}
    </article>
  );
}

export function GradeProdutos({ produtos, mostrarArtesao }: { produtos: ProdutoComCapa[]; mostrarArtesao?: boolean }) {
  if (!produtos.length) return <p className="py-8">Nenhum produto publicado por aqui ainda.</p>;
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {produtos.map((p) => (
        <li key={p.id}>
          <CartaoProduto produto={p} mostrarArtesao={mostrarArtesao} />
        </li>
      ))}
    </ul>
  );
}
