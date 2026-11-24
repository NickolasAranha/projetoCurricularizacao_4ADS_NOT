import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buscarArtesaoPorSlug, listarPublicados } from "@/lib/consultas";
import { urlPublicaFoto } from "@/lib/storage";
import { GradeProdutos } from "@/components/vitrine/CartaoProduto";
import { RegistrarVisita } from "@/components/RegistrarVisita";

export async function generateMetadata(props: PageProps<"/artesao/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const artesao = await buscarArtesaoPorSlug(slug);
  if (!artesao) return { title: "Artesão não encontrado" };

  let imagem = artesao.foto_path ? urlPublicaFoto(artesao.foto_path, "artesaos-fotos") : null;
  if (!imagem) {
    const [primeiro] = await listarPublicados({ artesaoId: artesao.id });
    imagem = primeiro?.capa ? urlPublicaFoto(primeiro.capa) : null;
  }
  const descricao = artesao.bio?.slice(0, 150) || `Produtos feitos por ${artesao.nome_exibicao}. Peça pelo WhatsApp.`;

  return {
    title: artesao.nome_exibicao,
    description: descricao,
    openGraph: {
      title: artesao.nome_exibicao,
      description: descricao,
      type: "profile",
      images: imagem ? [{ url: imagem }] : undefined,
    },
  };
}

export default async function PaginaArtesao(props: PageProps<"/artesao/[slug]">) {
  const { slug } = await props.params;
  const artesao = await buscarArtesaoPorSlug(slug);
  if (!artesao) notFound();
  const produtos = await listarPublicados({ artesaoId: artesao.id });

  return (
    <main className="mx-auto w-full max-w-5xl p-6">
      <RegistrarVisita tipo="visita_vitrine" artesaoId={artesao.id} />
      <header className="mb-10 flex items-center gap-5">
        {artesao.foto_path && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={urlPublicaFoto(artesao.foto_path, "artesaos-fotos")}
            alt=""
            className="h-24 w-24 shrink-0 rounded-full object-cover"
          />
        )}
        <div className="flex flex-col gap-1">
          <h1 className="titulo-pagina">{artesao.nome_exibicao}</h1>
          {artesao.cidade && <p>{artesao.cidade}</p>}
          {artesao.bio && <p className="max-w-prose">{artesao.bio}</p>}
        </div>
      </header>
      <GradeProdutos produtos={produtos} mostrarArtesao={false} />
    </main>
  );
}
