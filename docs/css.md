# css/main.css

Arquivo único de estilos. Tokens → reset → layout → componentes → páginas → acessibilidade.

## Estrutura de seções

| Seção | Conteúdo |
|---|---|
| 1. Tokens | Variáveis CSS: cores, tipografia, espaçamento, sombras, layout |
| 2. Reset | Normalização cross-browser |
| 3. Layout | App shell (topbar + sidebar + main), grid principal |
| 4. Topbar e Sidebar | Navegação persistente |
| 5. Componentes base | `.btn`, `.badge`, `.card`, `.feedback-*`, `.meta-tag` |
| 6. Home | `.page-home`, hero, cards de matéria, seção conquistas |
| 7. Navegador | `.page-navegador`, seletores, trilha de estrelas |
| 8. Atividade | `.page-atividade`, motor, dica, painel professor |
| 9. Motores | Marcar, ordenar, arrastar, escrever, Paint (canvas) |
| 10. Mascote Lua | SVG + animações CSS dos 4 estados |
| 11. Conquistas | Emblemas e sistema de engajamento |
| 12. Acessibilidade | Temas escuro e alto contraste, fonte grande |
| 13. Toasts | `#toast-container`, `.toast-*`, animação slide-in |
| 14. Planos de aula | Dois painéis, formulário, preview do documento, `@media print` |
| 15. Guia do professor | Sidebar sticky, cards de atividade, meta-tags, callouts |

## Tokens principais

```css
--color-primary:  #2d3a8c   /* indigo — ação principal */
--color-accent:   #b5742a   /* ocre — destaques secundários */
--color-ok:       #1a6b3a   /* verde — acerto */
--color-err:      #8c1a1a   /* vermelho — erro */
--color-warn:     #7a5a00   /* âmbar — aviso */
--font-serif:     'Playfair Display'
--font-body:      'Source Serif 4'
--font-ui:        'DM Sans'
--font-mono:      'JetBrains Mono'
--sidebar-w:      220px
```

## Temas de acessibilidade

Aplicados como classes no `<html>` por `a11y.applyAll()`:

- `.fonte-grande` — aumenta escala de tipo base
- `.alto-contraste` — inverte fundos, aumenta contraste de bordas e texto
- `.tema-escuro` — paleta escura completa

## Print

`@media print` na seção de Planos esconde formulário e topbar, formata `.plano-doc` em A4. `print-color-adjust: exact` preserva fundos coloridos (ex.: título de seção preto).

## Responsividade

Breakpoints principais: `960px` (planos: coluna única), `860px` (guia: sidebar horizontal), `768px` (layout geral), `480px` (toasts full-width).
