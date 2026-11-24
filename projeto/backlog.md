# Product Backlog — Catálogo Digital para Pequenos Produtores e Artesãos

Forma de trabalho: uma pessoa com apoio de IA, executando os itens na ordem. Sem sprints fixas: quando um item fica pronto, entra em produção e o próximo começa.
Histórias e critérios de aceite: [`historias_de_usuario.md`](historias_de_usuario.md).

## Como ler

- **Prioridade:** P0 = sem isso os artesãos não conseguem usar; P1 = necessário para medir e entregar; P2 = melhora a experiência; P3 = se sobrar tempo.
- **Tamanho:** P (poucas horas), M (meio dia a um dia), G (mais de um dia).

## Itens

| Ordem | ID | Item | História | Prioridade | Tamanho |
|---|---|---|---|---|---|
| 1 | T01 | Verificar o Gemini 4 Hydrogen na conta gratuita: nome do modelo, áudio (webm e mp4), imagem, saída JSON estruturada. Se falhar, escolher outro modelo Gemini | — | P0 | P |
| 2 | T02 | Criar projeto Next.js + Tailwind, projeto Supabase e deploy inicial na Vercel com variáveis de ambiente | — | P0 | P |
| 3 | T03 | Migrações do banco: tabelas, seed de categorias, RLS, buckets do Storage | — | P0 | M |
| 4 | H01 | Criar conta com apelido e PIN | HU01 | P0 | P |
| 5 | H02 | Entrar com apelido e PIN | HU02 | P0 | P |
| 6 | H03 | Enviar fotos do produto | HU03 | P0 | M |
| 7 | H04 | Descrever o produto por áudio ou texto | HU04 | P0 | M |
| 8 | H05 | Gerar título, descrição e categoria com IA | HU05 | P0 | M |
| 9 | H06 | Revisar, digitar o preço e publicar | HU06 | P0 | M |
| 10 | H07 | Vitrine geral com filtro por categoria | HU07 | P0 | M |
| 11 | H08 | Vitrine do artesão com link próprio e prévia no WhatsApp | HU08 | P0 | M |
| 12 | H09 | Página do produto | HU09 | P0 | P |
| 13 | H10 | Carrinho agrupado por artesão com pedido pelo WhatsApp | HU10 | P0 | M |
| 14 | H11 | Registrar visitas e cliques no WhatsApp | HU11 | P1 | P |
| 15 | H12 | Cronometrar o cadastro | HU12 | P1 | P |
| 16 | T04 | Direção visual "feira artesanal": paleta, tipografia, componentes base, página inicial | — | P1 | M |
| 17 | H13 | Página de métricas | HU13 | P1 | M |
| 18 | H14 | Editar perfil (cidade, bio, foto) | HU14 | P1 | P |
| 19 | H15 | Editar e arquivar produto publicado | HU15 | P2 | P |
| 20 | E01 | Formulário Depois no Google Forms + termo de consentimento | — | P1 | P |
| 21 | H16 | Importar respostas de usabilidade (CSV) | HU16 | P1 | P |
| 22 | T05 | Revisão de texto e visual de todas as telas (limpeza de excessos) | — | P2 | P |
| 23 | E02 | Análise dos dados e gráficos comparativos | — | P1 | M |
| 24 | E03 | Relatório ABNT preenchido | — | P1 | M |
| 25 | T06 | Testes automatizados das regras (mensagem do WhatsApp, apelido, KPIs) | — | P2 | P |
| 26 | H17 | Mais de um produto na mesma mensagem a partir da vitrine do artesão (atalho) | HU10 | P3 | P |
| 27 | H18 | Compartilhar link da vitrine pelo painel (botão "copiar link") | HU08 | P3 | P |

## Marcos

1. **Artesão consegue publicar** (itens 1–9): a partir daqui os artesãos do piloto já podem cadastrar.
2. **Cliente consegue pedir** (itens 10–15): a partir daqui o link pode ir para clientes reais. Os KPIs passam a ser registrados.
3. **Entregável acadêmico** (itens 16–24): métricas visíveis, formulário Depois aplicado, relatório pronto.

## Riscos

| Risco | Efeito | Resposta |
|---|---|---|
| Hydrogen não aceita áudio do iPhone/Android ou não está no plano gratuito | Cadastro por voz trava | T01 primeiro; troca de modelo já aprovada; texto sempre disponível |
| Limite de requisições do plano gratuito | IA falha em horário de pico | Cair na revisão manual com mensagem amigável |
| Pouco tráfego de clientes | Taxa de conversão com n pequeno | Artesãos divulgam o link desde o marco 2; relatório informa o n |
