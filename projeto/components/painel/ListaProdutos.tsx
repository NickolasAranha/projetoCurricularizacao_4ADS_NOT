import Link from "next/link";
import { arquivar, republicar } from "@/app/painel/produtos/[id]/revisar/acoes";
import { BotaoExcluir } from "@/components/painel/BotaoExcluir";
import { formatarReais } from "@/lib/dinheiro";
import { urlPublicaFoto } from "@/lib/storage";
import type { StatusProduto } from "@/lib/tipos";

export type ItemPainel = {
  id: string;
  titulo: string | null;
  status: StatusProduto;
  preco_centavos: number | null;
  capa: string | null;
};

const GRUPOS: { status: StatusProduto; titulo: string }[] = [
  { status: "rascunho", titulo: "Para terminar" },
  { status: "publicado", titulo: "Publicados" },
  { status: "arquivado", titulo: "Fora do ar" },
];

export function ListaProdutos({ produtos }: { produtos: ItemPainel[] }) {
  if (!produtos.length) {
    return <p className="mt-8">Você ainda não tem produtos. Toque em Novo produto para começar.</p>;
  }

  return (
    <div className="mt-8 flex flex-col gap-10">
      {GRUPOS.map(({ status, titulo }) => {
        const lista = produtos.filter((p) => p.status === status);
        if (!lista.length) return null;
        return (
          <section key={status}>
            <h2 className="mb-4 text-xl font-semibold">{titulo}</h2>
            <ul className="flex flex-col gap-4">
              {lista.map((p) => (
                <li key={p.id} className="item-produto flex flex-wrap items-center gap-x-4 gap-y-3">
                  {p.capa ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={urlPublicaFoto(p.capa)} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="h-16 w-16 shrink-0 rounded-lg bg-borda" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.titulo || "Sem título"}</p>
                    {p.preco_centavos ? <p>{formatarReais(p.preco_centavos)}</p> : null}
                  </div>
                  <div className="acoes-produto flex shrink-0 flex-col gap-2 whitespace-nowrap sm:flex-row">
                    <Link href={`/painel/produtos/${p.id}/revisar`} className="botao-secundario">
                      {status === "rascunho" ? "Continuar" : "Editar"}
                    </Link>
                    {status === "publicado" && (
                      <form action={arquivar.bind(null, p.id)}>
                        <button type="submit" className="botao-secundario w-full">Tirar do ar</button>
                      </form>
                    )}
                    {status === "arquivado" && (
                      <form action={republicar.bind(null, p.id)}>
                        <button type="submit" className="botao-secundario w-full">Publicar de novo</button>
                      </form>
                    )}
                    <BotaoExcluir id={p.id} titulo={p.titulo || "Sem título"} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
