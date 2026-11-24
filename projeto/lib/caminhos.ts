export function caminhoPertenceAoUsuario(caminho: string, userId: string): boolean {
  const partes = caminho.split("/");
  return partes.length === 2 && partes[0] === userId && /^[A-Za-z0-9-]+\.[a-z0-9]+$/.test(partes[1]);
}
