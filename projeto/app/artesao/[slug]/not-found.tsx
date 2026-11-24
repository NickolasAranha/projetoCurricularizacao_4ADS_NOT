import Link from "next/link";

export default function ArtesaoNaoEncontrado() {
  return (
    <main className="mx-auto w-full max-w-xl p-6">
      <h1 className="titulo-pagina mb-4">Não encontramos esse artesão</h1>
      <p className="mb-6">Confira o link ou veja todos os produtos.</p>
      <Link href="/catalogo" className="botao-primario">
        Ver o catálogo
      </Link>
    </main>
  );
}
