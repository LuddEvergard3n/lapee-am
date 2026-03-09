# Changelog

Todas as mudanças notáveis neste projeto são documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).  
Versionamento: [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [1.8.1] — 2026-03-09

### Corrigido

- **`tts.js`** — Bug do Chrome onde `speechSynthesis` travava em estado `pending` após ~15 segundos sem uso: adicionadas chamadas a `pause()` + `resume()` imediatamente antes de cada `speak()` para acordar o engine. Referência: Chromium Issue #679437.
- **`tts.js`** — Adicionados callbacks `onEnd` e `onError` na utterance para notificar o chamador quando a leitura terminar ou falhar. Adicionada função `isSpeaking()` à API pública.
- **`ui/atividade.js`** — Botão "Ouvir" agora tem feedback visual: muda para "Ouvindo..." com `aria-pressed="true"` durante a leitura. Segundo clique cancela. Leitura cancelada automaticamente ao navegar para outra atividade (`hashchange { once: true }`).
- **`.nojekyll`** — Arquivo criado na raiz do projeto. Sem ele, o GitHub Pages processa o repositório com Jekyll e pode interferir na entrega de arquivos. Obrigatório para funcionamento correto no GitHub Pages.

### Adicionado

- **`js/sound.js`** *(retroativo — pertence à v1.8.0)* — Motor de síntese de efeitos sonoros via Web Audio API. Zero dependências externas. `AudioContext` criado lazily após primeira interação do usuário. Sons: `acerto` (arpejo C→E→G), `erro` (queda E→C), `conquista` (fanfarra + acorde), `clique` (tique de UI 20ms).
- **`store.prefs.somAtivado`** *(retroativo — v1.8.0)* — Toggle de som persistido em `localStorage['lapee_prefs']`, padrão `true`.

### Documentação

- **`docs/tts.md`** — Reescrito com documentação completa da nova API (`isSpeaking`, `onEnd`), explicação do workaround do Chrome, tabela de compatibilidade por browser.
- **`README.md`** — Seção 3 atualizada com explicação do `.nojekyll`. Seção 13 (Limitações) atualizada para refletir o workaround do TTS. Estrutura do projeto inclui `.nojekyll`.

---

## [1.8.0] — 2026-03-08

### Adicionado

- **`js/sound.js`** — Motor de efeitos sonoros via Web Audio API. Zero dependências. `AudioContext` criado lazily. Sons: `acerto`, `erro`, `conquista`, `clique`.
- **`store.prefs.somAtivado`** — Preferência de som persistida em `localStorage`, padrão `true`.
- **`a11y.js`** — `toggleSom()` adicionado; `applyAll()` chama `setMuted(!prefs.somAtivado)`.
- **`ui/paginas.js`** — Toggle "Sons das atividades" na página de Acessibilidade.
- **`ui/navegador.js`** — `play('clique')` nos selects de ano e matéria.
- **`ui/atividade.js`** — `onAcerto`, `onErro`, `onConcluida` chamam `playSound` antes de animar o mascote.

---

## [1.7.0] — 2026-03-08

### Corrigido

- **`arrastar.js`** — `render()` desestruturava `opts` corretamente mas passava apenas `onConcluida` para `_renderPares`, `_renderCategorias` e `_renderBlocos`. As funções internas não tinham acesso a `onAcerto`/`onErro`, então o mascote Lua nunca reagia a acertos ou erros em atividades de arrastar. As três funções agora recebem `opts` completo e desestrutuam localmente.
- **`marcar.js`** — `_buildConfirm` não chamava `onErro()` no bloco de resultado `false` (erro simples em escolha única). O mascote só reagia a erros parciais (modo pares), não a erros de opção simples. Adicionada chamada `onErro()` no bloco final.
- **`escrever.js`** — `onAcerto` nunca era chamado ao concluir uma atividade de escrita. Adicionada desestruturação de `opts` e chamada a `onAcerto()` antes de `onConcluida()`.
- **`store.js`** — `getState()` usava `{..._state}` que incluía o array interno `_listeners` no snapshot distribuído a todos os subscribers. Substituído por cópia explícita dos campos públicos, sem expor referências internas.
- **`home.js`** — Cards de matéria chamavam `history.replaceState()` para atualizar o hash sem disparar `hashchange`. Isso quebrava o botão Voltar do navegador e deixava o estado de navegação inconsistente com o histórico. Substituído por `navigate('/navegador')` que registra a entrada no histórico corretamente.
- **`app.js`** — `navKey` não incluía `unidade_id`, tornando o mecanismo de deduplicação de renders incompleto para futuros casos onde `unidade_id` mude sem alteração dos outros campos. Adicionado ao navKey.

### Documentação

- **`README.md`** — Reescrito completamente para refletir a arquitetura v1.6/v1.7: 180 atividades, 30 JSONs, 5 motores, sistema de engajamento, decisões técnicas atualizadas, tabela de `conteudo_base` por tipo de atividade.
- **`CHANGELOG.md`** — Atualizado com histórico completo desde v1.0.0.
- **`docs/`** — Todos os arquivos de documentação técnica reescritos para refletir a estrutura modular atual (`ui/`, `dataLoader/`, `activities/`, `mascote.js`, `conquistas.js`).

---

## [1.6.2] — 2026-03-08

### Corrigido

- **`paginas.js`** — Import de `clearProgress` de `../store.js` estava ausente. A função era chamada no handler do botão de reset mas não estava declarada no escopo do módulo, causando `ReferenceError` silencioso e botão não funcional.

---

## [1.6.1] — 2026-03-08

### Corrigido

- **`conquistas.js`** — `getConquistasDoAno` agrupava por `unidade_id`, gerando 2 emblemas por componente (um por unidade). Corrigido para agrupar por componente: 1 emblema por matéria, desbloqueado quando todas as atividades do componente no ano estiverem concluídas. Tooltip agora exibe porcentagem de progresso.
- **`store.js`** — Adicionada função `clearProgress()` que zera `_state.progress` em memória e remove `lapee_progress` do `localStorage`, seguida de `_notify()` para atualizar a UI.
- **`paginas.js`** — Adicionado botão "Apagar progresso" na página de Acessibilidade. Implementa confirmação em dois cliques: primeiro clique solicita confirmação (5 segundos); segundo clique executa o reset.
- **`marcar.js`** — `render()` passava apenas `onConcluida` para `_renderSingle`, `_renderMulti` e `_renderPares`, que não tinham acesso a `onAcerto`/`onErro`. Agora passa `opts` completo; as funções desestrutuam localmente.

---

## [1.6.0] — 2026-03-07

### Adicionado

- **Motor Paint** (`js/activities/desenhar.js`): 24 cores em paleta fixa, 6 pincéis (lápis, pincel redondo, pincel largo, aquarela, spray, borracha), 3 tamanhos por pincel, desfazer (Ctrl+Z, até 30 passos), limpar tela, salvar como PNG. Canvas responsivo com touch support.
- **90 novas atividades** (total: 180). Todas as 6 matérias têm 2 unidades por ano, do 1º ao 5º ano. Arte N3-U2 usa o motor `desenhar` em todos os anos.

### Alterado

- **`css/main.css`** — Estilos do motor Paint adicionados. Paleta mobile reorganiza em grade de 8 colunas. Labels dos pincéis ocultados em telas pequenas.
- **`js/ui/atividade.js`** — Despacha `tipo_evidencia: 'desenhar'` para `renderDesenhar`.

---

## [1.5.0] — 2026-03-07

### Adicionado

- **Mascote Lua** (`js/mascote.js`): coruja SVG inline com 4 estados animados por CSS puro (idle, acerto, erro, conquista). Aparece na home e ao lado do motor de atividade.
- **Sistema de conquistas** (`js/conquistas.js`): emblemas por componente curricular derivados do `store.progress`. Desbloqueado quando todas as atividades do componente no ano estão concluídas. Emblemas bloqueados em escala de cinza, desbloqueados com brilho dourado.
- **Trilha de estrelas** (`js/ui/navegador.js`): substituiu a barra de progresso linear. Três estrelas por unidade refletem status `vazia`, `tentativa`, `concluida`.
- **Seção de conquistas na home** (`js/ui/home.js`): grade de emblemas com badge de contagem no hero.

### Alterado

- **Motores `marcar`, `ordenar`, `arrastar`** — `onAcerto` e `onErro` conectados ao mascote.
- **`js/ui/atividade.js`** — Mascote renderizado ao lado do motor; `onConcluida` aciona estado `conquista`.

---

## [1.4.2] — 2026-03-07

### Corrigido

- **`app.js`** — `navKey` introduzido: o subscriber do store só chama `renderPage` quando campos de navegação mudam. Mudanças de `prefs` não destroem mais o motor em andamento.
- **`arrastar.js`** — Guarda de slot adicionada tanto no drop quanto no clique para evitar múltiplos chips no mesmo destino.
- **`componentes.js`** — Função `esc()` exportada e aplicada em todos os campos JSON interpolados via `innerHTML`.
- **`queries.js`** — Ordem canônica de componentes fixada com `_COMP_ORDER` para render determinístico.
- **JSONs** — Campos com `<` e `>` nos gabaritos substituídos por entidades HTML.

---

## [1.4.1] — 2026-03-07

### Corrigido

- **`arrastar.js`** — `querySelector` global substituído por scoped no container da atividade.
- **`ordenar.js`** — `_dragSrc` movido de variável de módulo para objeto local `dragState` passado por referência.
- **`escrever.js`** — Stream de microfone liberado corretamente ao navegar sem parar a gravação (`hashchange { once: true }`).
- **`home.js`** — Double render eliminado na inicialização.
- **`paginas.js`** — Double render eliminado nos toggles de acessibilidade.
- **`store.js`** — `setProgress` não chama mais `_notify`: registrar progresso não deve re-renderizar a página.
- **JSONs** — IDs duplicados corrigidos; `referencia_cbtc` normalizada em todos os arquivos.

---

## [1.4.0] — 2026-03-06

### Adicionado

- **5º ano completo**: LP (Argumentação e Ponto de Vista, Leitura Crítica), Matemática (Frações e Números Decimais, Porcentagem), Ciências (Sistema Solar, Ecossistemas), História (República e Cidadania, Direitos), Geografia (Globalização, Comércio), Arte (Arte Contemporânea, Arte Urbana).
- Total: 5 anos × 6 matérias × 2 unidades × 3 níveis = **180 atividades** (estrutura completa).

---

## [1.3.0] — 2026-03-06

### Adicionado

- **2º ano** (todas as 6 matérias, 2 unidades cada).
- **4º ano** (todas as 6 matérias, 2 unidades cada).

---

## [1.2.2] — 2026-03-06

### Corrigido

- Auditoria de formato JSON: `resposta_correta` como índice numérico em todos os arquivos (eliminadas strings de texto como resposta).
- `marcar.js` — lógica de seleção múltipla corrigida para comparação de Set por tamanho e conteúdo.
- `store.setState` não destrói mais o motor ao receber `prefs` (isolamento de responsabilidades).
- IDs de chips em arrastar atribuídos antes do shuffle.

---

## [1.2.0] — 2026-03-05

### Adicionado

- **1º ano completo**: 18 atividades (6 matérias × 2 unidades × 3 níveis = 18... revisado para 6 × 1 unidade × 3 = 18 inicialmente, expandido depois).
- Linguagem infantil em todas as interfaces: enunciados, feedbacks, botões e dicas revisados para vocabulário do Ensino Fundamental I.

---

## [1.1.0] — 2025-07-04

### Alterado

- **Nome:** LAPEE → LAPEE AM (Laboratório de Práticas Educativas e Extensão Amos Comenius).
- **`js/ui.js` modularizado** em `js/ui/`: `index.js`, `componentes.js`, `home.js`, `navegador.js`, `atividade.js`, `paginas.js`.
- **`js/dataLoader.js` modularizado** em `js/dataLoader/`: `index.js`, `resolver.js`, `cache.js`, `queries.js`.
- **`data/atividades.json` dividido** em 6 arquivos por componente para o 3º ano.
- Estratégia de carregamento: eager load de todos os arquivos conhecidos na inicialização.

---

## [1.0.0] — 2025-07-04

### Adicionado

- Estrutura completa do projeto: `index.html`, `css/`, `js/`, `data/`, `docs/`, `assets/`.
- 18 atividades pedagógicas (6 componentes × 1 unidade × 3 níveis — 3º ano apenas).
- Motores: `marcar`, `ordenar`, `arrastar`, `escrever`.
- `js/app.js`, `js/router.js`, `js/store.js`, `js/tts.js`, `js/recorder.js`, `js/a11y.js`.
- `css/main.css`: sistema de design completo com tokens CSS, tema claro, escuro, alto contraste, fonte grande, layout responsivo.
- `README.md`, `CHANGELOG.md`, `LICENSE` (MIT), `docs/`.
