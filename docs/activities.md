# activities/

Motores de atividade interativa. Cada motor e um modulo independente.

## Interface comum (marcar, ordenar, arrastar, escrever, desenhar)

```js
render(container, atividade, opts = {})
// opts: { onConcluida, onAcerto, onErro }
```

## Interface async (cacapalavras, cruzadas)

```js
await renderCacaPalavras(container, atividade, opts)
await renderCruzadas(container, atividade, opts)
```

Carregam `assets/js/wordfind.js` e `assets/js/crossword.js` lazily via `<script>` dinamico.

---

## marcar.js

Subtipos detectados pelo formato de `conteudo_base`:

| Campo presente | Subtipo |
|---|---|
| `resposta_correta` | Escolha unica |
| `respostas_corretas[]` | Multipla escolha |
| `pares[]` | Associacao por par |

Apos acerto: todos os botoes desabilitados. `onErro` chamado em todos os casos de erro.

---

## ordenar.js

Drag-and-drop + botoes cima/baixo. Estado de drag em `dragState` local (sem variavel de modulo).
Embaralhamento Fisher-Yates antes de renderizar. `ordem_correta` deve ser permutacao de `[0..n-1]`.

---

## arrastar.js

Tres subtipos: `pares` (chip para slot), `categorias` (multiplos chips por grupo), `blocos` (com distratores).

- `_returnAllChips()` devolve chips ao erro — aluno nunca fica preso
- Toggle deselect: segundo clique no mesmo chip cancela selecao
- `pares` de arrastar NAO tem campo `correta` — apenas `pares` de `marcar` tem

---

## escrever.js

Campos livres sem correcao automatica. `onAcerto` + `onConcluida` ao clicar "Terminei".
Stream de microfone (gravacao oral) liberado no `hashchange { once:true }`.

---

## desenhar.js

Canvas Paint: 24 cores, 6 pinceis, 3 tamanhos, undo (ate 30 snapshots), PNG download.
Usado obrigatoriamente no N3 da Unidade 2 de Arte. Listener Ctrl+Z removido no `hashchange`.

---

## cacapalavras.js

`conteudo_base` esperado:
```json
{
  "palavras": ["GATO", "BOLA", ...],
  "dicas":    ["Animal que faz miau", "Objeto redondo", ...]
}
```

Carrega `assets/js/wordfind.js` lazily (singleton — carrega uma vez por sessao).
Interacao: clique na primeira letra, clique na ultima. Motor extrai o segmento, normaliza
(remove acentos) e compara com a lista. Apenas horizontal e vertical habilitados para EF I.

Estado: `encontradas` (Set) + celulas com classe `encontrada` (verde) ou `erro-flash` (vermelho).

---

## cruzadas.js

`conteudo_base` esperado:
```json
{
  "entradas": [
    { "palavra": "VAPOR", "dica": "Estado gasoso da agua" },
    ...
  ]
}
```

Carrega `assets/js/crossword.js` lazily.
Grid de inputs (1 char por celula). Numeracao automatica. Pistas em duas colunas (Horizontal / Vertical).
Clicar numa pista destaca as celulas da palavra e foca o primeiro input.
Botao "Verificar" colore celulas: verde = certa, vermelho = errada.
Foco avanca automaticamente ao digitar. Retrocede no Backspace em celula vazia.

---

## wordfind.js (assets/js/)

Algoritmo proprio, MIT-compativel, sem dependencias. Registrado em `window.WordFind`.

```js
const puzzle = WordFind.gerar(palavras, { tamanho, diagonais, tentativas });
// puzzle.grid       — array 2D de letras (strings minusculas)
// puzzle.posicoes   — Map(palavra_original -> { linha, col, dir, dL, dC, norm })
// puzzle.palavras   — palavras efetivamente colocadas
// puzzle.tamanho    — dimensao do grid quadrado
```

Normaliza palavras (remove acentos, lowercase) antes de encaixar.
Letras de preenchimento: distribuicao de frequencia do portugues.
Direcoees suportadas: horizontal, horizontalBack, vertical, verticalUp, diagonal (4 variantes).

---

## crossword.js (assets/js/)

Algoritmo proprio, sem dependencias. Registrado em `window.Crossword`.

```js
const layout = Crossword.gerar(entradas, { tentativas });
// entradas: [{ palavra, dica }]
// layout.grid              — array 2D de { letra, num? }
// layout.palavrasColocadas — [{ palavra, palavraOrig, dica, linha, col, dir, num }]
// layout.rows, layout.cols — dimensoes do grid
// layout.totalEntrada      — total de entradas tentadas
```

Estrategia: palavras ordenadas por tamanho (maiores primeiro), encaixe por maximo de
intersecoes com palavras ja colocadas. Roda ate `tentativas` (padrao 30) e retorna
o melhor resultado. Nem sempre coloca todas as palavras — verificar `palavrasColocadas.length`.

**Limitacao conhecida:** listas com palavras sem letras em comum produzem layouts desconexos.
Para cruzadas, usar bancos com 15-20 palavras e sortear subconjuntos.
