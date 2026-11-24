"use client";

import { useRef, useState } from "react";
import { criarClienteNavegador } from "@/lib/supabase/navegador";
import { reduzirFoto } from "@/lib/imagem";

export type FotoEnviada = { path: string; previa: string };

const MAX_FOTOS = 4;

type Props = {
  userId: string;
  fotos: FotoEnviada[];
  aoMudar: (fotos: FotoEnviada[]) => void;
};

export function SeletorFotos({ userId, fotos, aoMudar }: Props) {
  const [enviando, setEnviando] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const camera = useRef<HTMLInputElement>(null);
  const galeria = useRef<HTMLInputElement>(null);
  const restantes = MAX_FOTOS - fotos.length - enviando;

  async function adicionar(lista: FileList | null) {
    if (!lista) return;
    const arquivos = Array.from(lista).slice(0, Math.max(restantes, 0));
    if (!arquivos.length) return;
    setErro(null);
    setEnviando((n) => n + arquivos.length);
    const supabase = criarClienteNavegador();
    const novas: FotoEnviada[] = [];
    for (const arquivo of arquivos) {
      try {
        const reduzida = await reduzirFoto(arquivo);
        const path = `${userId}/${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage
          .from("produtos-fotos")
          .upload(path, reduzida, { contentType: "image/jpeg" });
        if (error) throw error;
        novas.push({ path, previa: URL.createObjectURL(reduzida) });
      } catch {
        setErro("Uma foto não foi enviada. Confira a internet e tente de novo.");
      } finally {
        setEnviando((n) => n - 1);
      }
    }
    aoMudar([...fotos, ...novas]);
  }

  function remover(indice: number) {
    aoMudar(fotos.filter((_, i) => i !== indice));
  }

  function usarComoCapa(indice: number) {
    const escolhida = fotos[indice];
    aoMudar([escolhida, ...fotos.filter((_, i) => i !== indice)]);
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Fotos do produto</h2>
      <p>Fotografe só o produto, sem rostos. Até 4 fotos. A primeira é a capa.</p>

      {fotos.length > 0 && (
        <ul className="grid grid-cols-2 gap-3">
          {fotos.map((foto, i) => (
            <li key={foto.path} className="flex flex-col gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto.previa} alt={`Foto ${i + 1}`} className="aspect-square w-full rounded-lg object-cover" />
              <div className="flex gap-2">
                {i > 0 && (
                  <button type="button" onClick={() => usarComoCapa(i)} className="botao-secundario flex-1">
                    Usar como capa
                  </button>
                )}
                <button type="button" onClick={() => remover(i)} className="botao-secundario flex-1">
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {enviando > 0 && <p aria-live="polite">Enviando {enviando === 1 ? "foto" : `${enviando} fotos`}...</p>}
      {erro && <p role="alert" className="aviso-erro">{erro}</p>}

      {restantes > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => camera.current?.click()} className="botao-primario">
            Tirar foto
          </button>
          <button type="button" onClick={() => galeria.current?.click()} className="botao-secundario">
            Escolher da galeria
          </button>
        </div>
      )}

      <input
        ref={camera}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          adicionar(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={galeria}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          adicionar(e.target.files);
          e.target.value = "";
        }}
      />
    </section>
  );
}
