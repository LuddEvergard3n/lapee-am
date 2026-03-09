# activities/

Motores de atividade interativa. Cada motor é um módulo independente que exporta `render`.

## Interface comum

```js
render(container, atividade, opts = {})
```

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `container` | `HTMLElement` | Elemento onde o motor renderiza |
| `atividade` | `object` | Objeto completo da atividade (JSON) |
| `opts.onConcluida` | `function?` | Chamado ao concluir com êxito |
| `opts.onAcerto` | `function?` | Chamado a cada acerto (antes de onConcluida) |
| `opts.onErro` | `function?` | Chamado a cada erro |

Todos os motores chamam `setProgress(atv_id, 'concluida' | 'tentativa')` internamente.

---

## marcar.js

Motor de múltipla escolha. Detecta o subtipo pelo formato de `conteudo_base`:

| Subtipo | Detecção | Comportamento |
|---------|----------|---------------|
| Escolha única | `resposta_correta` presente, sem `pares` | Radio group, confirmação com "Pronto!" |
| Múltipla escolha | `respostas_corretas[]` presente | Toggle buttons, exige selecionar exatamente N opções |
| Pares | `pares[]` presente | Cada situação tem seu próprio grupo de opções |

Todos os índices são base zero. `_buildConfirm` centraliza a lógica de confirmação e feedback para os três subtipos. `onErro` é chamado em todos os casos de erro (simples, múltipla e parcial).

---

## ordenar.js

Motor de ordenação via drag-and-drop ou botões ↑/↓.

- `conteudo_base.itens[]` — textos a ordenar
- `conteudo_base.ordem_correta[]` — permutação de índices (base zero)
- Estado de drag encapsulado em `dragState = { src: null }` passado por referência; sem variável de módulo
- Embaralhamento Fisher-Yates aplicado aos índices antes de renderizar

---

## arrastar.js

Motor de arrastar e soltar. Suporta três subtipos:

| Subtipo | Detecção | Estrutura |
|---------|----------|-----------|
| Pares | `pares` presente, sem `categorias` | `pares[i].{ elemento, nome }` — chip vai para slot nomeado |
| Categorias | `categorias` presente | `itens[i].{ label, categoria }` — múltiplos chips por categoria |
| Blocos | `blocos` presente | `blocos[i].{ id, label, posicao }` — suporte a distratores |

Alternativa de clique: clicar no chip seleciona, clicar no destino coloca. Suporta teclado via `keydown`.

Guarda de slot: um slot de pares aceita apenas 1 chip; verificado tanto no drop quanto no clique.

Todos os subtipos usam `_appendValidation` que recebe `onConcluida, onAcerto, onErro` como parâmetros separados. O dispatch em `render()` passa `opts` completo para `_renderPares`, `_renderCategorias` e `_renderBlocos`.

---

## escrever.js

Motor de escrita livre sem correção automática.

- `conteudo_base.campos[]` — lista de `{ id, label, max? }` renderizados como textareas
- Campos opcionais: `texto` (contextualização), `palavras_obrigatorias[]` (badges visuais), `banco_eventos[]` (lista de referência)
- `criterios_sucesso[]` do objeto da atividade exibidos em `<details>` para autoavaliação
- Seção de resposta oral (MediaRecorder) expansível via toggle
- Conclui ao clicar "Terminei!" com pelo menos um campo preenchido; chama `onAcerto` + `onConcluida`

---

## desenhar.js

Motor de canvas (Paint) para atividades de arte livre.

### Paleta

24 cores fixas em 6 famílias: preto/branco, vermelho/rosa, laranja/amarelo, verde, azul, roxo/marrom.

### Pincéis

| ID | Label | Efeito |
|----|-------|--------|
| `lapis` | Lápis | Linha dura, alpha 1 |
| `pincel` | Pincel Redondo | Linha suave, alpha 0.85 |
| `largo` | Pincel Largo | Borda quadrada (bevel), alpha 0.7 |
| `aquarela` | Aquarela | 4 pontos aleatórios por evento, alpha 0.08 |
| `spray` | Spray | 24 pontos em distribuição radial, alpha 0.18 |
| `borracha` | Borracha | Pinta com branco; trocar cor volta para lápis |

### Histórico de desfazer

Até 30 snapshots via `getImageData/putImageData`. Atalho Ctrl+Z registrado com `window.addEventListener('keydown', ...)` removido no `hashchange { once: true }`.

### Responsividade

Largura do canvas calculada via `requestAnimationFrame` após inserção no DOM. Em mobile: paleta move para cima em grade de 8 colunas.
