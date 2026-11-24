import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { sair } from "@/app/entrar/acoes";
import { ListaProdutos, type ItemPainel } from "@/components/painel/ListaProdutos";
import type { StatusProduto } from "@/lib/tipos";

export const metadata: Metadata = { title: "Meu catálogo" };

export default async function PaginaPainel() {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const [{ data: artesao }, { data: produtos }] = await Promise.all([
    supabase.from("artesaos").select("slug, nome_exibicao").eq("id", user.id).single(),
    supabase
      .from("produtos")
      .select("id, titulo, status, preco_centavos, produto_fotos(storage_path, ordem)")
      .eq("artesao_id", user.id)
      .order("criado_em", { ascending: false }),
  ]);

  const itens: ItemPainel[] = (produtos ?? []).map((p) => {
    const fotos = (p.produto_fotos ?? []) as { storage_path: string; ordem: number }[];
    const capa = [...fotos].sort((a, b) => a.ordem - b.ordem)[0]?.storage_path ?? null;
    return {
      id: p.id,
      titulo: p.titulo,
      status: p.status as StatusProduto,
      preco_centavos: p.preco_centavos,
      capa,
    };
  });

  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <header className="mb-8 flex items-center justify-between gap-4">
        <h1 className="titulo-pagina">Olá, {artesao?.nome_exibicao}</h1>
        <form action={sair}>
          <button type="submit" className="botao-secundario">
            Sair
          </button>
        </form>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/painel/novo" className="botao-primario">
          Novo produto
        </Link>
        <Link href="/painel/perfil" className="botao-secundario">
          Meu perfil
        </Link>
      </div>

      {artesao && (
        <p className="mt-6">
          Seu catálogo:{" "}
          <Link href={`/artesao/${artesao.slug}`} className="underline">
            /artesao/{artesao.slug}
          </Link>
        </p>
      )}

      <ListaProdutos produtos={itens} />
    </main>
  );
}
