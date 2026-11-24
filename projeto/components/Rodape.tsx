import Link from "next/link";

export function Rodape() {
  return (
    <footer className="mt-16 border-t border-borda">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-6 py-8 text-tinta-suave sm:flex-row sm:justify-between">
        <p>Projeto de extensão universitária. Sem taxa para o artesão, o pedido vai direto para o WhatsApp de quem fez.</p>
        <Link href="/metricas" className="underline underline-offset-4">
          Métricas do piloto
        </Link>
      </div>
    </footer>
  );
}
