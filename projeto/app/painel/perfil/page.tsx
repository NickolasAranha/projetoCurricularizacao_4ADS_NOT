import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { urlPublicaFoto } from "@/lib/storage";
import { FormPerfil } from "@/components/painel/FormPerfil";

export const metadata: Metadata = { title: "Meu perfil" };

function whatsappLegivel(numero: string): string {
  const local = numero.startsWith("55") ? numero.slice(2) : numero;
  const ddd = local.slice(0, 2);
  const resto = local.slice(2);
  const meio = resto.length - 4;
  return `(${ddd}) ${resto.slice(0, meio)}-${resto.slice(meio)}`;
}

export default async function PaginaPerfil() {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: artesao } = await supabase.from("artesaos").select("*").eq("id", user.id).single();
  if (!artesao) redirect("/painel");

  return (
    <main className="mx-auto w-full max-w-xl p-6">
      <h1 className="titulo-pagina mb-8">Meu perfil</h1>
      <FormPerfil
        userId={user.id}
        nome={artesao.nome_exibicao}
        whatsapp={whatsappLegivel(artesao.whatsapp)}
        cidade={artesao.cidade ?? ""}
        bio={artesao.bio ?? ""}
        fotoUrl={artesao.foto_path ? urlPublicaFoto(artesao.foto_path, "artesaos-fotos") : null}
        linkVitrine={`/artesao/${artesao.slug}`}
      />
    </main>
  );
}
