"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import Link from "next/link";
import { enviarAvaliacao, type EstadoAvaliacao } from "@/app/painel/avaliacao/acoes";
import {
  OPCOES_AUTORIZACAO,
  OPCOES_INFO_ERRADA,
  OPCOES_MODO,
  OPCOES_MUDANCA,
  OPCOES_PEDIDOS,
  PERGUNTAS_SUS,
  type Opcao,
} from "@/lib/avaliacao";

const estadoInicial: EstadoAvaliacao = {};

function intervalo(min: number, max: number): Opcao[] {
  return Array.from({ length: max - min + 1 }, (_, i) => ({ valor: String(min + i), rotulo: String(min + i) }));
}

function Escolha({
  nome,
  pergunta,
  opcoes,
  pontas,
  aoMudar,
}: {
  nome: string;
  pergunta: string;
  opcoes: Opcao[];
  pontas?: [string, string];
  aoMudar?: (valor: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-medium">{pergunta}</legend>
      <div className="flex flex-wrap gap-2">
        {opcoes.map((o) => (
          <label key={o.valor} className={pontas ? "opcao opcao-numero" : "opcao"}>
            <input
              type="radio"
              name={nome}
              value={o.valor}
              required
              className="sr-only"
              onChange={() => aoMudar?.(o.valor)}
            />
            {o.rotulo}
          </label>
        ))}
      </div>
      {pontas && (
        <p className="flex justify-between gap-4 text-sm text-tinta-suave">
          <span>
            {opcoes[0].valor} = {pontas[0]}
          </span>
          <span className="text-right">
            {opcoes.at(-1)!.valor} = {pontas[1]}
          </span>
        </p>
      )}
    </fieldset>
  );
}

function Aberta({ nome, pergunta }: { nome: string; pergunta: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-medium">
        {pergunta} <span className="font-normal text-tinta-suave">(se quiser)</span>
      </span>
      <textarea name={nome} rows={3} maxLength={2000} className="campo" />
    </label>
  );
}

const CONCORDA: [string, string] = ["Discordo totalmente", "Concordo totalmente"];

export function FormAvaliacao() {
  const [estado, acao, enviando] = useActionState(enviarAvaliacao, estadoInicial);
  const [consentimento, setConsentimento] = useState<"sim" | "nao" | null>(null);
  const [infoErrada, setInfoErrada] = useState("nao");

  // Envia sem o reset automático do form: se der erro, as respostas continuam marcadas.
  function aoEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const dados = new FormData(e.currentTarget);
    startTransition(() => acao(dados));
  }

  if (estado.enviado) {
    return (
      <div role="status" className="flex flex-col gap-4">
        <p className="text-lg font-semibold">Obrigado! Sua resposta foi enviada.</p>
        <p>Ela ajuda a melhorar o catálogo para você e para outros artesãos.</p>
        <Link href="/painel" className="botao-primario self-start">
          Voltar ao meu catálogo
        </Link>
      </div>
    );
  }

  if (consentimento !== "sim") {
    return (
      <div className="flex flex-col gap-5">
        <p>
          Sua participação é voluntária e você pode parar quando quiser. Usaremos suas respostas apenas nesta atividade
          de extensão. No relatório você aparece só como um código (P1, P2...), a não ser que autorize o uso do seu nome.
        </p>
        <p className="font-medium">Você concorda em participar?</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => setConsentimento("sim")} className="botao-primario">
            Sim, concordo em participar
          </button>
          <button type="button" onClick={() => setConsentimento("nao")} className="botao-secundario">
            Não
          </button>
        </div>
        {consentimento === "nao" && (
          <p role="status">
            Tudo bem, nada foi enviado. Se mudar de ideia, é só voltar aqui.{" "}
            <Link href="/painel" className="underline">
              Voltar ao meu catálogo
            </Link>
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={aoEnviar} className="flex flex-col gap-10">
      <input type="hidden" name="consentimento" value="sim" />

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold">Usando o aplicativo</h2>
        <p className="text-tinta-suave">Para cada frase: 1 = Discordo totalmente, 5 = Concordo totalmente.</p>
        {PERGUNTAS_SUS.map((p, i) => (
          <Escolha key={i} nome={`sus_${i + 1}`} pergunta={`${i + 1}. ${p}`} opcoes={intervalo(1, 5)} pontas={CONCORDA} />
        ))}
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold">O anúncio feito pela IA</h2>
        <Escolha
          nome="descricoes_atrativas"
          pergunta="“Com o aplicativo, ficou fácil ter descrições atrativas dos meus produtos.”"
          opcoes={intervalo(1, 5)}
          pontas={CONCORDA}
        />
        <Escolha
          nome="facilidade"
          pergunta="“Achei fácil usar este aplicativo para colocar meus produtos na internet.”"
          opcoes={intervalo(1, 5)}
          pontas={CONCORDA}
        />
        <Escolha
          nome="texto_qualidade"
          pergunta="O texto que o aplicativo escreveu ficou bom?"
          opcoes={intervalo(1, 5)}
          pontas={["Muito ruim", "Muito bom"]}
        />
        <Escolha nome="texto_mudanca" pergunta="Quanto você precisou mudar no texto antes de publicar?" opcoes={OPCOES_MUDANCA} />
        <Escolha
          nome="info_errada"
          pergunta="O texto colocou alguma informação errada sobre o produto?"
          opcoes={OPCOES_INFO_ERRADA}
          aoMudar={setInfoErrada}
        />
        {infoErrada !== "nao" && (
          <label className="flex flex-col gap-1">
            <span className="font-medium">
              Qual informação? <span className="font-normal text-tinta-suave">(se quiser)</span>
            </span>
            <input name="info_errada_qual" maxLength={500} className="campo" />
          </label>
        )}
        <Escolha nome="modo_preferido" pergunta="Como você preferiu descrever o produto?" opcoes={OPCOES_MODO} />
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold">Comparando com antes</h2>
        <Escolha
          nome="comparado_antes"
          pergunta="Comparado com o jeito que você divulgava antes, colocar um produto no catálogo foi:"
          opcoes={intervalo(1, 5)}
          pontas={["Muito mais lento", "Muito mais rápido"]}
        />
        <Escolha
          nome="pedidos_whatsapp"
          pergunta="Você recebeu pedidos ou mensagens pelo WhatsApp vindos do catálogo?"
          opcoes={OPCOES_PEDIDOS}
        />
        <Escolha
          nome="satisfacao"
          pergunta="No geral, qual a sua satisfação com o aplicativo?"
          opcoes={intervalo(1, 5)}
          pontas={["Muito insatisfeito", "Muito satisfeito"]}
        />
        <Escolha
          nome="recomendacao"
          pergunta="De 0 a 10, o quanto você recomendaria este aplicativo para outro artesão?"
          opcoes={intervalo(0, 10)}
          pontas={["Não recomendaria", "Recomendaria com certeza"]}
        />
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold">Sua opinião</h2>
        <Aberta nome="mais_ajudou" pergunta="O que mais ajudou?" />
        <Aberta nome="mais_atrapalhou" pergunta="O que mais atrapalhou ou deu errado?" />
        <Aberta nome="faltou" pergunta="O que faltou no aplicativo?" />
        <Escolha
          nome="autorizacao_uso"
          pergunta="Podemos usar seu nome e a foto de um produto seu no relatório?"
          opcoes={OPCOES_AUTORIZACAO}
        />
      </section>

      <div className="flex flex-col gap-3">
        {estado.erro && (
          <p role="alert" className="aviso-erro">
            {estado.erro}
          </p>
        )}
        <button type="submit" disabled={enviando} className="botao-primario">
          {enviando ? "Enviando..." : "Enviar respostas"}
        </button>
      </div>
    </form>
  );
}
