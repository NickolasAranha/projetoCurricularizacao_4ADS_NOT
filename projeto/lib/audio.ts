export type FormatoAudio = { mime: string; extensao: "webm" | "m4a" | "ogg" };

const PREFERENCIAS: FormatoAudio[] = [
  { mime: "audio/webm;codecs=opus", extensao: "webm" },
  { mime: "audio/mp4", extensao: "m4a" },
  { mime: "audio/ogg;codecs=opus", extensao: "ogg" },
];

export function escolherMimeAudio(suporta: (mime: string) => boolean): FormatoAudio | null {
  return PREFERENCIAS.find((formato) => suporta(formato.mime)) ?? null;
}
