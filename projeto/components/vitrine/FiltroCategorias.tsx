import Link from "next/link";
import { CATEGORIAS } from "@/lib/categorias";

export function FiltroCategorias({ atual }: { atual?: string }) {
  const itens = [{ slug: undefined, nome: "Todos" }, ...CATEGORIAS];
  return (
    <nav aria-label="Categorias" className="-mx-6 overflow-x-auto px-6">
      <ul className="flex gap-2 pb-2">
        {itens.map((c) => {
          const ativo = c.slug === atual;
          return (
            <li key={c.nome} className="shrink-0">
              <Link
                href={c.slug ? `/catalogo?categoria=${c.slug}` : "/catalogo"}
                aria-current={ativo ? "page" : undefined}
                className={ativo ? "botao-primario" : "botao-secundario"}
              >
                {c.nome}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
