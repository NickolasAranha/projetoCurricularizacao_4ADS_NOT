# Histórias de Usuário

Formato: **Como** [quem], **quero** [o quê], **para** [por quê].
Critérios de aceite no formato Dado / Quando / Então.
Ordem e prioridade: ver [`backlog.md`](backlog.md).

Personas:
- **Artesão:** produz e vende (doces, costura, madeira, artesanato, beleza). Usa principalmente o celular e o WhatsApp. Pouca familiaridade com aplicativos e com escrita de anúncios.
- **Cliente:** recebe o link do artesão, olha os produtos e faz o pedido pelo WhatsApp. Não cria conta.
- **Equipe:** acompanha os indicadores e produz o relatório.

---

## Conta

### HU01 — Criar conta com apelido e PIN
**Como** artesão, **quero** criar minha conta só com um apelido e um PIN, **para** começar sem precisar de e-mail.

- Dado que estou na tela "Criar conta", quando informo nome, apelido, WhatsApp e PIN de 6 dígitos (duas vezes) e confirmo, então minha conta é criada e entro direto no meu painel.
- Dado um apelido com acento, espaço ou maiúscula ("Dona Maria"), quando confirmo, então ele vira `dona-maria` e eu vejo como ficou o link da minha vitrine antes de confirmar.
- Dado um apelido já usado, quando confirmo, então vejo "Esse apelido já existe. Tente outro." e nada é criado.
- Dado um WhatsApp inválido ou PINs diferentes, quando confirmo, então vejo qual campo corrigir.
- Nenhum e-mail é enviado.

### HU02 — Entrar com apelido e PIN
**Como** artesão, **quero** entrar com meu apelido e PIN, **para** voltar ao meu catálogo em qualquer celular.

- Dado apelido e PIN corretos, quando entro, então vou para o meu painel e continuo conectado ao reabrir o navegador.
- Dado apelido ou PIN errado, quando entro, então vejo "Apelido ou PIN incorretos" sem dizer qual dos dois.
- Dado que não estou conectado, quando abro qualquer página do painel, então vou para a tela de entrada.
- Existe um botão "Sair" no painel.

## Cadastro de produto

### HU03 — Enviar fotos do produto
**Como** artesão, **quero** tirar ou escolher de 1 a 4 fotos, **para** mostrar o produto como ele é.

- Dado que comecei um novo produto, quando toco em "Tirar foto", então a câmera do celular abre; também posso escolher da galeria.
- Dado uma foto grande, quando ela é enviada, então o app a reduz antes do envio e mostra o progresso.
- Dado que já tenho 4 fotos, então não consigo adicionar mais; posso remover e trocar a ordem (a primeira é a capa).
- Sem nenhuma foto, não consigo avançar.
- A tela orienta a fotografar só o produto, sem rostos.

### HU04 — Descrever o produto por áudio ou texto
**Como** artesão, **quero** falar ou escrever sobre o produto do meu jeito, **para** não precisar montar o anúncio sozinho.

- Dado a tela de descrição, quando toco em "Gravar", então gravo até 60 segundos, vejo o tempo correndo e posso ouvir, regravar ou apagar.
- Dado que prefiro escrever, quando digito no campo de texto, então posso seguir sem áudio.
- Sem áudio e sem texto, o botão "Montar meu anúncio" fica desativado.
- Funciona no Chrome do Android e no Safari do iPhone.
- Se o navegador negar o microfone, vejo como liberar e o campo de texto continua disponível.

### HU05 — Gerar título, descrição e categoria com IA
**Como** artesão, **quero** que o app escreva o anúncio a partir da foto e da minha fala, **para** ter um texto bonito sem saber escrever para vender.

- Dado fotos e áudio (ou texto), quando toco em "Montar meu anúncio", então em até 45 segundos vejo título, descrição, categoria e detalhes sugeridos.
- O título tem até 60 caracteres; a categoria é uma das categorias do app.
- A IA não inventa preço, ingredientes, medidas ou materiais que eu não disse e que não aparecem na foto.
- Se eu falei o preço no áudio, ele aparece preenchido para eu conferir.
- Vejo "o que entendemos do seu áudio" (transcrição).
- Se a IA falhar ou demorar, vejo uma mensagem simples e sigo para a revisão com os campos vazios (ou com o texto que digitei), podendo preencher à mão.
- O produto fica salvo como rascunho; não aparece para clientes.

### HU06 — Revisar, digitar o preço e publicar
**Como** artesão, **quero** conferir e ajustar tudo antes de publicar, **para** ter certeza do que o cliente vai ver.

- Dado a tela de revisão, então posso editar título, descrição, categoria, detalhes e preço, e vejo as fotos.
- Sem título, categoria ou preço maior que zero, não consigo publicar e vejo o que falta.
- Quando toco em "Publicar", então o produto aparece na minha vitrine e na vitrine geral, e vejo o link dele.
- Posso sair e voltar depois: o rascunho continua no meu painel.

## Vitrines e pedidos

### HU07 — Vitrine geral com filtro por categoria
**Como** cliente, **quero** ver todos os produtos e filtrar por categoria, **para** encontrar o que procuro.

- Dado `/catalogo`, então vejo os produtos publicados com foto, título, preço e nome do artesão, os mais recentes primeiro.
- Quando escolho uma categoria, então só vejo produtos dela, e o endereço muda (`?categoria=...`) para eu poder compartilhar.
- Rascunhos e arquivados nunca aparecem.
- Funciona bem no celular.

### HU08 — Vitrine do artesão
**Como** artesão, **quero** um link só meu com meus produtos, **para** divulgar no WhatsApp e no Instagram.

- Dado `/artesao/<apelido>`, então vejo nome, cidade, bio, foto e os produtos publicados do artesão.
- Quando o link é colado no WhatsApp, então aparece a prévia com nome e foto (do artesão ou do primeiro produto).
- Apelido inexistente mostra uma página "não encontrado" com link para o catálogo.

### HU09 — Página do produto
**Como** cliente, **quero** ver os detalhes de um produto, **para** decidir a compra.

- Dado `/produto/<id>`, então vejo fotos, título, descrição, detalhes, preço e o artesão (com link para a vitrine dele).
- Posso escolher a quantidade e "Adicionar ao carrinho" ou "Comprar no WhatsApp" direto.
- Quando o link é colado no WhatsApp, então aparece a prévia com a foto e o título.

### HU10 — Carrinho agrupado por artesão
**Como** cliente, **quero** juntar vários produtos e mandar um pedido só para cada artesão, **para** não mandar várias mensagens.

- Dado itens de artesãos diferentes, então o carrinho mostra um grupo por artesão, cada um com seu subtotal.
- Posso mudar a quantidade ou remover itens.
- Quando toco em "Comprar no WhatsApp" de um grupo, então o WhatsApp abre na conversa daquele artesão com a mensagem pronta: saudação com o nome, cada item com quantidade, preço unitário e subtotal, e o total.
- Depois do envio, aquele grupo sai do carrinho e os outros ficam.
- O carrinho continua lá se eu fechar e reabrir o navegador.
- Valores em reais no formato brasileiro (R$ 1.234,56).

## Indicadores

### HU11 — Registrar visitas e cliques
**Como** equipe, **quero** saber quantos visitantes clicaram em "Comprar no WhatsApp", **para** calcular a taxa de conversão.

- Cada navegador recebe um identificador anônimo aleatório; nenhum dado pessoal do cliente é guardado.
- Abrir o catálogo, uma vitrine ou um produto registra uma visita do tipo correspondente.
- Tocar em "Comprar no WhatsApp" registra um clique com o artesão e o valor do pedido, mesmo que o WhatsApp abra em seguida.
- Ninguém consegue ler os eventos brutos pelo site; só números agregados.

### HU12 — Cronometrar o cadastro
**Como** equipe, **quero** medir quanto tempo o artesão leva do início à publicação, **para** comparar com o tempo atual.

- O cronômetro começa quando o artesão toca em "Novo produto" e termina quando ele publica.
- Também é registrado quando a IA respondeu, se ela falhou e quais campos o artesão editou na revisão.
- O artesão não vê o cronômetro (não deve sentir pressa).

### HU13 — Página de métricas
**Como** equipe, **quero** uma página com os três indicadores, **para** acompanhar o piloto e montar o relatório.

- Dado `/metricas`, então vejo: tempo médio e mediano de cadastro (geral e só com IA funcionando), taxa de abandono, visitantes, cliques e taxa de conversão (geral e por artesão), pontuação SUS média, satisfação e facilidade médias, cada um com o número de casos.
- A página é pública e mostra só números agregados.
- Os números refletem os dados desde o lançamento (inclui uso da equipe; isso é dito na página).

### HU16 — Importar respostas de usabilidade
**Como** equipe, **quero** levar as respostas do formulário Depois para o banco, **para** que a página de métricas mostre a satisfação.

- Dado o CSV exportado do Google Forms, quando a equipe roda a importação, então cada resposta vira uma linha com o código do participante, as 10 respostas SUS, a pontuação SUS calculada, satisfação e facilidade.
- Importar o mesmo arquivo duas vezes não duplica respostas.

### HU19 — Responder a avaliação no painel
**Como** artesão, **quero** responder o formulário Depois dentro do próprio painel, **para** dar minha opinião sem abrir outro link.

- Depois que publico o 1º produto, o painel mostra o convite "Conte como foi usar o catálogo", e ao lado de "Meu perfil" fica o botão "Avaliar o catálogo". Os dois somem quando eu respondo.
- A primeira tela pede o consentimento. Se eu disser "Não", nada é enviado.
- As perguntas são as mesmas do formulário Depois, na mesma ordem; a pontuação SUS é calculada pelo banco.
- Respondo uma vez só. Ninguém mais lê a minha resposta pelo site; `/metricas` mostra só as médias.

## Manutenção do catálogo

### HU14 — Editar perfil
**Como** artesão, **quero** colocar minha cidade, uma frase sobre mim e uma foto, **para** que minha vitrine fique com a minha cara.

- Dado `/painel/perfil`, então edito nome, WhatsApp, cidade, bio (até 280 caracteres) e foto.
- Quando salvo, então a vitrine mostra as mudanças.

### HU15 — Editar e arquivar produto
**Como** artesão, **quero** corrigir ou tirar do ar um produto, **para** manter o catálogo certo.

- Dado um produto no meu painel, quando toco em "Editar", então abro a mesma tela de revisão e salvo as mudanças.
- Quando toco em "Tirar do ar", então ele some das vitrines e fica no painel como arquivado; posso publicar de novo.
- Editar não conta como novo cadastro nos indicadores.
- Quando toco em "Excluir" e confirmo na tela, o produto some de vez, com as fotos e o áudio. O tempo de cadastro já medido continua nos indicadores.
