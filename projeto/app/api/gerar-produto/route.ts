import { NextResponse } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { caminhoPertenceAoUsuario } from "@/lib/caminhos";
import { idDaCategoria } from "@/lib/categorias";
import { gerarProduto } from "@/lib/ia/gerar";
import { RESPOSTA_VAZIA, type RespostaIA } from "@/lib/ia/esquema";

export const maxDuration = 60;

const MIME_AUDIO: Record<string, string> = {
  webm: "audio/webm",
  m4a: "audio/mp4",
  ogg: "audio/ogg",
  wav: "audio/wav",
};

type Corpo = { sessaoId?: unknown; fotoPaths?: unknown; audioPath?: unknown; texto?: unknown };

async function baixarBase64(bucket: string, path: string): Promise<string> {
  const { data, error } = await criarClienteAdmin().storage.from(bucket).download(path);
  if (error || !data) throw new Error(`Falha ao baixar ${path}`);
  return Buffer.from(await data.arrayBuffer()).toString("base64");
}

export async function POST(request: Request) {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "não autenticado" }, { status: 401 });

  const corpo = (await request.json().catch(() => ({}))) as Corpo;
  const sessaoId = typeof corpo.sessaoId === "string" ? corpo.sessaoId : null;
  const fotoPaths = Array.isArray(corpo.fotoPaths) ? corpo.fotoPaths.filter((p) => typeof p === "string") : [];
  const audioPath = typeof corpo.audioPath === "string" ? corpo.audioPath : null;
  const texto = typeof corpo.texto === "string" ? corpo.texto.trim().slice(0, 1500) : "";

  const caminhosValidos =
    fotoPaths.length >= 1 &&
    fotoPaths.length <= 4 &&
    fotoPaths.every((p) => caminhoPertenceAoUsuario(p, user.id)) &&
    (!audioPath || caminhoPertenceAoUsuario(audioPath, user.id));
  if (!sessaoId || !caminhosValidos || (!audioPath && !texto)) {
    return NextResponse.json({ erro: "dados inválidos" }, { status: 400 });
  }

  const { data: sessao } = await supabase.from("sessoes_cadastro").select("id").eq("id", sessaoId).maybeSingle();
  if (!sessao) return NextResponse.json({ erro: "sessão inválida" }, { status: 400 });

  let resposta: RespostaIA;
  let iaFalhou = false;
  try {
    const fotos = await Promise.all(
      fotoPaths.map(async (p) => ({ mime: "image/jpeg", base64: await baixarBase64("produtos-fotos", p) })),
    );
    const extensao = audioPath?.split(".").pop() ?? "";
    const audio = audioPath
      ? { mime: MIME_AUDIO[extensao] ?? "audio/webm", base64: await baixarBase64("produtos-audio", audioPath) }
      : undefined;
    resposta = await gerarProduto({ fotos, audio, texto: texto || undefined });
  } catch (erro) {
    console.error("[gerar-produto] IA falhou", erro);
    iaFalhou = true;
    resposta = { ...RESPOSTA_VAZIA, descricao: texto };
  }

  const { data: produto, error: erroProduto } = await supabase
    .from("produtos")
    .insert({
      artesao_id: user.id,
      titulo: resposta.titulo || null,
      descricao: resposta.descricao || null,
      categoria_id: idDaCategoria(resposta.categoria),
      preco_centavos: resposta.preco_mencionado_centavos,
      atributos: resposta.atributos,
      entrada_texto: texto || null,
      audio_path: audioPath,
      ia_resposta: iaFalhou ? null : resposta,
    })
    .select("id")
    .single();
  if (erroProduto || !produto) {
    console.error("[gerar-produto] falha ao salvar", erroProduto);
    return NextResponse.json({ erro: "falha ao salvar" }, { status: 500 });
  }

  await supabase
    .from("produto_fotos")
    .insert(fotoPaths.map((storage_path, ordem) => ({ produto_id: produto.id, storage_path, ordem })));

  await supabase
    .from("sessoes_cadastro")
    .update({
      produto_id: produto.id,
      modo: audioPath ? "voz" : "texto",
      ia_concluida_em: new Date().toISOString(),
      ia_falhou: iaFalhou,
    })
    .eq("id", sessaoId);

  return NextResponse.json({ produtoId: produto.id, iaFalhou });
}
