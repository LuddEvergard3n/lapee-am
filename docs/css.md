# css/main.css

Arquivo unico de estilos. 3659 linhas. Tokens → reset → layout → componentes → paginas → a11y.

## Secoes

| Secao | Conteudo |
|---|---|
| 1. Tokens | Variaveis CSS: cores, tipografia, espacamento, sombras, layout |
| 2. Tema escuro | `.tema-escuro` — paleta escura completa |
| 3. Alto contraste | `.alto-contraste` — WCAG AA/AAA |
| 4. Combinado | `.alto-contraste.tema-escuro` — TODAS as variaveis redefinidas (fundo preto, texto branco) |
| 5. Fonte grande | `.fonte-grande` — escala 120% |
| 6. Reset e base | Normalizacao cross-browser |
| 7. Layout | App shell (topbar + sidebar + main), grid principal |
| 8–11 | Topbar, sidebar, navegacao, breadcrumb |
| 12–14 | Componentes base: botoes, badges, cards, feedback |
| 15–18 | Paginas: home, navegador, atividade |
| 19–25 | Motores: marcar, ordenar, arrastar, escrever, Paint |
| 26 | Mascote Lua (SVG + 4 estados CSS) |
| 27 | Conquistas e emblemas |
| 28 | Toasts (notificacoes) |
| 29 | Planos de aula (dois paineis, formulario, preview, @media print) |
| 30 | Guia do Professor (sidebar sticky, cards de atividade) |
| 31 | Gerador de atividades (layout dois paineis, folha imprimivel) |
| 32 | Caca-palavras (.caca-*) |
| 33 | Palavras cruzadas (.cruzadas-*) |

## Tokens principais

```css
--color-primary:  #2d3a8c   /* indigo — acao principal */
--color-accent:   #b5742a   /* ocre — destaques */
--color-ok:       #1a6b3a   /* verde — acerto */
--color-err:      #8c1a1a   /* vermelho — erro */
--font-serif:     'Playfair Display'
--font-body:      'Source Serif 4'
--font-ui:        'DM Sans'
--font-mono:      'JetBrains Mono'
--sidebar-w:      220px
--topbar-h:       56px
```

## BUG HISTORICO CORRIGIDO: alto-contraste + tema-escuro

O bloco `.alto-contraste.tema-escuro` deve redefinir TODAS as variaveis de cor,
nao apenas um subconjunto. Se redefinir so algumas, as demais herdam do
`.alto-contraste` (fundo branco + texto preto) e o resultado e texto preto sobre
fundo preto. O bloco atual esta correto e completo.

## @media print

Esconde formulario, sidebar, topbar e toasts. Formata `.plano-doc` e `.gerador-doc`
em A4 (padding 1.5cm 2cm, font-size 10pt). `print-color-adjust: exact` preserva
fundos coloridos.

## Responsividade

| Breakpoint | O que muda |
|---|---|
| 960px | Planos: coluna unica |
| 900px | Gerador: coluna unica |
| 860px | Guia: sidebar horizontal |
| 768px | Layout geral |
| 480px | Toasts full-width |
