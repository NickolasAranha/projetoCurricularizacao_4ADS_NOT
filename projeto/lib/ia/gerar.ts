import "server-only";
import { GoogleGenAI } from "@google/genai";
import { interpretarRespostaIA, type RespostaIA } from "./esquema";
import { ESQUEMA_JSON, montarPrompt } from "./prompt";

export const TEMPO_LIMITE_IA_MS = 45_000;

type Midia = { mime: string; base64: string };

export type EntradaGeracao = { fotos: Midia[]; audio?: Midia; texto?: string };

export async function gerarProduto(entrada: EntradaGeracao): Promise<RespostaIA> {
  const ia = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), TEMPO_LIMITE_IA_MS);

  try {
    const partes = [
      ...entrada.fotos.map((f) => ({ inlineData: { mimeType: f.mime, data: f.base64 } })),
      ...(entrada.audio ? [{ inlineData: { mimeType: entrada.audio.mime, data: entrada.audio.base64 } }] : []),
      { text: montarPrompt(entrada.texto ?? null) },
    ];

    const resposta = await ia.models.generateContent({
      model: process.env.GEMINI_MODEL ?? "gemini-4-hydrogen",
      contents: [{ role: "user", parts: partes }],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: ESQUEMA_JSON,
        temperature: 0.4,
        abortSignal: controle.signal,
      },
    });

    return interpretarRespostaIA(JSON.parse(resposta.text ?? "null"));
  } finally {
    clearTimeout(relogio);
  }
}
