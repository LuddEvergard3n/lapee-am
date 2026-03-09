# ui/

M�dulo de renderização da interface. Cada arquivo de página é independente e exporta uma função de render.

## Estrutura

```
ui/
├── index.js        Orquestrador (init, renderPage)
├── componentes.js  Utilitários compartilhados
├── home.js         Página inicial
├── navegador.js    Navegador de conteúdo
├── atividade.js    Tela de atividade
└── paginas.js      Páginas estáticas (Sobre, Acessibilidade)
```

## index.js

```js
import { init, renderPage } from './ui/index.js';
```

- `init()` — monta sidebar e menu toggle. Chamado uma vez.
- `renderPage(state)` — delega para o módulo correto com base em `state.pagina`. É `async` por causa de `renderNavegador`.

## componentes.js

Utilitários e constantes compartilhadas por todas as páginas.

| Export | Tipo | Descrição |
|--------|------|-----------|
| `$` | `(id) → Element` | Atalho para `getElementById` |
| `esc(str)` | `string → string` | Escapa `& < > " '` para uso em `innerHTML` |
| `COMPONENTE_LABEL` | `object` | Mapa `{ LP: 'Língua Portuguesa', ... }` |
| `NIVEL_LABEL` | `object` | `{ 1: 'Mais fácil', 2: 'Normal', 3: 'Desafio' }` |
| `NIVEL_ABBR` | `object` | `{ 1: 'N1', 2: 'N2', 3: 'N3' }` |
| `renderSidebar()` | `void` | Injeta links de navegação na sidebar |
| `updateSidebarActive(state)` | `void` | Marca link ativo com base em `state.pagina` |
| `setupMenuToggle()` | `void` | Registra eventos do menu mobile |
| `updateBreadcrumb(state)` | `void` | Atualiza a trilha de localização na topbar |

**`esc()` deve ser aplicado a todo campo JSON interpolado via `innerHTML`.** Nunca interpolar diretamente.

## home.js

Renderiza a página inicial. Componentes:

- **Hero** com mascote Lua (animada com base no progresso)
- **Cards de matéria** — clique navega para o navegador com componente pré-selecionado via `navigate('/navegador')` (registra no histórico do browser)
- **Seção de conquistas** — grade de emblemas para o ano atual, com badge de contagem no hero
- **Seção "Como funciona"**

## navegador.js

Renderiza seletor de ano/componente e lista de unidades.

- Async: faz `load(componente, ano)` se necessário antes de renderizar
- `_cardUnidade()` gera a trilha de estrelas lendo o progresso via `getProgress`
- Mudança de `sel-ano`: `setState({ano, componente: null})` + `navigate('/navegador')`
- Mudança de `sel-comp`: `await load(comp, ano)` + `setState({componente})` + `navigate('/navegador')`

## atividade.js

Renderiza a tela completa de atividade: tabs de nível, metadados, controles DUA, motor e painel do professor.

- `_despacharMotor()` cria a área com mascote e chama o motor correto com `opts = { onConcluida, onAcerto, onErro }`
- Botão "Para o professor" manipula DOM diretamente (sem `setState`) para não destruir o motor
- `_mostrarBannerConcluida()` exibe banner com link para o navegador; checa duplicatas antes de inserir

## paginas.js

Páginas estáticas. Importa `clearProgress` de `store.js`.

- `renderSobre()` — documentação técnica e pedagógica (linguagem técnica)
- `renderAcessibilidade(main, state)` — toggles de prefs + botão de reset de progresso com confirmação em dois cliques
