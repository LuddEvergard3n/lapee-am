# css/main.css — Documentação Técnica

**Localização:** `css/main.css`

## Estrutura do arquivo

O arquivo é único e organizado em seções numeradas por comentários:

| Seção | Conteúdo |
|---|---|
| 1. Tokens e variáveis | Todas as variáveis CSS (`--color-*`, `--font-*`, `--space-*`, etc.) |
| 2. Tema escuro | Sobrescreve variáveis para `html.tema-escuro` |
| 3. Alto contraste | Sobrescreve variáveis para `html.alto-contraste` |
| 4. Fonte grande | `font-size: 120%` em `html.fonte-grande` |
| 5. Reset e base | Normalize, tipografia base, links, headings |
| 6. Layout principal | Grid do app-shell, topbar, sidebar, conteúdo principal |
| 7. Botões | `.btn`, variantes (primary, secondary, lg, sm, toggle) |
| 8. Badges | `.badge`, variantes de nível (n1, n2, n3) e palavra |
| 9. Cards | Base `.card`, cards de componente, cards de unidade |
| 10. Home | Hero, cards de componente, seção "como funciona" |
| 11. Navegador | Selects de filtro, cards de unidade, links de nível |
| 12. Atividade | Topbar de nível, enunciado, DUA, motores, modo professor |
| 13. Sobre | Layout editorial da página Sobre |
| 14. Acessibilidade | Controles de prefs, tabela de atalhos |
| 15. Utilitários | `.hidden` |
| 16. Responsividade | Mobile (max 768px) e pequenos (max 480px) |
| 17. Print | Oculta navegação, preserva conteúdo |

## Sistema de tokens

Todas as cores, tamanhos e espaçamentos são definidos como variáveis CSS em `:root`.
Nenhum valor hardcoded aparece nos componentes — tudo referencia um token.

### Paleta principal

| Token | Valor (tema claro) | Uso |
|---|---|---|
| `--color-ink` | `#1a1a2e` | Texto principal |
| `--color-ink-soft` | `#3d3d5c` | Texto secundário |
| `--color-ink-muted` | `#6b6b8a` | Labels, metadados |
| `--color-bg` | `#f8f7f2` | Fundo do body |
| `--color-bg-alt` | `#eeeee6` | Fundos de seções internas |
| `--color-surface` | `#ffffff` | Cards, sidebar, topbar |
| `--color-border` | `#d4d4c8` | Bordas e divisores |
| `--color-primary` | `#2d3a8c` | Ações principais, links |
| `--color-accent` | `#b5742a` | Modo professor, badges CBTC |

### Níveis

| Token | Cor | Usado em |
|---|---|---|
| `--color-n1` | Indigo médio | Badge N1, borda de atividade de apoio |
| `--color-n2` | Verde floresta | Badge N2 |
| `--color-n3` | Terracota | Badge N3 |

## Fontes

| Token | Stack | Uso |
|---|---|---|
| `--font-serif` | Playfair Display, Georgia, serif | Títulos (h1, h2, h3) |
| `--font-body` | Source Serif 4, Georgia, serif | Corpo de texto |
| `--font-mono` | JetBrains Mono, Courier New | Códigos BNCC, CBTC, contadores |
| `--font-ui` | DM Sans, system-ui, sans-serif | Botões, labels, navegação |

As fontes Google são carregadas de forma não-bloqueante via `media="print" onload`.
Em caso de falha de rede, os fallbacks de sistema garantem legibilidade completa.

## Layout

O layout usa CSS Grid de dois níveis:

```
app-shell (grid: topbar / sidebar + main)
  └── topbar (flex)
  └── sidebar (sticky, position fixed em mobile)
  └── main-content (scroll independente)
        └── .page-* (max-width: 820px, centrado)
```

Em mobile (< 768px):
- Grid colapsa para coluna única.
- Sidebar vira drawer posicionada com `position: fixed` e `transform: translateX(-100%)`.
- Classe `.open` aplica `transform: translateX(0)`.

## Temas

Os temas funcionam por sobrescrita de variáveis CSS no seletor raiz:

```css
html.tema-escuro { --color-bg: #12121e; ... }
html.alto-contraste { --color-bg: #ffffff; --color-ink: #000000; ... }
html.alto-contraste.tema-escuro { ... }  /* combinação */
```

Nenhum componente precisa de regras específicas para temas — basta usar os tokens.

## Convenções de nomenclatura

- Classes de layout: `.app-shell`, `.topbar`, `#sidebar`, `#main-content`
- Classes de página: `.page-home`, `.page-navegador`, `.page-atividade`, `.page-sobre`, `.page-a11y`
- Classes de componente: `.card-*`, `.btn-*`, `.badge-*`, `.nav-*`
- Classes de motor: `.activity-*`, `.option-*`, `.sort-*`, `.drag-*`, `.write-*`, `.oral-*`
- Estado: `.hidden`, `.active`, `.selected`, `.concluida`, `.dragging`, `.drag-over`
