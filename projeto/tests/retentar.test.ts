import { describe, expect, it, vi } from "vitest";
import { comRetentativa, erroTransitorio } from "@/lib/ia/retentar";

function falhaDeRede(codigo = "UND_ERR_CONNECT_TIMEOUT") {
  return Object.assign(new TypeError("fetch failed"), { cause: Object.assign(new Error("x"), { code: codigo }) });
}

describe("erroTransitorio", () => {
  it("reconhece falha de conexão", () => {
    expect(erroTransitorio(falhaDeRede())).toBe(true);
    expect(erroTransitorio(falhaDeRede("ECONNRESET"))).toBe(true);
  });

  it("reconhece serviço sobrecarregado", () => {
    expect(erroTransitorio({ status: 503 })).toBe(true);
    expect(erroTransitorio({ status: 429 })).toBe(true);
  });

  it("não repete erro definitivo nem cancelamento por tempo", () => {
    expect(erroTransitorio({ status: 400 })).toBe(false);
    expect(erroTransitorio(new SyntaxError("json"))).toBe(false);
    expect(erroTransitorio(Object.assign(new Error("aborted"), { name: "AbortError" }))).toBe(false);
  });
});

describe("comRetentativa", () => {
  it("tenta de novo depois de uma falha de rede", async () => {
    const tarefa = vi.fn().mockRejectedValueOnce(falhaDeRede()).mockResolvedValueOnce("ok");
    await expect(comRetentativa(tarefa, { tentativas: 3, esperaMs: 0 })).resolves.toBe("ok");
    expect(tarefa).toHaveBeenCalledTimes(2);
  });

  it("desiste depois do número de tentativas", async () => {
    const tarefa = vi.fn().mockRejectedValue(falhaDeRede());
    await expect(comRetentativa(tarefa, { tentativas: 3, esperaMs: 0 })).rejects.toThrow("fetch failed");
    expect(tarefa).toHaveBeenCalledTimes(3);
  });

  it("não repete erro definitivo", async () => {
    const tarefa = vi.fn().mockRejectedValue({ status: 400 });
    await expect(comRetentativa(tarefa, { tentativas: 3, esperaMs: 0 })).rejects.toEqual({ status: 400 });
    expect(tarefa).toHaveBeenCalledTimes(1);
  });

  it("para se o tempo limite já estourou", async () => {
    const controle = new AbortController();
    const tarefa = vi.fn().mockImplementation(async () => {
      controle.abort();
      throw falhaDeRede();
    });
    await expect(comRetentativa(tarefa, { tentativas: 3, esperaMs: 0, sinal: controle.signal })).rejects.toThrow();
    expect(tarefa).toHaveBeenCalledTimes(1);
  });
});
