export const MAX_FOTOS = 4;

export type FotoEnviada = { path: string; previa: string };

export function anexarFotos(atuais: FotoEnviada[], novas: FotoEnviada[]): FotoEnviada[] {
  return [...atuais, ...novas].slice(0, MAX_FOTOS);
}
