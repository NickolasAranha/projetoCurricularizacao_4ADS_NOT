"use client";

import { useActionState, useRef, useState } from "react";
import { salvarPerfil, type EstadoPerfil } from "@/app/painel/perfil/acoes";
import { criarClienteNavegador } from "@/lib/supabase/navegador";
import { reduzirFoto } from "@/lib/imagem";

type Props = {
  userId: string;
  nome: string;
  whatsapp: string;
  cidade: string;
  bio: string;
  fotoUrl: string | null;
  linkVitrine: string;
};

const estadoInicial: EstadoPerfil = {};

export function FormPerfil(props: Props) {
  const [estado, acao, salvando] = useActionState(salvarPerfil, estadoInicial);
  const [bio, setBio] = useState(props.bio);
  const [fotoPath, setFotoPath] = useState("");
  const [previa, setPrevia] = useState(props.fotoUrl);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const entrada = useRef<HTMLInputElement>(null);

  async function trocarFoto(arquivo: File | undefined) {
    if (!arquivo) return;
    setErroFoto(null);
    setEnviandoFoto(true);
    try {
      const reduzida = await reduzirFoto(arquivo);
      const path = `${props.userId}/${crypto.randomUUID()}.jpg`;
      const { error } = await criarClienteNavegador()
        .storage.from("artesaos-fotos")
        .upload(path, reduzida, { contentType: "image/jpeg" });
      if (error) throw error;
      setFotoPath(path);
      setPrevia(URL.createObjectURL(reduzida));
    } catch {
      setErroFoto("A foto não foi enviada. Tente de novo.");
    } finally {
      setEnviandoFoto(false);
    }
  }

  return (
    <form action={acao} className="flex flex-col gap-5">
      <input type="hidden" name="foto_path" value={fotoPath} />

      <div className="flex items-center gap-4">
        {previa ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previa} alt="Sua foto" className="h-24 w-24 rounded-full object-cover" />
        ) : (
          <div className="h-24 w-24 rounded-full bg-borda" />
        )}
        <button type="button" onClick={() => entrada.current?.click()} className="botao-secundario">
          {enviandoFoto ? "Enviando..." : previa ? "Trocar foto" : "Colocar foto"}
        </button>
        <input
          ref={entrada}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            trocarFoto(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      {erroFoto && <p role="alert" className="aviso-erro">{erroFoto}</p>}

      <label className="flex flex-col gap-1">
        <span>Nome que aparece no catálogo</span>
        <input name="nome" defaultValue={props.nome} required maxLength={80} className="campo" />
      </label>

      <label className="flex flex-col gap-1">
        <span>WhatsApp com DDD</span>
        <input name="whatsapp" defaultValue={props.whatsapp} required type="tel" inputMode="tel" className="campo" />
      </label>

      <label className="flex flex-col gap-1">
        <span>Cidade</span>
        <input name="cidade" defaultValue={props.cidade} maxLength={80} className="campo" />
      </label>

      <label className="flex flex-col gap-1">
        <span>Uma frase sobre você e o que você faz</span>
        <textarea
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={280}
          rows={3}
          className="campo"
        />
        <span className="text-sm">{bio.length} de 280 letras</span>
      </label>

      {estado.erro && <p role="alert" className="aviso-erro">{estado.erro}</p>}
      {estado.salvo && (
        <p role="status">
          Perfil salvo. Veja como ficou: <a href={props.linkVitrine} className="underline">sua vitrine</a>
        </p>
      )}

      <button type="submit" disabled={salvando || enviandoFoto} className="botao-primario">
        {salvando ? "Salvando..." : "Salvar perfil"}
      </button>
    </form>
  );
}
