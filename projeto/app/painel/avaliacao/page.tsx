import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormAvaliacao } from "@/components/painel/FormAvaliacao";

export const metadata: Metadata = { title: "Como foi usar o catálogo" };

export default async function PaginaAvaliacao() {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: resposta } = await supabase
    .from("respostas_usabilidade")
    .select("id")
    .eq("artesao_id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto w-full max-w-xl p-6">
      <h1 className="titulo-pagina mb-4">Como foi usar o catálogo</h1>
      {resposta ? (
        <div className="flex flex-col gap-4">
          <p>Você já respondeu. Obrigado pela ajuda!</p>
          <Link href="/painel" className="botao-secundario self-start">
            Voltar ao meu catálogo
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-8">
            Você usou o catálogo nos últimos dias. Queremos saber como foi. Leva cerca de 5 minutos e não existe resposta
            certa ou errada.
          </p>
          <FormAvaliacao />
        </>
      )}
    </main>
  );
}
