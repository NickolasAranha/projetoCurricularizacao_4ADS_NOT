// Mostrado na hora do clique enquanto o servidor busca os produtos.
export function CarregandoGrade({ titulo }: { titulo: string }) {
  return (
    <main className="mx-auto w-full max-w-5xl p-6" aria-busy="true">
      <h1 className="titulo-pagina mb-6">{titulo}</h1>
      <p className="mb-8" role="status">Carregando produtos...</p>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i} className="flex flex-col gap-2">
            <div className="aspect-[4/5] w-full rounded-md bg-kraft motion-safe:animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-kraft motion-safe:animate-pulse" />
          </li>
        ))}
      </ul>
    </main>
  );
}

export function CarregandoProduto() {
  return (
    <main className="mx-auto w-full max-w-5xl p-6" aria-busy="true">
      <p className="sr-only" role="status">Carregando produto...</p>
      <div className="grid gap-8 md:grid-cols-2" aria-hidden="true">
        <div className="aspect-[4/5] w-full rounded-md bg-kraft motion-safe:animate-pulse" />
        <div className="flex flex-col gap-4">
          <div className="h-9 w-3/4 rounded bg-kraft motion-safe:animate-pulse" />
          <div className="h-6 w-1/3 rounded bg-kraft motion-safe:animate-pulse" />
          <div className="h-24 w-full rounded bg-kraft motion-safe:animate-pulse" />
        </div>
      </div>
    </main>
  );
}
