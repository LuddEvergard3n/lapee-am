# notificacoes.js

Sistema de toasts para feedback de ações na UI.

## API

```js
import { notificar } from './notificacoes.js';

// retorna função de fechar manual
const fechar = notificar('Texto', 'sucesso', 4000);
```

| Parâmetro | Tipo | Padrão | Descrição |
|---|---|---|---|
| `mensagem` | string | — | Texto do toast |
| `tipo` | `'sucesso' \| 'erro' \| 'aviso' \| 'info'` | `'info'` | Visual e `role` ARIA |
| `duracao` | number (ms) | 4000 | 0 = permanente |

O container `#toast-container` é criado lazily no primeiro uso. Toasts pausam o auto-dismiss ao hover. Acessíveis: tipo `'erro'` usa `role="alert"` (`aria-live="assertive"`), demais usam `role="status"` (`aria-live="polite"`).

## Uso atual

- `ui/paginas.js` — após reset de progresso: `notificar('Progresso apagado com sucesso.', 'sucesso')`
- `ui/planos.js` — importado mas disponível para erros futuros de validação do formulário
