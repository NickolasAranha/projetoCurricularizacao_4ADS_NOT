import Link from "next/link";
import { LinkCarrinho } from "@/components/carrinho/LinkCarrinho";

export function Cabecalho() {
  return (
    <header className="border-b border-borda bg-papel/80">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-6 py-2">
        <Link href="/" className="inline-flex min-h-11 items-center font-titulo text-xl font-semibold">
          Feira dos artesãos
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-5">
          <Link href="/catalogo" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
            Produtos
          </Link>
          <Link href="/painel" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
            Sou artesão
          </Link>
          <LinkCarrinho />
        </nav>
      </div>
    </header>
  );
}
