import type { Metadata } from "next";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = {
  title: "Métricas",
  description: "Indicadores do piloto: tempo de cadastro, conversão e satisfação.",
};

type Tempo = {
  media_min: number | null;
  mediana_min: number | null;
  media_min_com_ia: number | null;
  mediana_min_com_ia: number | null;
  concluidas: number;
  abandonadas: number;
  iniciadas: number;
  media_min_ate_ia: number | null;
};

type Conversao = {
  artesao_slug: string | null;
  artesao_nome: string | null;
  visitantes: number;
  convertidos: number;
  taxa: number | null;
};

type Usabilidade = {
  sus_medio: number | null;
  satisfacao_media: number | null;
  facilidade_media: number | null;
  n: number;
};

function numero(valor: number | string | null | undefined, sufixo = ""): string {
  if (valor === null || valor === undefined) return "sem dados";
  return `${Number(valor).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}${sufixo}`;
}

function Linha({ rotulo, valor, detalhe }: { rotulo: string; valor: string; detalhe?: string }) {
  return (
    <div className="flex flex-col gap-1 border-t border-borda py-3 sm:flex-row sm:items-baseline sm:justify-between">
      <dt>{rotulo}</dt>
      <dd className="flex flex-col sm:items-end">
        <span className="text-xl font-semibold tabular-nums">{valor}</span>
        {detalhe && <span className="text-sm">{detalhe}</span>}
      </dd>
    </div>
  );
}

export default async function PaginaMetricas() {
  const supabase = await criarClienteServidor();
  const [tempoR, conversaoR, usabilidadeR] = await Promise.all([
    supabase.rpc("kpi_tempo_cadastro"),
    supabase.rpc("kpi_conversao"),
    supabase.rpc("kpi_usabilidade"),
  ]);

  const tempo = ((tempoR.data as Tempo[] | null) ?? [])[0];
  const conversao = (conversaoR.data as Conversao[] | null) ?? [];
  const geral = conversao.find((c) => c.artesao_slug === null);
  const porArtesao = conversao.filter((c) => c.artesao_slug !== null);
  const usabilidade = ((usabilidadeR.data as Usabilidade[] | null) ?? [])[0];

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="titulo-pagina mb-2">Métricas do piloto</h1>
      <p className="mb-10">Inclui todo o uso desde o lançamento, também o da equipe durante os testes.</p>

      <section className="mb-12">
        <h2 className="mb-2 text-xl font-semibold">Tempo de cadastro</h2>
        <dl>
          <Linha
            rotulo="Tempo médio até publicar"
            valor={numero(tempo?.media_min, " min")}
            detalhe={`mediana ${numero(tempo?.mediana_min, " min")} · ${tempo?.concluidas ?? 0} cadastros`}
          />
          <Linha
            rotulo="Só quando a IA respondeu"
            valor={numero(tempo?.media_min_com_ia, " min")}
            detalhe={`mediana ${numero(tempo?.mediana_min_com_ia, " min")}`}
          />
          <Linha rotulo="Tempo médio até a IA responder" valor={numero(tempo?.media_min_ate_ia, " min")} />
          <Linha
            rotulo="Cadastros abandonados"
            valor={String(tempo?.abandonadas ?? 0)}
            detalhe={`de ${tempo?.iniciadas ?? 0} iniciados (sem publicar em 24 h)`}
          />
        </dl>
      </section>

      <section className="mb-12">
        <h2 className="mb-2 text-xl font-semibold">Conversão</h2>
        <dl>
          <Linha
            rotulo="Visitantes que clicaram em Comprar no WhatsApp"
            valor={numero(geral?.taxa, "%")}
            detalhe={`${geral?.convertidos ?? 0} de ${geral?.visitantes ?? 0} visitantes`}
          />
        </dl>
        {porArtesao.length > 0 && (
          <table className="mt-4 w-full text-left">
            <caption className="sr-only">Conversão por artesão</caption>
            <thead>
              <tr className="border-b border-borda">
                <th scope="col" className="py-2 font-medium">Artesão</th>
                <th scope="col" className="py-2 text-right font-medium">Visitantes</th>
                <th scope="col" className="py-2 text-right font-medium">Cliques</th>
                <th scope="col" className="py-2 text-right font-medium">Taxa</th>
              </tr>
            </thead>
            <tbody>
              {porArtesao.map((c) => (
                <tr key={c.artesao_slug} className="border-b border-borda">
                  <td className="py-2">{c.artesao_nome}</td>
                  <td className="py-2 text-right tabular-nums">{c.visitantes}</td>
                  <td className="py-2 text-right tabular-nums">{c.convertidos}</td>
                  <td className="py-2 text-right tabular-nums">{numero(c.taxa, "%")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Satisfação e facilidade</h2>
        <dl>
          <Linha
            rotulo="Pontuação SUS média (0 a 100)"
            valor={numero(usabilidade?.sus_medio)}
            detalhe={`68 é a média de referência · ${usabilidade?.n ?? 0} respostas`}
          />
          <Linha rotulo="Satisfação geral (1 a 5)" valor={numero(usabilidade?.satisfacao_media)} />
          <Linha rotulo="Facilidade de uso (1 a 5)" valor={numero(usabilidade?.facilidade_media)} />
        </dl>
      </section>
    </main>
  );
}
