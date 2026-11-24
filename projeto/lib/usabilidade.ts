import { pontuacaoSus } from "./kpi";

export type RespostaUsabilidade = {
  participante: string;
  sus_respostas: number[];
  sus_pontuacao: number;
  satisfacao: number | null;
  facilidade: number | null;
};

export function lerCsv(texto: string): string[][] {
  const linhas: string[][] = [];
  let linha: string[] = [];
  let campo = "";
  let entreAspas = false;

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (entreAspas) {
      if (c === '"' && texto[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') {
        entreAspas = false;
      } else {
        campo += c;
      }
    } else if (c === '"') {
      entreAspas = true;
    } else if (c === ",") {
      linha.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      linha.push(campo);
      linhas.push(linha);
      linha = [];
      campo = "";
    } else {
      campo += c;
    }
  }
  if (campo || linha.length) {
    linha.push(campo);
    linhas.push(linha);
  }
  return linhas.filter((l) => l.some((v) => v.trim() !== ""));
}

const COLUNA_CONSENTIMENTO = "Você concorda em participar";
const COLUNA_CODIGO = "Código do participante";
const COLUNA_FACILIDADE = "Achei fácil usar este aplicativo";
const COLUNA_SATISFACAO = "No geral, qual a sua satisfação";

function indice(cabecalho: string[], trecho: string): number {
  const i = cabecalho.findIndex((h) => h.includes(trecho));
  if (i < 0) throw new Error(`Coluna não encontrada no CSV: "${trecho}"`);
  return i;
}

function nota(valor: string | undefined): number | null {
  const n = Number(String(valor ?? "").trim());
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}

export function respostasDoCsv(texto: string): RespostaUsabilidade[] {
  const [cabecalho, ...linhas] = lerCsv(texto.replace(/^﻿/, ""));
  if (!cabecalho) return [];

  const iCodigo = indice(cabecalho, COLUNA_CODIGO);
  const iConsentimento = indice(cabecalho, COLUNA_CONSENTIMENTO);
  const iFacilidade = indice(cabecalho, COLUNA_FACILIDADE);
  const iSatisfacao = indice(cabecalho, COLUNA_SATISFACAO);
  const iSus = Array.from({ length: 10 }, (_, k) => iCodigo + 1 + k);

  return linhas
    .filter((l) => (l[iConsentimento] ?? "").trim().toLowerCase().startsWith("sim"))
    .map((l) => {
      const sus = iSus.map((i) => nota(l[i]));
      if (sus.some((n) => n === null)) throw new Error(`Respostas SUS incompletas para ${l[iCodigo]}`);
      const respostas = sus as number[];
      return {
        participante: (l[iCodigo] ?? "").trim(),
        sus_respostas: respostas,
        sus_pontuacao: pontuacaoSus(respostas),
        satisfacao: nota(l[iSatisfacao]),
        facilidade: nota(l[iFacilidade]),
      };
    });
}
