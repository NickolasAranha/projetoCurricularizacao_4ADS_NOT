import type { Metadata } from "next";
import { ListaCarrinho } from "@/components/carrinho/ListaCarrinho";

export const metadata: Metadata = { title: "Carrinho" };

export default function PaginaCarrinho() {
  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <h1 className="titulo-pagina mb-8">Carrinho</h1>
      <ListaCarrinho />
    </main>
  );
}
