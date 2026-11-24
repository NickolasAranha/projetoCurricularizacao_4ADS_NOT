import { describe, expect, it } from "vitest";
import { caminhoPertenceAoUsuario } from "@/lib/caminhos";

describe("caminhoPertenceAoUsuario", () => {
  it("aceita arquivo na pasta do usuário", () => {
    expect(caminhoPertenceAoUsuario("abc/1.jpg", "abc")).toBe(true);
  });
  it("recusa arquivo de outra pasta", () => {
    expect(caminhoPertenceAoUsuario("xyz/1.jpg", "abc")).toBe(false);
  });
  it("recusa tentativa de subir diretório", () => {
    expect(caminhoPertenceAoUsuario("abc/../xyz/1.jpg", "abc")).toBe(false);
  });
  it("recusa subpastas", () => {
    expect(caminhoPertenceAoUsuario("abc/sub/1.jpg", "abc")).toBe(false);
  });
});
