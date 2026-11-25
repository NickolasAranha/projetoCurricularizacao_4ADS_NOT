// Formulário Depois ("Como foi usar o catálogo") respondido dentro do painel.
// Mesmas perguntas de evidencias/formularios/formulario_depois.md, na mesma ordem.

export type Opcao = { valor: string; rotulo: string };

// Perguntas 3 a 12: Escala de Usabilidade do Sistema (SUS). A ordem não pode mudar,
// porque o cálculo depende de quais são ímpares e pares.
export const PERGUNTAS_SUS = [
  "Eu gostaria de usar este aplicativo com frequência.",
  "Achei o aplicativo mais complicado do que precisava ser.",
  "Achei o aplicativo fácil de usar.",
  "Acho que eu precisaria da ajuda de alguém que entende de tecnologia para usar o aplicativo.",
  "Achei que as partes do aplicativo funcionam bem juntas.",
  "Achei o aplicativo confuso, com coisas que não combinam entre si.",
  "Acho que a maioria das pessoas aprenderia a usar este aplicativo rapidamente.",
  "Achei o aplicativo trabalhoso de usar.",
  "Eu me senti seguro(a) usando o aplicativo.",
  "Precisei aprender muitas coisas antes de conseguir usar o aplicativo.",
] as const;

export const OPCOES_MUDANCA: Opcao[] = [
  { valor: "nada", rotulo: "Nada" },
  { valor: "pouca", rotulo: "Pouca coisa" },
  { valor: "bastante", rotulo: "Bastante" },
  { valor: "quase_tudo", rotulo: "Reescrevi quase tudo" },
];

export const OPCOES_INFO_ERRADA: Opcao[] = [
  { valor: "nao", rotulo: "Não" },
  { valor: "uma_vez", rotulo: "Sim, uma vez" },
  { valor: "mais_de_uma", rotulo: "Sim, mais de uma vez" },
];

export const OPCOES_MODO: Opcao[] = [
  { valor: "audio", rotulo: "Falando (áudio)" },
  { valor: "texto", rotulo: "Escrevendo" },
  { valor: "ambos", rotulo: "Usei os dois" },
];

export const OPCOES_PEDIDOS: Opcao[] = [
  { valor: "nenhum", rotulo: "Nenhum" },
  { valor: "1_a_2", rotulo: "1 a 2" },
  { valor: "3_a_5", rotulo: "3 a 5" },
  { valor: "mais_de_5", rotulo: "Mais de 5" },
];

export const OPCOES_AUTORIZACAO: Opcao[] = [
  { valor: "nome_e_foto", rotulo: "Sim, nome e foto" },
  { valor: "so_foto", rotulo: "Só a foto do produto" },
  { valor: "so_codigo", rotulo: "Não, só um código" },
];

// Colunas de respostas_usabilidade. A pontuação SUS é calculada pelo banco.
export type Avaliacao = {
  sus_respostas: number[];
  descricoes_atrativas: number;
  facilidade: number;
  texto_qualidade: number;
  texto_mudanca: string;
  info_errada: string;
  info_errada_qual: string | null;
  modo_preferido: string;
  comparado_antes: number;
  pedidos_whatsapp: string;
  satisfacao: number;
  recomendacao: number;
  mais_ajudou: string | null;
  mais_atrapalhou: string | null;
  faltou: string | null;
  autorizacao_uso: string;
};

type Campos = { get(nome: string): FormDataEntryValue | null };

export type ResultadoAvaliacao = { dados: Avaliacao } | { erro: string };

function texto(form: Campos, nome: string): string {
  const v = form.get(nome);
  return typeof v === "string" ? v.trim() : "";
}

function numero(form: Campos, nome: string, min: number, max: number): number | null {
  const v = texto(form, nome);
  if (!/^\d+$/.test(v)) return null;
  const n = Number(v);
  return n >= min && n <= max ? n : null;
}

function escolha(form: Campos, nome: string, opcoes: Opcao[]): string | null {
  const v = texto(form, nome);
  return opcoes.some((o) => o.valor === v) ? v : null;
}

function livre(form: Campos, nome: string, limite: number): string | null {
  return texto(form, nome).slice(0, limite) || null;
}

export function lerAvaliacao(form: Campos): ResultadoAvaliacao {
  if (texto(form, "consentimento") !== "sim") return { erro: "Para enviar, é preciso concordar em participar." };

  const sus = PERGUNTAS_SUS.map((_, i) => numero(form, `sus_${i + 1}`, 1, 5));
  const faltaSus = sus.findIndex((n) => n === null);
  if (faltaSus >= 0) return { erro: `Falta responder a frase ${faltaSus + 1} da primeira parte.` };

  const descricoes_atrativas = numero(form, "descricoes_atrativas", 1, 5);
  const facilidade = numero(form, "facilidade", 1, 5);
  const texto_qualidade = numero(form, "texto_qualidade", 1, 5);
  const texto_mudanca = escolha(form, "texto_mudanca", OPCOES_MUDANCA);
  const info_errada = escolha(form, "info_errada", OPCOES_INFO_ERRADA);
  const modo_preferido = escolha(form, "modo_preferido", OPCOES_MODO);
  if (
    descricoes_atrativas === null ||
    facilidade === null ||
    texto_qualidade === null ||
    !texto_mudanca ||
    !info_errada ||
    !modo_preferido
  ) {
    return { erro: "Falta responder alguma pergunta sobre o anúncio feito pela IA." };
  }

  const comparado_antes = numero(form, "comparado_antes", 1, 5);
  const pedidos_whatsapp = escolha(form, "pedidos_whatsapp", OPCOES_PEDIDOS);
  const satisfacao = numero(form, "satisfacao", 1, 5);
  const recomendacao = numero(form, "recomendacao", 0, 10);
  if (comparado_antes === null || !pedidos_whatsapp || satisfacao === null || recomendacao === null) {
    return { erro: "Falta responder alguma pergunta da parte \"Comparando com antes\"." };
  }

  const autorizacao_uso = escolha(form, "autorizacao_uso", OPCOES_AUTORIZACAO);
  if (!autorizacao_uso) return { erro: "Diga se podemos usar seu nome e a foto de um produto no relatório." };

  return {
    dados: {
      sus_respostas: sus as number[],
      descricoes_atrativas,
      facilidade,
      texto_qualidade,
      texto_mudanca,
      info_errada,
      info_errada_qual: info_errada === "nao" ? null : livre(form, "info_errada_qual", 500),
      modo_preferido,
      comparado_antes,
      pedidos_whatsapp,
      satisfacao,
      recomendacao,
      mais_ajudou: livre(form, "mais_ajudou", 2000),
      mais_atrapalhou: livre(form, "mais_atrapalhou", 2000),
      faltou: livre(form, "faltou", 2000),
      autorizacao_uso,
    },
  };
}
