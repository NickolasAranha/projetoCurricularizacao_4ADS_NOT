import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { sair } from "@/app/entrar/acoes";
import { ListaProdutos, type ItemPainel } from "@/components/painel/ListaProdutos";
import type { StatusProduto } from "@/lib/tipos";

export const metadata: Metadata = { title: "Meu catálogo" };

const MINIMO_PARA_AVALIAR = 1;

export default async function PaginaPainel() {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const [{ data: artesao }, { data: produtos }, { data: avaliacao }] = await Promise.all([
    supabase.from("artesaos").select("slug, nome_exibicao").eq("id", user.id).single(),
    supabase
      .from("produtos")
      .select("id, titulo, status, preco_centavos, produto_fotos(storage_path, ordem)")
      .eq("artesao_id", user.id)
      .order("criado_em", { ascending: false }),
    supabase.from("respostas_usabilidade").select("id").eq("artesao_id", user.id).maybeSingle(),
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

  // O aviso aparece depois do 1º produto publicado (quando já dá para opinar) e some quando o
  // artesão responde. O botão ao lado de "Meu perfil" fica até ele responder.
  const publicados = itens.filter((p) => p.status === "publicado").length;
  const convidar = publicados >= MINIMO_PARA_AVALIAR && !avaliacao;

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

      {convidar && (
        <section className="convite mb-8 flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Conte como foi usar o catálogo</h2>
          <p>São algumas perguntas rápidas, cerca de 5 minutos. Sua opinião ajuda a melhorar o aplicativo.</p>
          <Link href="/painel/avaliacao" className="botao-primario self-start">
            Responder agora
          </Link>
        </section>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/painel/novo" className="botao-primario">
          Novo produto
        </Link>
        <Link href="/painel/perfil" className="botao-secundario">
          Meu perfil
        </Link>
        {!avaliacao && (
          <Link href="/painel/avaliacao" className="botao-secundario">
            Avaliar o catálogo
          </Link>
        )}
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
