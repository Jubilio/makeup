# DESIGN.md · Aneka Shop

A linguagem visual da loja, num só ficheiro: tokens, regras e o porquê. Os valores vivem em
`src/app/globals.css`; as regras de acessibilidade em `docs/DESIGN_RULES.md`. Formato inspirado no
DESIGN.md (getdesign.md); orientação tirada de taste-skill, ui-ux-pro-max e design-motion-principles,
adaptada a esta loja.

## 1. Tema e ambiente

Loja de perfumes e cuidados INUKA em Maputo. Quente, cuidada, de confiança, nunca "barata".
O azul claro da marca (o mesmo do assistente Typebot) e o azul-marinho do texto dão um tom limpo e de
confiança; o resto é calmo para que as fotos dos produtos sejam o que se vê primeiro. Modo claro e escuro.

## 2. Cores e papéis

| Token | Claro | Escuro | Papel |
|---|---|---|---|
| `--bg` | #f5f9fc | #0f1526 | Fundo da página |
| `--surface` | #ffffff | #172036 | Cartões, cabeçalho, formulários |
| `--surface-2` | #e6f1f9 | #1d2840 | Rodapé e zonas em segundo plano |
| `--text` | #1a2249 | #eaf2fa | Todo o texto corrido |
| `--muted` | #52607a | #a7b6c9 | Só notas secundárias (tamanho, quantidade) |
| `--accent` | #006da8 | #4cc3f5 | Ação principal, links, página atual |
| `--wa` / `--wa-ink` | #157a43 / branco | #3fcf7f / #0f1f16 | Só o botão do WhatsApp |
| `--ok` `--warn` `--err` | | | Estados |
| Azul muito claro | #e0edff | | Ícones sobre as cores das categorias |

Um fundo, uma tinta, um destaque. Superfícies separam-se por um passo de tom, não por linhas nem
sombras. As cores de categoria (`.art-*`) são campos planos em tons de azul e azul-petróleo, escuros o
suficiente para texto branco (5.5:1 ou mais).

## 3. Tipografia

- Texto: fonte do sistema (`system-ui`), 16px, entrelinha 1.5. Títulos de marca: Georgia (serifa),
  só no nome da loja (cabeçalho e rodapé).
- Pesos: só 400 e 700.
- Escala: `h1` fluido de 32 a 56px (tracking -0.02em, entrelinha 1.05), `h2` de 22 a 32px,
  texto 16–18px, notas 14px. Títulos equilibrados (`text-wrap: balance`).
- Sem rótulos pequenos em maiúsculas por cima dos títulos.

## 4. Componentes

- **Botões:** pílula, cor plana, 48px de altura. `.btn.primary` só uma vez por ecrã; `.btn` é o
  secundário (destaque a 8%). Ao premir: `scale(0.97)`.
- **Menu:** barra simples na cor da superfície, logótipo + nome, dois links em pílula; a página atual
  fica tingida. No telemóvel o carrinho é só o ícone com o número.
- **Cartões de produto:** foto quadrada, nome, tamanho e opções, preço a negrito. Sem borda.
- **Cartões de categoria:** campo de cor plano, ícone azul muito claro de traço fino, nome e contagem.
- **Filtros (chips):** pílula com borda (é um controlo), ícone na cor de destaque.
- **Etiquetas:** só fundo tingido, sem borda.
- **Rodapé:** o nome da loja volta em grande, em azul, sobre `--surface-2`.

## 5. Layout

- Margens de 16px, largura máxima 1100px.
- Espaços só da escala 4/8/12/16/24/32/40/48 (e 96 entre secções no ecrã grande).
- Mais perto quer dizer mesmo grupo: dentro de uma secção os espaços são muito menores que entre secções.

## 6. Profundidade

Sem sombras em repouso, sem vidro (blur) e sem gradientes. A elevação faz-se com o tom
(`--bg` → `--surface` → `--surface-2`). O único gradiente é o do logótipo, que é da marca.

## 7. Fazer e não fazer

Fazer: contraste 4.5:1 nos dois temas; texto corrido na cor da tinta; ícones SVG com `aria-hidden`;
um botão principal por ecrã; alvos de toque de 44px.

Não fazer: texto em gradiente, sombras e brilhos em repouso, linhas finas a separar blocos, emoji como
ícones, numeração decorativa (01 / 02), texto cinzento para conteúdo principal, inventar avaliações
ou números de vendas.

## 8. Responsivo e movimento

- Pensado primeiro para 360px; sem scroll lateral a partir de 320px.
- Movimento (e-commerce: polido e discreto): curva `--ease-out` cubic-bezier(0.23, 1, 0.32, 1),
  160ms para cor e pressão, 240ms para entradas.
  - Botões: escurecem ao passar e encolhem ao premir.
  - Cartões: sobem 4px ao passar, só em aparelhos com rato (`hover: hover`).
  - Avisos ("Adicionado"): entram com opacidade, subida de 8px e desfoque leve.
  - Número do carrinho: aparece com um pequeno salto de escala (de 0.9) sempre que muda.
- Só `transform`, `opacity` e `filter`. Com `prefers-reduced-motion`, nada se desloca.

## 9. Pedidos para agentes

- "Novo ecrã da loja seguindo o DESIGN.md: um `h1` claro, um só `.btn.primary`, superfícies por tom,
  sem bordas nem sombras, e mede contraste e alvos de toque a 360px nos dois temas."
- "Revê este ecrã contra o DESIGN.md e `docs/DESIGN_RULES.md` e lista o que falha, com medições."
