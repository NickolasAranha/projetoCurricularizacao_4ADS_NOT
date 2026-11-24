const FORMATO = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarReais(centavos: number): string {
  return FORMATO.format(centavos / 100).replace(/\s/g, " ");
}

export function parseReais(texto: string): number | null {
  let limpo = texto.replace(/R\$/gi, "").replace(/\s/g, "");
  if (!limpo || limpo.includes("-")) return null;

  if (limpo.includes(",")) {
    limpo = limpo.replace(/\./g, "").replace(",", ".");
  } else if (!/^\d+\.\d{1,2}$/.test(limpo)) {
    limpo = limpo.replace(/\./g, "");
  }

  if (!/^\d+(\.\d{1,2})?$/.test(limpo)) return null;
  const centavos = Math.round(Number(limpo) * 100);
  return centavos > 0 ? centavos : null;
}
