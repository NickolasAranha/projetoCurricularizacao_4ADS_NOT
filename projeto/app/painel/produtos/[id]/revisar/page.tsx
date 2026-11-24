import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { urlPublicaFoto } from "@/lib/storage";
import { categoriaPorId } from "@/lib/categorias";
import { interpretarRespostaIA } from "@/lib/ia/esquema";
import { FormRevisao } from "@/components/painel/FormRevisao";
import { lerRespostaIA } from "@/lib/produto-privado";
import type { Atributo, StatusProduto } from "@/lib/tipos";

export const metadata: Metadata = { title: "Revisar produto" };

export default async function PaginaRevisar(props: PageProps<"/painel/produtos/[id]/revisar">) {
  const { id } = await props.params;
  const busca = await props.searchParams;

  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: produto } = await supabase
    .from("produtos")
    .select("id, status, titulo, descricao, categoria_id, atributos, preco_centavos, artesao_id")
    .eq("id", id)
    .eq("artesao_id", user.id)
    .maybeSingle();
  if (!produto) notFound();

  const { data: fotos } = await supabase
    .from("produto_fotos")
    .select("storage_path, ordem")
    .eq("produto_id", id)
    .order("ordem");

  const transcricao = interpretarRespostaIA(await lerRespostaIA(produto.id, user.id)).transcricao;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const precoTexto = produto.preco_centavos ? (produto.preco_centavos / 100).toFixed(2).replace(".", ",") : "";

  return (
    <main className="mx-auto w-full max-w-xl p-6">
      <h1 className="titulo-pagina mb-2">Confira seu anúncio</h1>
      <p className="mb-6">Mude o que quiser, coloque o preço e publique.</p>

      {busca.ia === "falhou" && (
        <p role="alert" className="aviso-erro mb-6">
          Não conseguimos montar o texto agora. Você pode preencher abaixo.
        </p>
      )}

      {fotos && fotos.length > 0 && (
        <ul className="mb-6 grid grid-cols-4 gap-2">
          {fotos.map((f, i) => (
            <li key={f.storage_path}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urlPublicaFoto(f.storage_path)}
                alt={`Foto ${i + 1}`}
                className="aspect-square w-full rounded-lg object-cover"
              />
            </li>
          ))}
        </ul>
      )}

      {transcricao && (
        <details className="mb-6">
          <summary className="cursor-pointer">O que entendemos do seu áudio</summary>
          <p className="mt-2 italic">{transcricao}</p>
        </details>
      )}

      <FormRevisao
        id={produto.id}
        status={produto.status as StatusProduto}
        titulo={produto.titulo ?? ""}
        descricao={produto.descricao ?? ""}
        categoria={categoriaPorId(produto.categoria_id)?.slug ?? ""}
        atributos={(produto.atributos as Atributo[]) ?? []}
        precoTexto={precoTexto}
        linkProduto={`${site}/produto/${produto.id}`}
      />
    </main>
  );
}
