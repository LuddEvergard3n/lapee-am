# dataLoader/

Carregamento, cache e consulta dos 30 arquivos JSON de atividades.

## Estrutura

```
dataLoader/
├── index.js     API pública
├── resolver.js  (componente, ano) → caminho do arquivo JSON
├── cache.js     Map em memória
└── queries.js   Funções de consulta sobre o cache
```

## API pública (`index.js`)

```js
import {
  load, loadAll,
  getAnos, getComponentes, getUnidades,
  getAtividadesDaUnidade, getAtividade,
  getAtividadePorNivel, getAllAtividades,
} from './dataLoader/index.js';
```

| Função | Retorno |
|--------|---------|
| `load(componente, ano)` | `Promise<void>` — arquivo inexistente é tratado como lista vazia |
| `loadAll()` | `Promise<void>` — carrega todos os 30 arquivos em paralelo |
| `getAnos()` | `number[]` — anos presentes no cache, ordenados |
| `getComponentes(ano)` | `string[]` — em ordem canônica |
| `getUnidades(ano, componente)` | `{ unidade_id, unidade_titulo }[]` — sem duplicatas |
| `getAtividadesDaUnidade(unidade_id)` | `object[]` |
| `getAtividade(id)` | `object \| null` |
| `getAllAtividades()` | `object[]` — todas do cache |

## resolver.js

Mapa explícito `COMPONENTE_SLUG` → `./data/atividades-{slug}-{ano}.json`.

Para adicionar um componente: adicionar entrada aqui **e** em `COMPONENTE_LABEL` em `ui/componentes.js`.

## queries.js

`_COMP_ORDER` define ordem canônica dos componentes para render determinístico, independente da ordem de conclusão dos fetches paralelos.
