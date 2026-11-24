export function pontuacaoSus(respostas: number[]): number {
  if (respostas.length !== 10) throw new Error("O SUS tem 10 respostas");
  if (respostas.some((r) => !Number.isInteger(r) || r < 1 || r > 5)) throw new Error("Notas do SUS vão de 1 a 5");
  const soma = respostas.reduce((total, nota, i) => total + (i % 2 === 0 ? nota - 1 : 5 - nota), 0);
  return soma * 2.5;
}
