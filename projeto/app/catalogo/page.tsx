import type { Metadata } from "next";
import { listarPublicados } from "@/lib/consultas";
import { CATEGORIAS } from "@/lib/categorias";
import { FiltroCategorias } from "@/components/vitrine/FiltroCategorias";
import { GradeProdutos } from "@/components/vitrine/CartaoProduto";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Produtos feitos à mão por artesãos e pequenos produtores. Peça direto pelo WhatsApp.",
};

export default async function PaginaCatalogo(props: PageProps<"/catalogo">) {
  const { categoria } = await props.searchParams;
  const slug = typeof categoria === "string" ? categoria : undefined;
  const nomeCategoria = CATEGORIAS.find((c) => c.slug === slug)?.nome;
  const produtos = await listarPublicados({ categoriaSlug: slug });

  return (
    <main className="mx-auto w-full max-w-5xl p-6">
      <h1 className="titulo-pagina mb-6">{nomeCategoria ?? "Catálogo"}</h1>
      <div className="mb-8">
        <FiltroCategorias atual={nomeCategoria ? slug : undefined} />
      </div>
      <GradeProdutos produtos={produtos} />
    </main>
  );
}
