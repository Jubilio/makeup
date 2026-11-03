# Regras de design da Aneka Shop

Seis regras para todos os ecrãs (loja e administração). Os tokens de cor estão em
`src/app/globals.css`, com modo claro e escuro (`prefers-color-scheme`).

1. **Contraste 4.5:1** em texto normal, nos dois temas. Use `--text`, `--muted`,
   `--accent`, `--ok`, `--warn`, `--err`. O verde do WhatsApp é `--wa` com `--wa-ink`.
   As cores das categorias (`.art-*`) têm o primeiro tom escuro o suficiente para texto branco.
   Não baixe o contraste com `opacity` em texto.
2. **Espaços só da escala**: 8, 16, 24, 32, 40, 48. 4 e 12 só dentro de um componente.
3. **Dois pesos de fonte**: 400 e 700. Hierarquia com tamanho, cor e maiúsculas pequenas.
4. **Botões de 48px** (`.btn`) e **toque de 44px** em links soltos, chips, campos e selects.
   Links dentro de uma frase podem ser menores.
5. **Um botão principal por ecrã** (`.btn.primary`). O resto é `.btn` (fundo da cor de
   destaque a 8%) ou `.link-btn`. Chips selecionados não contam.
6. **Sem texto em gradiente e sem etiquetas com borda.** `.badge` e `.tag` usam só fundo tingido.

## Como verificar

Corra `npm run dev`, abra cada ecrã a 360px com toque emulado nos modos claro e escuro,
injete `axe-core` com `runOnly: ['color-contrast']` e conte os elementos tocáveis menores
que 44x44 e os `.btn.primary` visíveis. O axe não mede texto sobre gradiente nem botões
desativados: confira esses à mão.
