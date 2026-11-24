import Link from "next/link";
import { formatarReais } from "@/lib/dinheiro";
import { urlPublicaFoto } from "@/lib/storage";
import type { ProdutoComCapa } from "@/lib/consultas";

export function CartaoProduto({ produto, mostrarArtesao = true }: { produto: ProdutoComCapa; mostrarArtesao?: boolean }) {
  return (
    <article className="flex flex-col gap-2">
      <Link href={`/produto/${produto.id}`} className="flex flex-col gap-2">
        {produto.capa ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={urlPublicaFoto(produto.capa)}
            alt=""
            loading="lazy"
            className="aspect-square w-full rounded-lg object-cover"
          />
        ) : (
          <div className="aspect-square w-full rounded-lg bg-borda" />
        )}
        <h3 className="font-medium leading-snug">{produto.titulo}</h3>
      </Link>
      {produto.preco_centavos ? <p className="font-semibold">{formatarReais(produto.preco_centavos)}</p> : null}
      {mostrarArtesao && (
        <Link href={`/artesao/${produto.artesao.slug}`} className="text-sm underline">
          {produto.artesao.nome_exibicao}
        </Link>
      )}
    </article>
  );
}

export function GradeProdutos({ produtos, mostrarArtesao }: { produtos: ProdutoComCapa[]; mostrarArtesao?: boolean }) {
  if (!produtos.length) return <p className="py-8">Nenhum produto por aqui ainda.</p>;
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {produtos.map((p) => (
        <li key={p.id}>
          <CartaoProduto produto={p} mostrarArtesao={mostrarArtesao} />
        </li>
      ))}
    </ul>
  );
}
