import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buscarProdutoPublicado } from "@/lib/consultas";
import { urlPublicaFoto } from "@/lib/storage";
import { formatarReais } from "@/lib/dinheiro";
import { categoriaPorId } from "@/lib/categorias";
import { AcoesProduto } from "@/components/carrinho/AcoesProduto";
import { RegistrarVisita } from "@/components/RegistrarVisita";

export async function generateMetadata(props: PageProps<"/produto/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const produto = await buscarProdutoPublicado(id);
  if (!produto) return { title: "Produto não encontrado" };
  const descricao = produto.descricao?.slice(0, 150) ?? "";
  return {
    title: produto.titulo ?? "Produto",
    description: descricao,
    openGraph: {
      title: produto.titulo ?? "Produto",
      description: descricao,
      images: produto.capa ? [{ url: urlPublicaFoto(produto.capa) }] : undefined,
    },
  };
}

export default async function PaginaProduto(props: PageProps<"/produto/[id]">) {
  const { id } = await props.params;
  const produto = await buscarProdutoPublicado(id);
  if (!produto) notFound();
  const categoria = categoriaPorId(produto.categoria_id);

  return (
    <main className="mx-auto w-full max-w-5xl p-6">
      <RegistrarVisita tipo="visita_produto" artesaoId={produto.artesao.id} produtoId={produto.id} />
      <div className="grid gap-8 md:grid-cols-2">
        <section aria-label="Fotos" className="flex flex-col gap-3">
          {produto.fotos.map((foto, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={foto}
              src={urlPublicaFoto(foto)}
              alt={i === 0 ? (produto.titulo ?? "") : ""}
              className="w-full rounded-lg object-cover"
            />
          ))}
        </section>

        <section className="flex flex-col gap-5">
          {categoria && (
            <Link href={`/catalogo?categoria=${categoria.slug}`} className="text-sm underline">
              {categoria.nome}
            </Link>
          )}
          <h1 className="titulo-pagina">{produto.titulo}</h1>
          {produto.preco_centavos ? (
            <p className="text-2xl font-semibold">{formatarReais(produto.preco_centavos)}</p>
          ) : null}
          {produto.descricao && <p className="whitespace-pre-line">{produto.descricao}</p>}

          {produto.atributos.length > 0 && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              {produto.atributos.map((a) => (
                <div key={a.nome} className="contents">
                  <dt className="font-medium">{a.nome}</dt>
                  <dd>{a.valor}</dd>
                </div>
              ))}
            </dl>
          )}

          {produto.preco_centavos && produto.titulo ? (
            <AcoesProduto
              item={{
                produtoId: produto.id,
                titulo: produto.titulo,
                precoCentavos: produto.preco_centavos,
                capa: produto.capa,
                artesao: {
                  id: produto.artesao.id,
                  slug: produto.artesao.slug,
                  nome: produto.artesao.nome_exibicao,
                  whatsapp: produto.artesao.whatsapp,
                },
              }}
            />
          ) : null}

          <p>
            Feito por{" "}
            <Link href={`/artesao/${produto.artesao.slug}`} className="underline">
              {produto.artesao.nome_exibicao}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
