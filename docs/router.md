# router.js

Roteamento hash-based para SPA estática. Sem dependência de servidor. Compatível com GitHub Pages e `file://` (com ressalva: ES Modules exigem HTTP).

## API pública

```js
import { on, start, navigate } from './router.js';

on('/atividade/:id', ({ id }) => { /* handler */ });
start();          // registra hashchange e resolve rota inicial
navigate('/home');
```

### `on(path, handler)`

Registra um handler para um padrão de rota. Parâmetros de URL (`:id`) são extraídos e passados como objeto ao handler.

### `start()`

Registra `window.addEventListener('hashchange', _resolve)` e chama `_resolve()` imediatamente para a rota inicial.

### `navigate(path)`

Define `window.location.hash = path`. Grava entrada no histórico do browser — o botão Voltar funciona corretamente.

## Resolução de rotas

`_match(pattern, path)` compara segmentos: segmentos que começam com `:` são capturados como parâmetros, demais devem ser iguais. Rota não encontrada → redirect para `/home`.

## Rotas registradas (em app.js)

`/home`, `/navegador`, `/atividade/:id`, `/sobre`, `/acessibilidade`, `/planos`, `/guia`
