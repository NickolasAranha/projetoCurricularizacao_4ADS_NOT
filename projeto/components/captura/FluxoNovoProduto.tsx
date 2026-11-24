"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SeletorFotos, type FotoEnviada } from "./SeletorFotos";
import { GravadorAudio } from "./GravadorAudio";
import { iniciarSessaoCadastro } from "@/app/painel/novo/acoes";

export function FluxoNovoProduto({ userId }: { userId: string }) {
  const router = useRouter();
  const iniciou = useRef(false);
  const [sessaoId, setSessaoId] = useState<string | null>(null);
  const [fotos, setFotos] = useState<FotoEnviada[]>([]);
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (iniciou.current) return;
    iniciou.current = true;
    iniciarSessaoCadastro()
      .then(setSessaoId)
      .catch(() => setErro("Não foi possível começar. Recarregue a página."));
  }, []);

  const podeGerar = Boolean(sessaoId) && fotos.length > 0 && (Boolean(audioPath) || texto.trim().length > 0);

  async function montarAnuncio() {
    if (!podeGerar) return;
    setGerando(true);
    setErro(null);
    try {
      const resposta = await fetch("/api/gerar-produto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessaoId,
          fotoPaths: fotos.map((f) => f.path),
          audioPath: audioPath ?? undefined,
          texto: texto.trim() || undefined,
        }),
      });
      if (!resposta.ok) throw new Error(String(resposta.status));
      const { produtoId, iaFalhou } = (await resposta.json()) as { produtoId: string; iaFalhou: boolean };
      router.push(`/painel/produtos/${produtoId}/revisar${iaFalhou ? "?ia=falhou" : ""}`);
    } catch {
      setGerando(false);
      setErro("Não deu para salvar agora. Confira a internet e tente de novo.");
    }
  }

  if (gerando) {
    return (
      <p aria-live="polite" className="py-16 text-center text-lg">
        Montando seu anúncio. Isso pode levar até um minuto.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <SeletorFotos userId={userId} fotos={fotos} aoMudar={setFotos} />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Conte sobre o produto</h2>
        <p>Fale do seu jeito: o que é, do que é feito, tamanho, sabor. Se quiser, diga o preço.</p>
        <GravadorAudio userId={userId} aoMudar={setAudioPath} />
        <label className="flex flex-col gap-1">
          <span>Ou escreva aqui</span>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={4}
            maxLength={1500}
            className="campo"
          />
        </label>
      </section>

      {erro && <p role="alert" className="aviso-erro">{erro}</p>}

      <button type="button" onClick={montarAnuncio} disabled={!podeGerar} className="botao-primario">
        Montar meu anúncio
      </button>
    </div>
  );
}
