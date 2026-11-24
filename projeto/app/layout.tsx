import type { Metadata } from "next";
import { Albert_Sans, Besley } from "next/font/google";
import "./globals.css";
import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";

const titulo = Besley({ subsets: ["latin"], weight: ["500", "600"], variable: "--fonte-titulo" });
const texto = Albert_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--fonte-texto" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Feira dos artesãos", template: "%s · Feira dos artesãos" },
  description: "Produtos feitos à mão por artesãos e pequenos produtores, com pedido direto pelo WhatsApp.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${titulo.variable} ${texto.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Cabecalho />
        <div className="flex-1">{children}</div>
        <Rodape />
      </body>
    </html>
  );
}
