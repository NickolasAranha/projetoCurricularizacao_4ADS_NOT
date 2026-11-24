import type { Metadata } from "next";
import { FormEntrar } from "@/components/conta/FormEntrar";

export const metadata: Metadata = { title: "Entrar" };

export default function PaginaEntrar() {
  return (
    <main className="mx-auto w-full max-w-md p-6">
      <h1 className="titulo-pagina mb-6">Entrar</h1>
      <FormEntrar />
    </main>
  );
}
