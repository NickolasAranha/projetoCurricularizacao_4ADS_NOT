import { describe, expect, it } from "vitest";
import { anexarFotos, MAX_FOTOS } from "@/lib/fotos";

const foto = (n: number) => ({ path: `u/${n}.jpg`, previa: `blob:${n}` });

describe("anexarFotos", () => {
  it("mantém as fotos que já estavam e acrescenta as novas", () => {
    expect(anexarFotos([foto(1)], [foto(2)]).map((f) => f.path)).toEqual(["u/1.jpg", "u/2.jpg"]);
  });
  it("dois envios que terminam fora de ordem não se apagam", () => {
    let estado: ReturnType<typeof foto>[] = [];
    const envioA = (atual: typeof estado) => anexarFotos(atual, [foto(1)]);
    const envioB = (atual: typeof estado) => anexarFotos(atual, [foto(2)]);
    estado = envioB(estado);
    estado = envioA(estado);
    expect(estado.map((f) => f.path).sort()).toEqual(["u/1.jpg", "u/2.jpg"]);
  });
  it("nunca passa de quatro fotos, mesmo com envios simultâneos", () => {
    expect(MAX_FOTOS).toBe(4);
    expect(anexarFotos([foto(1), foto(2), foto(3)], [foto(4), foto(5)])).toHaveLength(4);
  });
});
