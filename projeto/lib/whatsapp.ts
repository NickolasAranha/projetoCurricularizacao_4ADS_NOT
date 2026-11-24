import { formatarReais } from "./dinheiro";
import type { GrupoCarrinho } from "./carrinho";

export function normalizarWhatsapp(texto: string): string | null {
  const digitos = texto.replace(/\D/g, "");
  if (digitos.length === 10 || digitos.length === 11) return `55${digitos}`;
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith("55")) return digitos;
  return null;
}

export function montarMensagemPedido(grupo: GrupoCarrinho): string {
  const linhas = grupo.itens.map((item) => {
    const unitario = formatarReais(item.precoCentavos);
    const subtotal = formatarReais(item.precoCentavos * item.quantidade);
    const preco = item.quantidade > 1 ? `${unitario} cada` : unitario;
    return `- ${item.quantidade}x ${item.titulo} (${preco}) = ${subtotal}`;
  });
  return [
    `Olá, ${grupo.artesao.nome}! Vi seu catálogo e quero fazer um pedido:`,
    ...linhas,
    `Total: ${formatarReais(grupo.totalCentavos)}`,
  ].join("\n");
}

export function linkWhatsapp(numero: string, mensagem: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
