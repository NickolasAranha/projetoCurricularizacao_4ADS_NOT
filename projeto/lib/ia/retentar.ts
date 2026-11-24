// Repete chamadas à IA quando a falha é passageira (rede instável ou serviço sobrecarregado).

const CODIGOS_DE_REDE = new Set([
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_SOCKET",
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "ENOTFOUND",
]);
const STATUS_PASSAGEIROS = new Set([429, 500, 502, 503, 504]);

export function erroTransitorio(erro: unknown): boolean {
  if (!erro || typeof erro !== "object") return false;
  const e = erro as { name?: string; status?: number; cause?: { code?: string } };
  if (e.name === "AbortError") return false;
  if (typeof e.status === "number") return STATUS_PASSAGEIROS.has(e.status);
  return Boolean(e.cause?.code && CODIGOS_DE_REDE.has(e.cause.code));
}

type Opcoes = { tentativas: number; esperaMs: number; sinal?: AbortSignal };

export async function comRetentativa<T>(tarefa: () => Promise<T>, { tentativas, esperaMs, sinal }: Opcoes): Promise<T> {
  for (let tentativa = 1; ; tentativa++) {
    try {
      return await tarefa();
    } catch (erro) {
      if (tentativa >= tentativas || sinal?.aborted || !erroTransitorio(erro)) throw erro;
      console.warn(`[ia] tentativa ${tentativa} falhou, tentando de novo`);
      await new Promise((r) => setTimeout(r, esperaMs * tentativa));
    }
  }
}
