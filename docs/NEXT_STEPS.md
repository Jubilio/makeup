# Aneka Shop: próximos passos

Guia prático para pôr a loja no ar e para o dia a dia. A loja vende os produtos
do catálogo INUKA 2026, recebe pedidos pelo WhatsApp (258 84 841 2271) e tem uma
área de gestão de estoque em `/admin`.

## 1. Pôr a loja no ar (uma vez)

A base de dados de estoque **já está criada** no Cloudflare (D1 `aneka-shop`,
com as tabelas prontas). Falta ligar o código ao Cloudflare:

1. Abra o painel do Cloudflare → **Workers & Pages** → **Create** →
   **Import a repository** e escolha `Jubilio/makeup`.
2. Preencha:
   - Project name: `aneka-shop` (tem de ser igual ao `name` do `wrangler.jsonc`)
   - Production branch: `main`
   - Build command: `npx opennextjs-cloudflare build`
   - Deploy command: `npx opennextjs-cloudflare deploy`
3. Depois do primeiro deploy, vá a **Settings → Variables and Secrets** do
   worker `aneka-shop` e adicione dois **Secrets**:
   - `ADMIN_PASSWORD`: a senha para entrar em `/admin`
   - `SESSION_SECRET`: um texto longo e aleatório (por exemplo 40 letras e números)
4. Faça **Retry deployment** (ou envie um novo commit) para aplicar os segredos.
5. Abra o endereço `https://aneka-shop.<sua-conta>.workers.dev` e teste um pedido.
   Para usar um domínio próprio: **Settings → Domains & Routes → Add**.

A partir daqui, cada alteração enviada para `main` publica a loja sozinha.

## 2. Primeiro dia: carregar o estoque

1. Entre em `/admin` com a senha.
2. Procure cada produto que tem em mãos, toque nele, escolha **Contagem** e
   escreva a quantidade que contou. Repita para cada fragrância/cor.
3. Ajuste o **Avisar quando tiver** (por defeito 2) nos produtos que vendem mais.

Variantes que nunca foram registadas aparecem na loja como disponíveis
("sob consulta"). Só ficam "esgotado" depois de registadas com 0.

## 3. Dia a dia

| Situação | O que fazer em `/admin` |
|---|---|
| Chegou mercadoria | Produto → **Entrada** → quantidade (nota: fornecedor) |
| Cliente confirmou pedido no WhatsApp | Para cada item → **Venda** → quantidade (nota: nome do cliente) |
| Contou as prateleiras e não bate | Produto → **Contagem** → quantidade real |
| Ver o que precisa de repor | Filtro **Stock baixo** |
| Ver vendas | Cartões de vendas de hoje e do mês, e **Histórico** |

## 4. Mudar o catálogo

Os produtos estão em `scripts/build_catalog.py` (gerado para
`data/catalogo.json` e `data/catalogo.csv`).

- **Mudar um preço:** altere o número na linha do produto e corra
  `python3 scripts/build_catalog.py`.
- **Novo produto ou nova fragrância:** acrescente uma linha `add(...)` (ou um nome
  na lista de variantes) e corra o mesmo comando.
- **Nova foto:** guarde-a em `public/produtos/<id-do-produto>.webp` (quadrada,
  cerca de 640×640). O `id` está em `data/catalogo.json`.
- **Nova revista:** atualize `build_catalog.py` e as caixas de recorte em
  `scripts/crop_images.py`, depois `python3 scripts/crop_images.py revista.pdf`.

Não mude o nome de uma variante que já tem estoque: o estoque está ligado ao
SKU (`id-do-produto--variante`). Se precisar, registe Contagem 0 na antiga e
Contagem na nova.

## 5. Ainda por confirmar no catálogo

Procure `CONFIRMAR` e `SEM PREÇO` em `scripts/build_catalog.py`:

- Lipstick Removing Oil sem preço na revista.
- Fragrâncias da loção e gel de banho Classic (assumidas iguais às do perfume).
- Preço do verniz Metallic (assumido 450 MT) e cores do lápis de olhos gel.
- Youth Collection aparece como "Brevemente" até ser lançada (tire a nota
  "Coming soon" para a pôr à venda).

## 6. Ideias para depois

- Pagamento M-Pesa / e-Mola no carrinho.
- Registar a venda automaticamente quando o pedido do WhatsApp é confirmado.
- Fotos próprias dos produtos e domínio próprio (ex.: anekashop.co.mz).
- Relatório mensal de vendas por produto.

## Comandos úteis (para quem programa)

```bash
npm install
cp .dev.vars.example .dev.vars        # senha local de teste
npm run db:migrate:local              # cria a base de dados local
npm run dev                           # http://localhost:3000
npm run preview                       # testa como no Cloudflare
npm run db:migrate                    # aplica novas migrações na base de dados real
```
