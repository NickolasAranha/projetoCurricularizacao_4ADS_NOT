# Catálogo Digital para Pequenos Produtores e Artesãos

Projeto de extensão (curricularização). É um site em que o artesão cadastra os produtos tirando uma foto e falando um áudio. A IA (Gemini) monta o anúncio e o cliente faz o pedido pelo WhatsApp.

Tecnologias: Next.js 16 + React 19 + Tailwind, Supabase (banco Postgres, login e armazenamento das fotos) e Gemini para a IA. O deploy é na Vercel.

## Como rodar na sua máquina

```bash
cd projeto
npm install
cp .env.example .env.local   # preencha as chaves (peça pra quem tem acesso ao Supabase/Gemini)
npm run dev                  # abre em http://localhost:3000
npm test                     # roda os testes
```

> O Next.js deste projeto é a versão 16, que mudou bastante coisa. Antes de mexer em rotas, layouts ou no `proxy.ts`, dá uma olhada na documentação em `projeto/node_modules/next/dist/docs/`.

## O que tem em cada pasta

```
.
├── ATIVIDADE_DE_EXTENSÃO_MÓDULO_01.pdf   enunciado da atividade
├── evidencias/                           material da pesquisa com os artesãos
└── projeto/                              o site (código)
```

### `evidencias/`

| Pasta | O que tem |
|---|---|
| `formularios/` | Formulário aplicado antes, formulário aplicado depois e o termo de consentimento |
| `dados/` | Respostas exportadas dos formulários (CSV). Fica vazia no git |

### `projeto/`

| Pasta / arquivo | O que tem |
|---|---|
| `backlog.md` | Lista de tarefas em ordem, com prioridade e tamanho |
| `historias_de_usuario.md` | Histórias de usuário e critérios de aceite |
| `.env.example` | Modelo das variáveis de ambiente (copie para `.env.local`) |
| `proxy.ts` | Roda antes das páginas do painel e da API e mantém o login do artesão (no Next 16 isso se chama *proxy*, antes era *middleware*) |
| `app/` | As páginas do site. Cada pasta é uma URL (veja abaixo) |
| `components/` | Pedaços de tela reutilizáveis |
| `lib/` | Regras e funções sem tela: carrinho, WhatsApp, dinheiro, IA, acesso ao banco |
| `supabase/migrations/` | Scripts SQL que criam o banco, em ordem numérica |
| `scripts/` | Scripts que a gente roda na mão pelo terminal |
| `tests/` | Testes automáticos (Vitest) |

### `projeto/app/` — páginas

| Pasta | URL | O que é |
|---|---|---|
| `page.tsx` | `/` | Página inicial |
| `catalogo/` | `/catalogo` | Todos os produtos, com filtro por categoria |
| `artesao/[slug]/` | `/artesao/dona-maria` | Vitrine de um artesão |
| `produto/[id]/` | `/produto/...` | Página de um produto |
| `carrinho/` | `/carrinho` | Carrinho, separado por artesão, com o botão de pedir no WhatsApp |
| `criar-conta/`, `entrar/` | | Cadastro e login do artesão (apelido + PIN) |
| `painel/` | `/painel` | Área do artesão: lista de produtos |
| `painel/novo/` | | Cadastrar produto (foto + áudio → IA) |
| `painel/produtos/[id]/revisar/` | | Revisar e ajustar o anúncio que a IA gerou |
| `painel/perfil/` | | Editar nome, WhatsApp e foto |
| `metricas/` | `/metricas` | Indicadores do projeto (tempo de cadastro, conversão, usabilidade) |
| `api/gerar-produto/` | | Endpoint que manda foto/áudio pro Gemini e devolve o anúncio |

Arquivos que se repetem nas pastas: `page.tsx` é a tela, `acoes.ts` são as *server actions* (o que acontece quando um formulário é enviado), `loading.tsx` é a tela de carregamento e `not-found.tsx` é a página de 404.

### `projeto/components/`

| Pasta | O que tem |
|---|---|
| (raiz) | `Cabecalho`, `Rodape` e `RegistrarVisita` (conta as visitas para as métricas) |
| `captura/` | Fluxo de cadastrar produto: escolher fotos, gravar áudio, tela de "IA montando o anúncio" |
| `carrinho/` | Botões de adicionar e comprar no WhatsApp, lista do carrinho, quantidade. O carrinho fica no navegador |
| `conta/` | Formulários de criar conta e entrar |
| `painel/` | Formulário de perfil, formulário de revisão do anúncio, lista de produtos do artesão |
| `vitrine/` | Cartão de produto, filtro de categorias, esqueleto de carregamento |

### `projeto/lib/`

| Arquivo | Para que serve |
|---|---|
| `supabase/` | Clientes do Supabase: `navegador.ts` (no browser), `servidor.ts` (no servidor, com o login do usuário), `admin.ts` (no servidor, com acesso total — cuidado) |
| `ia/` | Integração com o Gemini: `prompt.ts` (o que pedimos), `esquema.ts` (formato da resposta), `gerar.ts` (a chamada), `retentar.ts` (tenta de novo se a rede falhar) |
| `whatsapp.ts` | Normaliza o número e monta a mensagem e o link `wa.me` do pedido |
| `carrinho.ts` | Regras do carrinho (agrupar por artesão, somar total) |
| `dinheiro.ts` | Preço em centavos ↔ "R$ 12,50" |
| `eventos.ts` | Registra visitas e cliques no WhatsApp para as métricas |
| `kpi.ts`, `usabilidade.ts` | Cálculo dos indicadores e da nota SUS do formulário |
| `imagem.ts`, `fotos.ts`, `storage.ts` | Reduzir o tamanho das fotos antes do envio, limitar a 4 por produto e montar o link público da foto no Supabase Storage |
| `audio.ts` | Escolhe o formato de gravação que o navegador suporta (webm, m4a ou ogg) |
| `apelido.ts` | Transforma "Dona Maria" em `dona-maria` |
| `consultas.ts` | Consultas ao banco usadas pelas páginas |
| `tipos.ts`, `categorias.ts` | Tipos do TypeScript e lista de categorias |
| `caminhos.ts`, `campos-editados.ts`, `produto-privado.ts` | Funções auxiliares do cadastro e da revisão de produto |

### `projeto/supabase/migrations/`

São os arquivos SQL que montam o banco. Rode na ordem (`0001`, `0002`, …) e **nunca edite uma migração antiga**: se precisar mudar algo, crie uma nova com o próximo número.

| Arquivo | O que faz |
|---|---|
| `0001_schema.sql` | Tabelas e categorias iniciais |
| `0002_rls.sql` | Regras de acesso: cada artesão só mexe nos próprios dados |
| `0003_storage.sql` | Pastas (buckets) das fotos |
| `0004_kpis.sql` | Funções que calculam os indicadores |
| `0005` a `0007` | Ajustes de usabilidade, privacidade e permissões |

### `projeto/scripts/`

| Arquivo | Uso |
|---|---|
| `verificar-ia.mjs` | Testa se o modelo do Gemini aceita foto + áudio e devolve JSON |
| `importar-usabilidade.ts` | Importa o CSV do formulário "Depois" para o banco: `npx tsx scripts/importar-usabilidade.ts arquivo.csv` |

### `projeto/tests/`

Um arquivo de teste para cada arquivo de `lib/` (ex.: `whatsapp.test.ts` testa `lib/whatsapp.ts`). A pasta `tests/sql/` roda as migrações num Postgres em memória (PGlite) e testa as regras de acesso e os indicadores, sem precisar do Supabase de verdade. Rode tudo com `npm test`.
