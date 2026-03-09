# dataLoader/

M�dulo responsável por carregar, cachear e consultar os arquivos JSON de atividades.

## Estrutura

```
dataLoader/
├── index.js     API pública
├── resolver.js  (componente, ano) → caminho do arquivo JSON
├── cache.js     cache em memória (Map<path, atividade[]>)
└── queries.js   funções de consulta sobre o cache
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

### `load(componente, ano) → Promise<void>`

Carrega o JSON de um par (componente, ano) se ainda não estiver em cache. Arquivo inexistente é tratado como lista vazia (sem erro fatal).

### `loadAll() → Promise<void>`

Carrega todos os 30 arquivos conhecidos (6 componentes × 5 anos) em paralelo via `Promise.all`. Chamado uma única vez na inicialização.

### Funções de consulta

Todas são síncronas e operam sobre o cache já carregado.

| Função | Retorno |
|--------|---------|
| `getAnos()` | `number[]` — anos presentes no cache, ordenados |
| `getComponentes(ano)` | `string[]` — componentes do ano, em ordem canônica |
| `getUnidades(ano, componente)` | `{ unidade_id, unidade_titulo }[]` — sem duplicatas |
| `getAtividadesDaUnidade(unidade_id)` | `object[]` — todos os níveis da unidade |
| `getAtividade(id)` | `object | null` |
| `getAtividadePorNivel(unidade_id, nivel)` | `object | null` |
| `getAllAtividades()` | `object[]` — todas as atividades do cache |

## resolver.js

Mapa explícito de componente → slug de arquivo:

```js
const COMPONENTE_SLUG = {
  'LP': 'lp', 'Matemática': 'matematica', 'Ciências': 'ciencias',
  'História': 'historia', 'Geografia': 'geografia', 'Arte': 'arte',
};
// → './data/atividades-{slug}-{ano}.json'
```

Para adicionar um novo componente: adicione a entrada neste mapa **e** em `COMPONENTE_LABEL` em `ui/componentes.js`.

## cache.js

Map em memória com chave = caminho do arquivo. Métodos: `has`, `get`, `set`, `getAll`, `clear`.  
`getAll()` concatena todos os arrays do cache em um único array.

## queries.js

`_COMP_ORDER` define a ordem canônica dos componentes para render determinístico, independente da ordem em que os fetches paralelos completaram.
