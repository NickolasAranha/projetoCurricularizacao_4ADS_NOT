import { describe, expect, it } from "vitest";
import { obterVisitanteId } from "@/lib/eventos";

function armazenamentoEmMemoria() {
  const mem = new Map<string, string>();
  return {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
  };
}

describe("obterVisitanteId", () => {
  it("cria um UUID na primeira visita", () => {
    expect(obterVisitanteId(armazenamentoEmMemoria())).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
  it("devolve o mesmo id nas visitas seguintes", () => {
    const armaz = armazenamentoEmMemoria();
    const id = obterVisitanteId(armaz);
    expect(obterVisitanteId(armaz)).toBe(id);
  });
  it("troca um valor corrompido por um id novo", () => {
    const armaz = armazenamentoEmMemoria();
    armaz.setItem("catalogo:visitante:v1", "lixo");
    expect(obterVisitanteId(armaz)).not.toBe("lixo");
  });
});
