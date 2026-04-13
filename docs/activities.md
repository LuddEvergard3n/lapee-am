# activities/

Motores de atividade interativa. Cada motor é um módulo independente que exporta `render`.

## Interface comum

```js
render(container, atividade, opts = {})
// opts: { onConcluida, onAcerto, onErro }
```

Todos os motores chamam `setProgress(atv_id, 'concluida' | 'tentativa')` internamente. `onAcerto` e `onErro` acionam o mascote. `onConcluida` exibe o banner de conclusão.

---

## marcar.js

Motor de múltipla escolha. Detecta o subtipo pelo formato de `conteudo_base`:

| Subtipo | Detecção | Comportamento |
|---------|----------|---------------|
| Escolha única | `resposta_correta` presente, sem `pares` | Radio group, botão "Pronto!" |
| Múltipla escolha | `respostas_corretas[]` presente | Toggle buttons, exige N selecionados |
| Pares | `pares[]` presente | Um grupo de opções por situação |

`_buildConfirm` centraliza confirmação e feedback para os três subtipos. Após acerto: desabilita todos os `option-btn` E o botão "Pronto!" (`btn.disabled = true`). `onErro` é chamado em todos os casos de erro (simples, múltipla e parcial).

---

## ordenar.js

Motor de ordenação via drag-and-drop ou botões ↑/↓. Estado de drag encapsulado em `dragState = { src: null }` — sem variável de módulo. Embaralhamento Fisher-Yates antes de renderizar. Botão "Pronto!" desabilitado após acerto.

---

## arrastar.js

Motor de arrastar e soltar. Suporta três subtipos: `pares` (chip → slot nomeado), `categorias` (múltiplos chips por grupo), `blocos` (com distratores opcionais).

**Comportamento de erro:** ao clicar "Pronto!" com resposta errada, `_returnAllChips()` devolve todos os chips para a zona de fontes e restaura `draggable=true` antes de exibir o feedback. O aluno nunca fica preso após errar.

**Deselecionar:** clicar no chip já selecionado cancela a seleção (toggle via `selRef.value === chip`).

**querySelector:** todos os drop handlers usam `sources.querySelector ?? container.querySelector` como fallback consistente.

---

## escrever.js

Motor de escrita livre sem correção automática. Campos de texto, palavras obrigatórias (badges visuais), banco de eventos e critérios de autoavaliação. Seção de resposta oral via MediaRecorder (expansível). Ao concluir, chama `onAcerto` + `onConcluida`. Stream de microfone liberado no `hashchange { once: true }`.

---

## desenhar.js

Canvas Paint: 24 cores, 6 pincéis (lápis, pincel redondo, pincel largo, aquarela, spray, borracha), 3 tamanhos. Desfazer via `getImageData/putImageData` (até 30 snapshots). Listener Ctrl+Z removido no `hashchange { once: true }`. Largura calculada via `requestAnimationFrame` após inserção no DOM. Touch support.
