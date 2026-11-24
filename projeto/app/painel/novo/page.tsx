import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FluxoNovoProduto } from "@/components/captura/FluxoNovoProduto";

export const metadata: Metadata = { title: "Novo produto" };

export default async function PaginaNovoProduto() {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  return (
    <main className="mx-auto w-full max-w-xl p-6">
      <h1 className="titulo-pagina mb-8">Novo produto</h1>
      <FluxoNovoProduto userId={user.id} />
    </main>
  );
}
