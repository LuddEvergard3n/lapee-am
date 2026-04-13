# LAPEE AM — Plataforma de Atividades Pedagógicas

Produto educacional estático para o Laboratório de Práticas Educativas e Extensão Amos Comenius.  
Funciona sem internet, roda direto no navegador e pode ser publicado no GitHub Pages sem configuração adicional.

---

## Sumário

1. [O que é](#1-o-que-é)
2. [Como rodar localmente](#2-como-rodar-localmente)
3. [Como publicar no GitHub Pages](#3-como-publicar-no-github-pages)
4. [Como editar conteúdo via JSON](#4-como-editar-conteúdo-via-json)
5. [Como adicionar atividades, unidades ou anos](#5-como-adicionar-atividades-unidades-ou-anos)
6. [Estrutura do projeto](#6-estrutura-do-projeto)
7. [Arquitetura técnica](#7-arquitetura-técnica)
8. [Motores de atividade](#8-motores-de-atividade)
9. [Sistema de engajamento](#9-sistema-de-engajamento)
10. [BNCC e CBTC-SC](#10-bncc-e-cbtc-sc)
11. [Acessibilidade e DUA](#11-acessibilidade-e-dua)
12. [Decisões técnicas](#12-decisões-técnicas)
13. [Limitações conhecidas](#13-limitações-conhecidas)
14. [Licença](#14-licença)

---

## 1. O que é

Uma aplicação web estática (HTML + CSS + JavaScript puro, sem framework nem bundler) que oferece **180 atividades pedagógicas** organizadas por:

- **Ano escolar** — 1º ao 5º do Ensino Fundamental I
- **Componente curricular** — LP, Matemática, Ciências, História, Geografia, Arte
- **Unidade temática** — 2 unidades por componente por ano
- **Nível de aprofundamento** — N1 (Apoio), N2 (Básico), N3 (Ampliação)

Cada atividade inclui:

- Motor interativo específico (`marcar`, `ordenar`, `arrastar`, `escrever`, `desenhar`)
- Leitura em voz alta via Web Speech API
- Gravação de resposta oral via MediaRecorder (local, sem upload)
- Dica pedagógica que orienta sem entregar a resposta
- Painel do professor com gabarito, objetivo e perguntas de mediação
- Progresso salvo em `localStorage`
- Mascote Lua (coruja SVG animada) com reação a acertos, erros e conquistas
- Sistema de emblemas por componente curricular

---

## 2. Como rodar localmente

### Requisito obrigatório

ES Modules nativos (`import`/`export`) exigem protocolo HTTP. **Não funcionam com `file://`.**

### Opção A — Python (sem instalar nada)

```bash
cd lapee/
python3 -m http.server 8080
# Acesse: http://localhost:8080
```

### Opção B — Node.js

```bash
npx serve .
```

### Opção C — VSCode Live Server

1. Instale a extensão "Live Server" (Ritwick Dey)
2. Clique com o botão direito em `index.html` → "Open with Live Server"

### Opção D — Qualquer servidor HTTP estático

Nginx, Apache, Caddy — basta apontar a raiz para a pasta `lapee/`.

---

## 3. Como publicar no GitHub Pages

```bash
git init
git add .
git commit -m "init: LAPEE AM"
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
git push -u origin main
```

No GitHub: **Settings → Pages → Source: Deploy from branch `main` / `/ (root)`**.

Aguarde 1–3 minutos. O site estará em `https://SEU_USUARIO.github.io/NOME_DO_REPO/`.

### Por que funciona sem configuração

O arquivo `.nojekyll` na raiz do projeto instrui o GitHub Pages a **não processar o repositório com Jekyll**. Sem ele, o Jekyll ignora arquivos e pastas que começam com `_` ou `.`, e pode interferir no carregamento dos módulos JS. Com `.nojekyll`, os arquivos são servidos exatamente como estão no repositório.

Todos os caminhos de recurso no projeto usam `./` (relativo ao `index.html`), por isso funcionam corretamente tanto na raiz de um domínio (`usuario.github.io/repo/`) quanto em subpastas.

---

## 4. Como editar conteúdo via JSON

O conteúdo está dividido em **30 arquivos JSON** em `data/`, um por componente por ano:

```
data/atividades-lp-1.json          (6 atividades: 2 unidades x 3 níveis)
data/atividades-lp-2.json
...
data/atividades-arte-5.json
```

### Convenção de nome de arquivo

```
atividades-{slug}-{ano}.json
```

| Componente  | Slug         |
|-------------|--------------|
| LP          | `lp`         |
| Matemática  | `matematica` |
| Ciências    | `ciencias`   |
| História    | `historia`   |
| Geografia   | `geografia`  |
| Arte        | `arte`       |

### Estrutura obrigatória de um objeto de atividade

```json
{
  "id": "lp-1-u1-n1",
  "ano": 1,
  "componente": "LP",
  "unidade_id": "lp-1-u1",
  "unidade_titulo": "Letras e Sons",
  "habilidade_bncc_codigo": "EF01LP01",
  "referencia_cbtc": "CBTC-SC: LP.EF1.L.01 — Descrição",
  "objetivo": "O que o aluno vai aprender.",
  "nivel": 1,
  "tipo_evidencia": "marcar",
  "tempo_medio_min": 5,
  "enunciado": "Texto do enunciado exibido ao aluno.",
  "conteudo_base": { ... },
  "criterios_sucesso": ["Critério 1"],
  "adaptacoes_dua": {
    "apresentacao": "Como o conteúdo é apresentado.",
    "resposta": "Como o aluno pode responder.",
    "engajamento": "Texto da dica exibida ao aluno."
  },
  "modo_professor": {
    "gabarito": "Resposta correta.",
    "objetivo_pedagogico": "Para que serve esta atividade.",
    "perguntas_orientadoras": ["Pergunta 1?", "Pergunta 2?"],
    "tempo_estimado": "5 a 7 minutos",
    "adaptacao_nivel": "Descrição do que muda neste nível."
  }
}
```

### `tipo_evidencia` e estrutura de `conteudo_base`

| Tipo        | Estrutura de `conteudo_base`                                      | Observações                          |
|-------------|-------------------------------------------------------------------|--------------------------------------|
| `marcar`    | `{ opcoes[], resposta_correta }`                                  | Índice base zero                     |
| `marcar`    | `{ opcoes[], respostas_corretas[] }`                              | Múltipla escolha                     |
| `marcar`    | `{ pares[] }`                                                     | `pares[i].{ situacao, opcoes[], correta }` |
| `ordenar`   | `{ itens[], ordem_correta[] }`                                    | `ordem_correta` é permutação de índices |
| `arrastar`  | `{ pares[] }`                                                     | `pares[i].{ elemento, nome }`        |
| `arrastar`  | `{ itens[], categorias[] }`                                       | `itens[i].{ label, categoria }`      |
| `arrastar`  | `{ blocos[], colunas[] }`                                         | `blocos[i].{ id, label, posicao }`   |
| `escrever`  | `{ campos[], texto?, palavras_obrigatorias?, banco_eventos? }`    | `campos[i].{ id, label, max? }`      |
| `desenhar`  | `{ prompt_desenho, tema }`                                        | Canvas Paint completo                |

**Todos os índices de resposta são base zero e devem ser números, nunca strings.**

---

## 5. Como adicionar atividades, unidades ou anos

### Nova atividade em unidade existente

Adicione um objeto com o mesmo `unidade_id` e um `nivel` diferente no JSON correspondente.

### Nova unidade em componente existente

Use um `unidade_id` novo (ex.: `"lp-1-u3"`). A unidade aparece automaticamente no navegador.

### Novo componente curricular

1. Adicione a entrada no mapa `COMPONENTE_SLUG` em `js/dataLoader/resolver.js`
2. Adicione a entrada em `COMPONENTE_LABEL` em `js/ui/componentes.js`
3. Adicione o SVG do emblema em `EMBLEMA_SVG` em `js/conquistas.js`
4. Crie os arquivos `data/atividades-{slug}-{ano}.json`

### Novo ano escolar

Crie os arquivos `data/atividades-{slug}-{ano}.json` para todos os componentes desejados. O seletor de ano detecta automaticamente os anos presentes no cache.

**Nenhuma outra alteração em código JavaScript é necessária para adicionar conteúdo.**

---

## 6. Estrutura do projeto

```
lapee/
├── index.html
├── css/
│   └── main.css                Sistema de design completo (tokens, layout,
│                               componentes, temas, mascote, conquistas,
│                               Paint, toasts, planos, guia)
├── js/
│   ├── app.js                  Inicialização, 7 rotas, subscriber do store
│   ├── router.js               Roteamento por hash (#/rota)
│   ├── store.js                Estado global + persistência em localStorage
│   ├── tts.js                  Síntese de fala (Web Speech API)
│   ├── recorder.js             Gravação de áudio (MediaRecorder)
│   ├── a11y.js                 Acessibilidade: prefs visuais + som + atalhos
│   ├── mascote.js              Lua — coruja SVG animada com 4 estados
│   ├── conquistas.js           Emblemas por componente derivados do progresso
│   ├── notificacoes.js         Sistema de toasts (4 tipos, auto-dismiss)
│   ├── sound.js                Efeitos sonoros via Web Audio API
│   ├── activities/
│   │   ├── marcar.js           Motor: múltipla escolha (simples, múltipla, pares)
│   │   ├── ordenar.js          Motor: ordenação drag-and-drop + teclado
│   │   ├── arrastar.js         Motor: arrastar (pares, categorias, blocos)
│   │   ├── escrever.js         Motor: escrita livre + resposta oral
│   │   └── desenhar.js         Motor: Paint (24 cores, 6 pincéis, undo, PNG)
│   ├── dataLoader/
│   │   ├── index.js            API pública (load, loadAll, re-exporta queries)
│   │   ├── resolver.js         (componente, ano) → caminho do arquivo JSON
│   │   ├── cache.js            Cache em memória dos JSONs carregados
│   │   └── queries.js          Funções de consulta sobre o cache
│   └── ui/
│       ├── index.js            Orquestrador da UI (init, renderPage)
│       ├── componentes.js      Sidebar, breadcrumb, constantes, esc()
│       ├── home.js             Página inicial com mascote e emblemas
│       ├── navegador.js        Seletor de ano/matéria + trilha de estrelas
│       ├── atividade.js        Tela de atividade + despacho de motores
│       ├── guia.js             Guia do Professor (sidebar + cards de atividade)
│       ├── planos.js           Gerador de planos de aula (client-side, dados BNCC embutidos)
│       └── paginas.js          Páginas Sobre e Acessibilidade
├── data/
│   ├── atividades-lp-{1..5}.json
│   ├── atividades-matematica-{1..5}.json
│   ├── atividades-ciencias-{1..5}.json
│   ├── atividades-historia-{1..5}.json
│   ├── atividades-geografia-{1..5}.json
│   └── atividades-arte-{1..5}.json         (30 arquivos, 180 atividades)
├── assets/
│   ├── icons/
│   └── fonts/
├── docs/                       Documentação técnica de cada módulo (11 arquivos)
├── CHANGELOG.md
├── LICENSE
├── .nojekyll                   Desativa Jekyll no GitHub Pages (obrigatório)
└── README.md
```

---

## 7. Arquitetura técnica

### Fluxo de inicialização

```
index.html
  └─ app.js (main)
       ├─ store.init()               carrega localStorage
       ├─ a11y.applyAll()            aplica prefs ao <html>
       ├─ data.loadAll()             fetch eager de todos os 30 JSONs
       ├─ ui.init()                  monta sidebar, menu toggle
       ├─ store.subscribe(renderPage) re-renderiza quando navKey muda
       ├─ router.on(...)             registra handlers de rota
       └─ router.start()             resolve rota inicial pelo hash
```

### Controle de re-render (navKey)

O subscriber compara um `navKey` antes de chamar `renderPage`:

```js
const navKey = `${pagina}|${atividade_id}|${ano}|${componente}|${unidade_id}`;
```

Mudanças de `prefs` (acessibilidade) não disparam re-render — `a11y.applyAll()` aplica classes no `<html>` diretamente, preservando o motor de atividade em andamento.

### Persistência

| Dado                          | Armazenamento                    |
|-------------------------------|----------------------------------|
| Preferências de acessibilidade | `localStorage['lapee_prefs']`   |
| Progresso do aluno            | `localStorage['lapee_progress']` |
| Estado de navegação           | Memória (perdido ao fechar)      |
| Conteúdo JSON                 | Memória (recarregado na inicialização) |

### Snapshot do store

`getState()` retorna uma cópia explícita dos campos públicos do estado, sem expor o array interno `_listeners`. O spread `{..._state}` é evitado deliberadamente para prevenir vazamento de referência interna.

---

## 8. Motores de atividade

Todos os motores seguem a mesma interface:

```js
render(container, atividade, opts)
// opts: { onConcluida, onAcerto, onErro }
```

| Motor      | Arquivo                      | Comportamento                                                |
|------------|------------------------------|--------------------------------------------------------------|
| `marcar`   | `activities/marcar.js`       | Escolha única, múltipla ou pares de situações               |
| `ordenar`  | `activities/ordenar.js`      | Reordenação via drag-and-drop ou botões para cima/baixo      |
| `arrastar` | `activities/arrastar.js`     | Associação chip → destino (pares, categorias, blocos)        |
| `escrever` | `activities/escrever.js`     | Texto livre + resposta oral via MediaRecorder                |
| `desenhar` | `activities/desenhar.js`     | Canvas Paint: 24 cores, 6 pincéis, desfazer, salvar PNG      |

Os callbacks `onAcerto` e `onErro` acionam animações do mascote. `onConcluida` exibe o banner de conclusão.

---

## 9. Sistema de engajamento

### Mascote Lua (`js/mascote.js`)

SVG inline com 4 estados animados via CSS puro:

| Estado      | Gatilho                  | Animação                                    |
|-------------|--------------------------|---------------------------------------------|
| `idle`      | padrão                   | respiração suave, piscada espontânea        |
| `acerto`    | resposta correta         | pulo com rotação, bochechas rosas, estrelinhas |
| `erro`      | resposta errada          | chacoalhada encorajadora, lágrima           |
| `conquista` | emblema desbloqueado     | rotação completa com brilho dourado         |

### Trilha de estrelas (`js/ui/navegador.js`)

Três estrelas por unidade refletem o progresso lido do store:

- Vazia (cinza) — não tentada
- Tentativa (âmbar) — tentada, não concluída
- Concluída (dourado pulsante) — concluída com êxito

### Conquistas (`js/conquistas.js`)

Um emblema por componente curricular por ano, derivado do `store.progress`. Desbloqueado quando todas as atividades do componente naquele ano têm status `concluida`. Exibido na home com progresso em porcentagem no tooltip.

---

## 10. BNCC e CBTC-SC

### BNCC

O código de habilidade (ex.: `EF03LP06`) é um metadado de classificação, não prescrição de conteúdo. Exibido como tag nas telas de unidade e atividade. Sem lógica de negócio atrelada ao código.

### CBTC-SC

O campo `referencia_cbtc` segue o formato:

```
"CBTC-SC: COMPONENTE.ANO.AREA.NUMERO — Descrição resumida"
```

Exibido como tag visual. Não afeta a lógica da aplicação.

---

## 11. Acessibilidade e DUA

| Camada DUA    | Implementação                                                                 |
|---------------|-------------------------------------------------------------------------------|
| Apresentação  | Texto claro, TTS (Web Speech API), fonte ajustável, alto contraste, tema escuro |
| Resposta      | Clique, arrastar, ordenar, escrever ou gravar oralmente                        |
| Engajamento   | Missões curtas (3–7 min), feedback sem punição, dica que orienta sem entregar  |

### Atalhos de teclado

| Ação                   | Tecla      |
|------------------------|------------|
| Alternar fonte grande  | Alt + F    |
| Alternar alto contraste | Alt + C   |
| Alternar tema escuro   | Alt + D    |
| Fechar menu / drawer   | Esc        |
| Desfazer (motor Paint) | Ctrl + Z   |

### Reset de progresso

Em **Acessibilidade → Dados e progresso**, o botão "Apagar progresso" exige confirmação em dois cliques e remove `localStorage['lapee_progress']` completamente.

---

## 12. Decisões técnicas

**Sem framework, sem bundler, sem TypeScript.** Elimina etapas de build e dependências externas. Roda em qualquer servidor HTTP estático.

**Roteamento por hash.** Funciona sem configuração de servidor. Compatível com GitHub Pages. O botão Voltar do navegador funciona corretamente porque `navigate()` sempre atualiza o histórico via `window.location.hash`.

**ES Modules nativos.** Separação de responsabilidades sem transpilação. Suportado por todos os navegadores modernos desde 2018.

**30 arquivos JSON separados por componente e ano.** Permite expansão de conteúdo sem tocar em código. Carregamento eager na inicialização (`loadAll()`) popula o cache de uma vez; arquivos inexistentes são ignorados silenciosamente.

**`store.getState()` não expõe `_listeners`.** O snapshot retornado é uma cópia explícita dos campos públicos, sem spread do estado interno inteiro.

**Gerador de planos de aula 100% client-side.** Dados BNCC embutidos diretamente no JS (`planos.js`) — zero fetch, funciona offline, sem chave de API. 445 habilidades reais extraídas do PDF oficial do MEC. A alternativa (chamar uma API de LLM) exigiria chave exposta no frontend ou um backend.

**Efeitos sonoros via Web Audio API.** Síntese procedural — sem arquivos de áudio externos. `AudioContext` criado lazily após interação do usuário (obrigação dos browsers modernos). Mute controlado por `store.prefs.somAtivado` e aplicado via `a11y.applyAll()`.

**Listeners descartados no `hashchange { once: true }`.** Teclado (Ctrl+Z no Paint), TTS (`isSpeaking`), microfone (`recClean`), `IntersectionObserver` do guia — todos liberados ao navegar para outra página. Evita acumulação entre visitas à mesma página.

---

## 13. Limitações conhecidas

- **ES Modules exigem servidor HTTP.** Não funcionam com `file://`. Veja seção 2.
- **TTS:** qualidade varia por browser. Chrome/Edge têm melhor suporte em pt-BR. O bug do Chrome que travava a síntese após ~15s de inatividade está corrigido com o workaround `pause()/resume()` em `tts.js`. O botão "Ouvir" muda para "Ouvindo..." durante a leitura e pode ser clicado novamente para cancelar.
- **Gravação oral:** requer permissão de microfone. Bloqueada em conexões não-HTTPS (GitHub Pages usa HTTPS — sem problema em produção).
- **Progresso por dispositivo:** `localStorage` não sincroniza entre dispositivos ou navegadores.
- **Conquistas exigem 100% do componente:** o emblema de Arte exige concluir todas as 6 atividades (inclusive o desenho livre do N3-U2), o que pode demorar mais que outras matérias.

---

## 14. Licença

MIT License — veja o arquivo `LICENSE`.

O conteúdo pedagógico (textos, enunciados, critérios) pode ser adaptado e redistribuído desde que mantida a atribuição ao LAPEE AM.
