# store.js

Estado global da aplicação. Pub/sub simples com persistência em `localStorage`.

## API pública

```js
import {
  init, getState, setState,
  setProgress, getProgress, getProgressoUnidade, clearProgress,
  subscribe,
} from './store.js';
```

### `init()`

Carrega `lapee_prefs` e `lapee_progress` do `localStorage`. Chamado uma vez na inicialização.

### `getState() → object`

Retorna cópia explícita dos campos públicos — sem `_listeners` no snapshot:

```js
{
  ano, componente, unidade_id, nivel, atividade_id,
  pagina, modoProfesor,
  prefs: { fonteGrande, altoContraste, temaEscuro, somAtivado },
  progress: { [atividade_id]: 'concluida' | 'tentativa' },
}
```

### `setState(partial)`

Atualiza o estado e notifica subscribers. Se `partial.prefs` presente: merge e persiste em `localStorage`.

### `setProgress(atividade_id, status)`

Registra `'concluida'` ou `'tentativa'`. **Não chama `_notify()`** — evita destruir o motor de atividade em andamento.

### `getProgress(atividade_id) → 'concluida' | 'tentativa' | null`

### `getProgressoUnidade(unidade_id, atividades) → { total, concluidas }`

### `clearProgress()`

Zera progress em memória, remove `lapee_progress` do localStorage, chama `_notify()`.

### `subscribe(fn) → unsubscribe`

Retorna função de cancelamento.

## Persistência

| Dado | Chave localStorage |
|---|---|
| Preferências de acessibilidade | `lapee_prefs` |
| Progresso do aluno | `lapee_progress` |

## Invariantes

- `setProgress` nunca chama `_notify`
- `getState` nunca expõe `_listeners`
- `setState` com `prefs` faz merge — não substitui o objeto inteiro
- `prefs.somAtivado` controla o mute de `sound.js` via `a11y.applyAll()`
