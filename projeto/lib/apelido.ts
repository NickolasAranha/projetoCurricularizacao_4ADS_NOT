const PADRAO_APELIDO = /^[a-z0-9-]{3,30}$/;

export function normalizarApelido(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function apelidoValido(apelido: string): boolean {
  return PADRAO_APELIDO.test(apelido);
}

export function emailDoApelido(apelido: string): string {
  return `${apelido}@catalogo.local`;
}
