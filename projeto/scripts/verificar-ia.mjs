// Verifica se o modelo do Gemini aceita foto + áudio/texto e devolve JSON estruturado.
// Uso (dentro de projeto/):
//   GEMINI_API_KEY=... node scripts/verificar-ia.mjs gemini-4-hydrogen
// Coloque em scripts/amostras/: produto.jpg, audio.webm e audio.m4a (gravações curtas descrevendo o produto).
// As amostras não vão para o git.

import { GoogleGenAI } from "@google/genai";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const modelo = process.argv[2] ?? "gemini-4-hydrogen";
const pasta = path.join(import.meta.dirname, "amostras");
const ia = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const esquema = {
  type: "object",
  properties: {
    transcricao: { type: ["string", "null"] },
    titulo: { type: "string" },
    descricao: { type: "string" },
    categoria: {
      type: "string",
      enum: [
        "doces-e-salgados",
        "costura-e-moda",
        "madeira-e-marcenaria",
        "artesanato-e-decoracao",
        "beleza-e-cuidados",
        "outros",
      ],
    },
    atributos: {
      type: "array",
      items: { type: "object", properties: { nome: { type: "string" }, valor: { type: "string" } } },
    },
    preco_mencionado_centavos: { type: ["integer", "null"] },
  },
  required: ["transcricao", "titulo", "descricao", "categoria", "atributos", "preco_mencionado_centavos"],
};

function midia(arquivo, mime) {
  return { inlineData: { mimeType: mime, data: readFileSync(path.join(pasta, arquivo)).toString("base64") } };
}

const casos = [
  { nome: "foto + webm", partes: () => [midia("produto.jpg", "image/jpeg"), midia("audio.webm", "audio/webm")], exige: "audio.webm" },
  { nome: "foto + m4a", partes: () => [midia("produto.jpg", "image/jpeg"), midia("audio.m4a", "audio/mp4")], exige: "audio.m4a" },
  {
    nome: "foto + texto",
    partes: () => [midia("produto.jpg", "image/jpeg"), { text: 'Texto do artesão: "bolo de pote de morango, 12 reais"' }],
    exige: "produto.jpg",
  },
];

for (const caso of casos) {
  if (!existsSync(path.join(pasta, caso.exige)) || !existsSync(path.join(pasta, "produto.jpg"))) {
    console.log(`PULADO  ${caso.nome} (falta amostra)`);
    continue;
  }
  const inicio = Date.now();
  try {
    const r = await ia.models.generateContent({
      model: modelo,
      contents: [
        {
          role: "user",
          parts: [...caso.partes(), { text: "Monte o anúncio deste produto artesanal em português. Não invente informações." }],
        },
      ],
      config: { responseMimeType: "application/json", responseJsonSchema: esquema },
    });
    const json = JSON.parse(r.text ?? "null");
    console.log(`OK      ${caso.nome} em ${((Date.now() - inicio) / 1000).toFixed(1)}s`);
    console.log(JSON.stringify(json, null, 2));
  } catch (erro) {
    console.log(`FALHOU  ${caso.nome}: ${erro?.message ?? erro}`);
  }
}
