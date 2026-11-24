import type { TipoEvento } from "@/lib/tipos";

const CHAVE_VISITANTE = "catalogo:visitante:v1";
const PADRAO_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

type Armazenamento = Pick<Storage, "getItem" | "setItem">;

export function obterVisitanteId(armazenamento: Armazenamento): string {
  const atual = armazenamento.getItem(CHAVE_VISITANTE);
  if (atual && PADRAO_UUID.test(atual)) return atual;
  const novo = crypto.randomUUID();
  armazenamento.setItem(CHAVE_VISITANTE, novo);
  return novo;
}

export type Evento = { tipo: TipoEvento; artesaoId?: string; produtoId?: string; valorCentavos?: number };

export function registrarEvento(evento: Evento): void {
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/eventos`;
    const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    void fetch(url, {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        apikey: chave,
        Authorization: `Bearer ${chave}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        tipo: evento.tipo,
        visitante_id: obterVisitanteId(localStorage),
        artesao_id: evento.artesaoId ?? null,
        produto_id: evento.produtoId ?? null,
        valor_centavos: evento.valorCentavos ?? null,
      }),
    }).catch(() => {});
  } catch {
    // Registro de evento nunca pode atrapalhar a navegação.
  }
}
