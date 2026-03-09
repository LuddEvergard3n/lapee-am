# store.js

Estado global da aplicação. Implementa pub/sub simples com persistência em `localStorage`.

## API pública

```js
import {
  init, getState, setState,
  setProgress, getProgress, getProgressoUnidade, clearProgress,
  subscribe,
} from './store.js';
```

### `init()`

Carrega `lapee_prefs` e `lapee_progress` do `localStorage` para o estado em memória. Deve ser chamado uma única vez na inicialização, antes de qualquer `getState()`.

### `getState() → object`

Retorna uma cópia rasa do estado atual. Expõe apenas os campos públicos:

```js
{
  ano, componente, unidade_id, nivel, atividade_id,
  pagina, modoProfesor,
  prefs: { fonteGrande, altoContraste, temaEscuro },
  progress: { [atividade_id]: 'concluida' | 'tentativa' },
}
```

O array interno `_listeners` nunca é exposto no snapshot (evita vazamento de referência).

### `setState(partial)`

Atualiza o estado com os campos fornecidos e notifica todos os subscribers. Se `partial` contiver `prefs`, faz merge e persiste em `localStorage`.

### `setProgress(atividade_id, status)`

Registra `'concluida'` ou `'tentativa'` para uma atividade. **Não chama `_notify()`** — registrar progresso não deve re-renderizar a página atual (destruiria o motor em andamento).

### `getProgress(atividade_id) → 'concluida' | 'tentativa' | null`

Retorna o status de progresso de uma atividade.

### `getProgressoUnidade(unidade_id, atividades) → { total, concluidas }`

Conta as atividades concluídas de uma unidade. `atividades` deve ser a lista completa retornada por `getAtividadesDaUnidade`.

### `clearProgress()`

Zera todo o progresso em memória e remove `lapee_progress` do `localStorage`. Chama `_notify()` para atualizar a UI (trilha de estrelas, emblemas, hero badge).

### `subscribe(fn) → unsubscribe`

Registra um listener chamado com o snapshot do estado a cada `_notify()`. Retorna função de cancelamento.

## Fluxo de persistência

```
setState({ prefs }) → Object.assign → _persistPrefs() → localStorage['lapee_prefs']
setProgress(id, s) → _state.progress[id] = s → _persistProgress() → localStorage['lapee_progress']
clearProgress()    → _state.progress = {} → localStorage.removeItem → _notify()
```

## Invariantes

- `setProgress` nunca chama `_notify`: o motor de atividade não é destruído ao registrar progresso.
- `getState` nunca inclui `_listeners` no snapshot.
- `setState` com `prefs` faz merge (não substitui); `setState` com outros campos substitui diretamente.
