import { describe, expect, it } from "vitest";
import { normalizarWhatsapp } from "@/lib/whatsapp";

describe("normalizarWhatsapp", () => {
  it("aceita celular com máscara", () => {
    expect(normalizarWhatsapp("(11) 98765-4321")).toBe("5511987654321");
  });
  it("prefixa 55 em celular com DDD", () => {
    expect(normalizarWhatsapp("11987654321")).toBe("5511987654321");
  });
  it("aceita formato internacional com +", () => {
    expect(normalizarWhatsapp("+55 11 98765-4321")).toBe("5511987654321");
  });
  it("mantém número já normalizado", () => {
    expect(normalizarWhatsapp("5511987654321")).toBe("5511987654321");
  });
  it("aceita fixo com DDD", () => {
    expect(normalizarWhatsapp("1133334444")).toBe("551133334444");
  });
  it("recusa número sem DDD", () => {
    expect(normalizarWhatsapp("98765-4321")).toBeNull();
  });
  it("recusa texto", () => {
    expect(normalizarWhatsapp("abc")).toBeNull();
  });
});

import { linkWhatsapp } from "@/lib/whatsapp";

describe("linkWhatsapp", () => {
  it("codifica símbolos, acentos e quebras de linha", () => {
    const link = linkWhatsapp("5511987654321", "Bolo & café #1? 100%\nOlá");
    expect(link.startsWith("https://wa.me/5511987654321?text=")).toBe(true);
    expect(decodeURIComponent(link.split("?text=")[1])).toBe("Bolo & café #1? 100%\nOlá");
  });
});
