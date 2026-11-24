import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { sair } from "@/app/entrar/acoes";

export const metadata: Metadata = { title: "Meu catálogo" };

export default async function PaginaPainel() {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: artesao } = await supabase
    .from("artesaos")
    .select("slug, nome_exibicao")
    .eq("id", user.id)
    .single();

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

      <Link href="/painel/novo" className="botao-primario">
        Novo produto
      </Link>

      {artesao && (
        <p className="mt-6">
          Seu catálogo: <Link href={`/artesao/${artesao.slug}`} className="underline">/artesao/{artesao.slug}</Link>
        </p>
      )}
    </main>
  );
}
