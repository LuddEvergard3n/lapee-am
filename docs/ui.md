# ui/

Modulo de renderizacao da interface. Cada arquivo de pagina exporta uma funcao de render independente.

## Estrutura

```
ui/
├── index.js        Orquestrador (init, renderPage)
├── componentes.js  Utilitarios e constantes compartilhadas
├── home.js         Pagina inicial
├── navegador.js    Navegador de conteudo
├── atividade.js    Tela de atividade interativa
├── guia.js         Guia do Professor
├── planos.js       Gerador de Planos de Aula
└── paginas.js      Paginas estaticas (Sobre, Acessibilidade)
```

## index.js

```js
import { init, renderPage } from './ui/index.js';
```

- `init()` — monta sidebar e menu toggle. Chamado uma vez.
- `renderPage(state)` — delega para o modulo correto com base em `state.pagina`. E `async` por causa de `renderNavegador`.

Paginas registradas: `home`, `navegador`, `atividade`, `guia`, `gerador`, `planos`, `sobre`, `acessibilidade`.

## componentes.js

| Export | Tipo | Descricao |
|--------|------|-----------|
| `$` | `(id) -> Element` | Atalho para `getElementById` |
| `esc(str)` | `string -> string` | Escapa `& < > " '` para uso em `innerHTML` |
| `COMPONENTE_LABEL` | `object` | `{ LP: 'Lingua Portuguesa', ... }` |
| `NIVEL_LABEL` | `object` | `{ 1: 'Mais facil', 2: 'Normal', 3: 'Desafio' }` |
| `NIVEL_ABBR` | `object` | `{ 1: 'N1', 2: 'N2', 3: 'N3' }` |
| `renderSidebar()` | `void` | Injeta links de navegacao na sidebar |
| `updateSidebarActive(state)` | `void` | Marca link ativo com base em `state.pagina` |
| `setupMenuToggle()` | `void` | Registra eventos do menu mobile |
| `updateBreadcrumb(state)` | `void` | Atualiza a trilha de localizacao na topbar |

**`esc()` deve ser aplicado a todo campo JSON interpolado via `innerHTML`.**

## home.js

- Hero com mascote Lua animada com base no progresso do ano atual
- Cards de materia — clique usa `navigate('/navegador')`
- Secao de conquistas — grade de emblemas por componente

## navegador.js

- Async: faz `load(componente, ano)` se necessario antes de renderizar
- Mudanca de `sel-ano`: `setState({ano, componente: null})` + `navigate('/navegador')`
- Mudanca de `sel-comp`: `await load(comp, ano)` + `setState({componente})` + `navigate('/navegador')`
- navKey garante que o segundo navigate nao cause duplo render

## atividade.js

Despachante de motores. Importa e invoca cada motor com `opts = { onAcerto, onErro, onConcluida }`.

Motores suportados via `tipo_evidencia`:

| Valor | Motor |
|---|---|
| `marcar` | `activities/marcar.js` |
| `ordenar` | `activities/ordenar.js` |
| `arrastar` | `activities/arrastar.js` |
| `escrever` | `activities/escrever.js` |
| `desenhar` | `activities/desenhar.js` |
| `caca_palavras` | `activities/cacapalavras.js` |
| `cruzadas` | `activities/cruzadas.js` |

Botao "Para o professor" manipula DOM diretamente sem `setState` — nao destroi o motor.
Botao "Ouvir" usa `isSpeaking()` + `opts.onEnd` para feedback visual.

## guia.js

Layout flexbox: sidebar de 200px (sticky) + conteudo (`flex:1`, `min-width:0`).
`IntersectionObserver` marca link ativo ao scrollar — desconectado no `hashchange { once:true }`.

Conteudo: contextualizacao, tabela de niveis N1/N2/N3, tabela de inclusao por situacao real, tres cards de modo de uso, cinco atividades prontas para sala, secao BNCC, limitacoes conhecidas.

## gerador.js

Gerador de folhas de atividades para impressao. Zero API externa. Funciona offline.

**Fluxo:** seleciona componente + ano + nivel + quantidade → sorteia do cache do dataLoader → converte cada atividade para formato de questao imprimivel → preview → exportar PDF ou DOCX.

**Conversor por tipo:**

| tipo_evidencia | Na folha |
|---|---|
| `marcar` (unica) | Alternativas A/B/C/D |
| `marcar` (multipla) | Idem + instrucao "Marque N" |
| `marcar` (pares) | Linhas com opcoes entre colchetes |
| `ordenar` | Itens embaralhados com `( )` para numerar |
| `arrastar` (pares) | Tabela duas colunas para ligar |
| `arrastar` (categorias) | `Item: ___` para escrever categoria |
| `escrever` | Campos com label + linhas de resposta |
| `desenhar` | Caixa de 120px para desenhar |

Aviso se acervo tem menos atividades que a quantidade pedida.

## planos.js

Gerador de planos de aula 100% client-side. Zero fetch, funciona offline.

Dados embutidos: 445 habilidades BNCC reais (1 ao 5 ano, 6 componentes), Objetos de Conhecimento por componente/ano, presets pedagogicos de Objetivos/Metodologia/Recursos/Avaliacao.

Formulario em dois paineis: esquerdo (formulario fixo, scroll proprio), direito (preview ao vivo, scroll proprio). Carga horaria calculada por closure local `calcCarga` — sem `window._calcCarga`. Exportacao via `window.print()` e DOCX via `exportar.js`.

## paginas.js

- `renderSobre()` — secoes Inclusao Total e Amos Comenius
- `renderAcessibilidade(main, state)` — toggles de prefs + reset de progresso com confirmacao em dois cliques
