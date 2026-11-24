"use client";

import { useEffect, useRef, useState } from "react";
import { criarClienteNavegador } from "@/lib/supabase/navegador";
import { escolherMimeAudio } from "@/lib/audio";

const LIMITE_SEGUNDOS = 60;

type Estado = "parado" | "gravando" | "enviando" | "pronto" | "erro";

type Props = {
  userId: string;
  aoMudar: (audioPath: string | null) => void;
};

export function GravadorAudio({ userId, aoMudar }: Props) {
  const [estado, setEstado] = useState<Estado>("parado");
  const [segundos, setSegundos] = useState(0);
  const [previa, setPrevia] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const gravador = useRef<MediaRecorder | null>(null);
  const relogio = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => pararRelogio(), []);

  function pararRelogio() {
    if (relogio.current) clearInterval(relogio.current);
    relogio.current = null;
  }

  async function iniciar() {
    setMensagem(null);
    const formato =
      typeof MediaRecorder !== "undefined" ? escolherMimeAudio((m) => MediaRecorder.isTypeSupported(m)) : null;
    if (!formato) {
      setEstado("erro");
      setMensagem("Este navegador não grava áudio. Escreva a descrição no campo abaixo.");
      return;
    }

    let fluxo: MediaStream;
    try {
      fluxo = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setEstado("erro");
      setMensagem(
        "O microfone está bloqueado. Toque no cadeado ao lado do endereço do site e permita o microfone, ou escreva a descrição abaixo.",
      );
      return;
    }

    const partes: Blob[] = [];
    const rec = new MediaRecorder(fluxo, { mimeType: formato.mime });
    rec.ondataavailable = (e) => e.data.size && partes.push(e.data);
    rec.onstop = async () => {
      pararRelogio();
      fluxo.getTracks().forEach((t) => t.stop());
      const blob = new Blob(partes, { type: formato.mime.split(";")[0] });
      setPrevia(URL.createObjectURL(blob));
      setEstado("enviando");
      const path = `${userId}/${crypto.randomUUID()}.${formato.extensao}`;
      const { error } = await criarClienteNavegador()
        .storage.from("produtos-audio")
        .upload(path, blob, { contentType: blob.type });
      if (error) {
        setEstado("erro");
        setMensagem("O áudio não foi enviado. Confira a internet e grave de novo.");
        aoMudar(null);
        return;
      }
      setEstado("pronto");
      aoMudar(path);
    };

    gravador.current = rec;
    setSegundos(0);
    setEstado("gravando");
    rec.start();
    let decorridos = 0;
    relogio.current = setInterval(() => {
      decorridos += 1;
      setSegundos(decorridos);
      if (decorridos >= LIMITE_SEGUNDOS && rec.state === "recording") rec.stop();
    }, 1000);
  }

  function parar() {
    if (gravador.current?.state === "recording") gravador.current.stop();
  }

  function apagar() {
    setPrevia(null);
    setSegundos(0);
    setEstado("parado");
    aoMudar(null);
  }

  return (
    <div className="flex flex-col gap-3">
      {estado === "gravando" ? (
        <>
          <p aria-live="polite">
            Gravando: {segundos}s de {LIMITE_SEGUNDOS}s
          </p>
          <button type="button" onClick={parar} className="botao-primario">
            Parar gravação
          </button>
        </>
      ) : previa ? (
        <>
          <audio controls src={previa} className="w-full" />
          {estado === "enviando" && <p aria-live="polite">Enviando áudio...</p>}
          <div className="flex gap-3">
            <button type="button" onClick={iniciar} className="botao-secundario flex-1">
              Gravar de novo
            </button>
            <button type="button" onClick={apagar} className="botao-secundario flex-1">
              Apagar
            </button>
          </div>
        </>
      ) : (
        <button type="button" onClick={iniciar} className="botao-primario">
          Gravar áudio
        </button>
      )}
      {mensagem && <p role="alert" className="aviso-erro">{mensagem}</p>}
    </div>
  );
}
