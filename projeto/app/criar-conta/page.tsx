import type { Metadata } from "next";
import { FormCriarConta } from "@/components/conta/FormCriarConta";

export const metadata: Metadata = { title: "Criar conta" };

export default function PaginaCriarConta() {
  return (
    <main className="mx-auto w-full max-w-md p-6">
      <h1 className="titulo-pagina mb-6">Criar conta</h1>
      <FormCriarConta site={process.env.NEXT_PUBLIC_SITE_URL ?? ""} />
    </main>
  );
}
