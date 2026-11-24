import Link from "next/link";
import { LinkCarrinho } from "@/components/carrinho/LinkCarrinho";

export function Cabecalho() {
  return (
    <header className="border-b border-borda">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="inline-flex min-h-11 items-center text-lg font-semibold">
          Catálogo dos artesãos
        </Link>
        <nav className="flex items-center gap-5">
          <Link href="/catalogo" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
            Produtos
          </Link>
          <LinkCarrinho />
        </nav>
      </div>
    </header>
  );
}
