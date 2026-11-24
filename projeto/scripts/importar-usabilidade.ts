// Importa as respostas do formulário Depois (CSV exportado do Google Forms) para a tabela respostas_usabilidade.
// Uso (dentro de projeto/): npx tsx scripts/importar-usabilidade.ts caminho/do/arquivo.csv
// Lê NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY de .env.local.

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { respostasDoCsv } from "../lib/usabilidade";

const arquivo = process.argv[2];
if (!arquivo) {
  console.error("Informe o arquivo CSV. Ex.: npx tsx scripts/importar-usabilidade.ts ../evidencias/dados/depois_respostas.csv");
  process.exit(1);
}

try {
  process.loadEnvFile(".env.local");
} catch {
  // Variáveis podem vir do ambiente.
}

const respostas = respostasDoCsv(readFileSync(arquivo, "utf8"));
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

const { error } = await supabase.from("respostas_usabilidade").upsert(respostas, { onConflict: "participante" });
if (error) {
  console.error("Falha ao importar:", error.message);
  process.exit(1);
}

console.log(`${respostas.length} resposta(s) importada(s):`);
for (const r of respostas) console.log(`  ${r.participante}: SUS ${r.sus_pontuacao}`);
