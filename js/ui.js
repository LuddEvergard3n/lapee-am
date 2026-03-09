/**
 * ui.js
 * Motor de renderização da interface.
 * Responsável por construir e atualizar as páginas com base no estado do store.
 * Usa render incremental: atualiza apenas as regiões afetadas por mudança de estado.
 */

import { getState, setState } from './store.js';
import * as dataLoader from './dataLoader.js';
import { navigate } from './router.js';
import { speak, isSupported as ttsSupported } from './tts.js';
import { getProgressoUnidade, getProgress } from './store.js';

/* Importa motores de atividade */
import { render as renderMarcar }  from './activities/marcar.js';
import { render as renderOrdenar } from './activities/ordenar.js';
import { render as renderArrastar } from './activities/arrastar.js';
import { render as renderEscrever } from './activities/escrever.js';

/* ---- Referências estáticas ao DOM (não mudam entre renderizações) ---- */
const $ = id => document.getElementById(id);

/* ---- Nomes legíveis dos componentes ---- */
const COMPONENTE_LABEL = {
  'LP': 'Língua Portuguesa',
  'Matemática': 'Matemática',
  'Ciências': 'Ciências',
  'História': 'História',
  'Geografia': 'Geografia',
  'Arte': 'Arte',
};

const NIVEL_LABEL = { 1: 'Apoio', 2: 'Básico', 3: 'Ampliação' };
const NIVEL_ABBR  = { 1: 'N1', 2: 'N2', 3: 'N3' };

/**
 * Inicializa a UI: registra handler global de estado e renderiza sidebar.
 */
function init() {
  _renderSidebar();
  _setupMenuToggle();
}

/**
 * Renderiza a página correta baseada no estado atual do store.
 * Chamado pelo roteador após cada mudança de hash.
 * @param {object} state
 */
function renderPage(state) {
  const main = $('main-content');
  if (!main) return;

  main.innerHTML = '';
  main.scrollTop = 0;

  _updateBreadcrumb(state);
  _updateSidebarActive(state);

  switch (state.pagina) {
    case 'home':           _renderHome(main); break;
    case 'navegador':      _renderNavegador(main, state); break;
    case 'atividade':      _renderAtividade(main, state); break;
    case 'sobre':          _renderSobre(main); break;
    case 'acessibilidade': _renderAcessibilidade(main, state); break;
    default:               _renderHome(main);
  }
}

/* ===================== PÁGINAS ===================== */

function _renderHome(main) {
  main.innerHTML = `
    <section class="page-home" aria-labelledby="home-title">
      <header class="hero">
        <div class="hero-inner">
          <span class="hero-eyebrow">Laboratório de Práticas Educativas e Extensão</span>
          <h1 id="home-title">Plataforma de Atividades Pedagógicas</h1>
          <p class="hero-desc">
            Acervo de atividades estruturadas para o Ensino Fundamental I,
            organizado por ano, componente curricular e habilidade BNCC.
            Cada atividade inclui três níveis de aprofundamento e recursos de acessibilidade integrados.
          </p>
          <a href="#/navegador" class="btn btn-primary btn-lg">Acessar atividades</a>
        </div>
      </header>

      <section class="home-cards" aria-label="Componentes curriculares disponíveis">
        <h2 class="section-title">Componentes curriculares</h2>
        <div class="cards-grid">
          ${Object.entries(COMPONENTE_LABEL).map(([k, v]) => `
            <a href="#/navegador" class="card card-componente" data-componente="${k}" aria-label="Ver atividades de ${v}">
              <span class="card-label">${v}</span>
            </a>
          `).join('')}
        </div>
      </section>

      <section class="home-info" aria-label="Sobre a plataforma">
        <h2 class="section-title">Como funciona</h2>
        <div class="info-grid">
          <div class="info-item">
            <h3>Hierarquia de navegação</h3>
            <p>Selecione o ano escolar, o componente curricular, a unidade temática e o nível de aprofundamento (Apoio, Básico ou Ampliação).</p>
          </div>
          <div class="info-item">
            <h3>Metadados BNCC e CBTC</h3>
            <p>Cada atividade é vinculada a uma habilidade da Base Nacional Comum Curricular e a uma referência territorial do CBTC-SC.</p>
          </div>
          <div class="info-item">
            <h3>Acessibilidade integrada</h3>
            <p>Todas as atividades seguem os princípios do Desenho Universal para Aprendizagem: múltiplas formas de apresentar, responder e engajar.</p>
          </div>
          <div class="info-item">
            <h3>Modo Professor</h3>
            <p>Ative o Modo Professor para visualizar gabaritos, critérios de correção, objetivos pedagógicos e sugestões de mediação.</p>
          </div>
        </div>
      </section>
    </section>
  `;

  /* Delegação de clique nos cards de componente */
  main.querySelectorAll('.card-componente').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const comp = card.dataset.componente;
      const anos = dataLoader.getAnos();
      setState({ componente: comp, ano: anos[0] ?? 3, pagina: 'navegador' });
      navigate('/navegador');
    });
  });
}

function _renderNavegador(main, state) {
  const anos       = dataLoader.getAnos();
  const componentes = state.ano ? dataLoader.getComponentes(state.ano) : [];
  const unidades   = (state.ano && state.componente)
    ? dataLoader.getUnidades(state.ano, state.componente) : [];
  const todas      = dataLoader.getAllAtividades();

  main.innerHTML = `
    <section class="page-navegador" aria-labelledby="nav-title">
      <h1 id="nav-title" class="page-title">Navegador de Conteúdo</h1>

      <div class="nav-selectors" role="group" aria-label="Filtros de navegação">
        <div class="selector-group">
          <label for="sel-ano" class="selector-label">Ano</label>
          <select id="sel-ano" class="selector-select" aria-label="Selecionar ano escolar">
            <option value="">-- Selecione --</option>
            ${anos.map(a => `<option value="${a}" ${state.ano === a ? 'selected' : ''}>${a}º ano</option>`).join('')}
          </select>
        </div>

        <div class="selector-group">
          <label for="sel-comp" class="selector-label">Componente</label>
          <select id="sel-comp" class="selector-select" aria-label="Selecionar componente curricular" ${!state.ano ? 'disabled' : ''}>
            <option value="">-- Selecione --</option>
            ${componentes.map(c => `<option value="${c}" ${state.componente === c ? 'selected' : ''}>${COMPONENTE_LABEL[c] ?? c}</option>`).join('')}
          </select>
        </div>
      </div>

      <div id="unidades-container" class="unidades-container">
        ${unidades.map(u => {
          const prog = getProgressoUnidade(u.unidade_id, todas);
          const atividadesDaUnidade = dataLoader.getAtividadesDaUnidade(u.unidade_id);
          return `
            <article class="card card-unidade" aria-label="Unidade: ${u.unidade_titulo}">
              <header class="unidade-header">
                <h2 class="unidade-titulo">${u.unidade_titulo}</h2>
                <div class="unidade-progresso" aria-label="Progresso: ${prog.concluidas} de ${prog.total} atividades">
                  <span class="progresso-texto">${prog.concluidas}/${prog.total} concluídas</span>
                  <div class="progresso-bar" role="progressbar" aria-valuenow="${prog.concluidas}" aria-valuemin="0" aria-valuemax="${prog.total}">
                    <div class="progresso-fill" style="width:${prog.total ? Math.round((prog.concluidas/prog.total)*100) : 0}%"></div>
                  </div>
                </div>
              </header>
              <div class="niveis-list">
                ${atividadesDaUnidade.map(a => {
                  const status = getProgress(a.id);
                  return `
                    <a href="#/atividade/${a.id}" class="nivel-link ${status === 'concluida' ? 'concluida' : ''}"
                       aria-label="Nível ${a.nivel}: ${NIVEL_LABEL[a.nivel]} — ${status === 'concluida' ? 'concluída' : 'não concluída'}">
                      <span class="badge badge-nivel badge-n${a.nivel}">${NIVEL_ABBR[a.nivel]}</span>
                      <span class="nivel-nome">${NIVEL_LABEL[a.nivel]}</span>
                      <span class="nivel-tipo">${a.tipo_evidencia}</span>
                      ${status === 'concluida' ? '<span class="check-mark" aria-hidden="true">ok</span>' : ''}
                    </a>
                  `;
                }).join('')}
              </div>
              <div class="unidade-meta">
                <span class="meta-tag" title="Habilidade BNCC">${atividadesDaUnidade[0]?.habilidade_bncc_codigo ?? ''}</span>
                <span class="meta-tag meta-cbtc" title="Referência CBTC">${atividadesDaUnidade[0]?.referencia_cbtc?.split('—')[0]?.trim() ?? ''}</span>
              </div>
            </article>
          `;
        }).join('')}
        ${unidades.length === 0 ? '<p class="empty-state">Selecione ano e componente para ver as unidades.</p>' : ''}
      </div>
    </section>
  `;

  /* Eventos dos selects */
  const selAno = $('sel-ano');
  const selComp = $('sel-comp');

  selAno?.addEventListener('change', () => {
    const ano = Number(selAno.value) || null;
    setState({ ano, componente: null });
    navigate('/navegador');
  });

  selComp?.addEventListener('change', () => {
    setState({ componente: selComp.value || null });
    navigate('/navegador');
  });
}

function _renderAtividade(main, state) {
  const atividade = dataLoader.getAtividade(state.atividade_id);
  if (!atividade) {
    main.innerHTML = `<p class="empty-state">Atividade não encontrada.</p>`;
    return;
  }

  const nivel = atividade.nivel;
  const unidadeAtividades = dataLoader.getAtividadesDaUnidade(atividade.unidade_id);

  main.innerHTML = `
    <section class="page-atividade" aria-labelledby="atv-title">

      <div class="atv-top-bar">
        <div class="nivel-switcher" role="group" aria-label="Selecionar nível">
          ${unidadeAtividades.map(a => `
            <a href="#/atividade/${a.id}"
               class="nivel-tab ${a.id === atividade.id ? 'active' : ''}"
               aria-current="${a.id === atividade.id ? 'page' : 'false'}"
               aria-label="Nível ${a.nivel}: ${NIVEL_LABEL[a.nivel]}">
              <span class="badge badge-nivel badge-n${a.nivel}">${NIVEL_ABBR[a.nivel]}</span>
              ${NIVEL_LABEL[a.nivel]}
            </a>
          `).join('')}
        </div>

        <button id="btn-modo-prof" class="btn btn-secondary btn-sm" type="button"
                aria-pressed="${state.modoProfesor}"
                aria-label="Modo Professor">
          ${state.modoProfesor ? 'Sair do Modo Professor' : 'Modo Professor'}
        </button>
      </div>

      <header class="atv-header">
        <div class="atv-meta">
          <span class="badge badge-nivel badge-n${nivel}">${NIVEL_ABBR[nivel]} — ${NIVEL_LABEL[nivel]}</span>
          <span class="meta-tag">${atividade.habilidade_bncc_codigo}</span>
          <span class="meta-tag meta-cbtc">${atividade.referencia_cbtc}</span>
          <span class="meta-tag">Tempo: ${atividade.tempo_medio_min} min</span>
        </div>
        <h1 id="atv-title" class="atv-titulo">${atividade.unidade_titulo}</h1>
      </header>

      <div class="atv-dua-controls">
        <button id="btn-tts-enunciado" class="btn btn-secondary btn-sm" type="button"
                aria-label="Ouvir enunciado"
                ${ttsSupported() ? '' : 'disabled title="Síntese de fala não disponível neste navegador"'}>
          Ouvir enunciado
        </button>
        <button id="btn-dica" class="btn btn-secondary btn-sm" type="button" aria-expanded="false">
          Ver dica
        </button>
      </div>

      <div class="atv-enunciado" aria-label="Enunciado da atividade">
        <p>${atividade.enunciado}</p>
      </div>

      <div id="dica-panel" class="dica-panel hidden" role="complementary" aria-label="Dica">
        <h3>Dica</h3>
        <p>${atividade.adaptacoes_dua.engajamento}</p>
      </div>

      <div id="atv-engine" class="atv-engine" aria-label="Atividade interativa">
        <!-- Motor de atividade renderizado via JS -->
      </div>

      <div id="modo-prof-panel" class="modo-prof-panel ${state.modoProfesor ? '' : 'hidden'}"
           aria-label="Painel do professor">
        <h2>Painel do Professor</h2>
        <div class="prof-grid">
          <div class="prof-item">
            <h3>Objetivo pedagógico</h3>
            <p>${atividade.modo_professor.objetivo_pedagogico}</p>
          </div>
          <div class="prof-item">
            <h3>Gabarito / Critério de avaliação</h3>
            <p>${atividade.modo_professor.gabarito}</p>
          </div>
          <div class="prof-item">
            <h3>Perguntas orientadoras</h3>
            <ul>
              ${atividade.modo_professor.perguntas_orientadoras.map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>
          <div class="prof-item">
            <h3>Tempo estimado</h3>
            <p>${atividade.modo_professor.tempo_estimado}</p>
          </div>
          <div class="prof-item">
            <h3>Adaptação por nível</h3>
            <p>${atividade.modo_professor.adaptacao_nivel}</p>
          </div>
          <div class="prof-item">
            <h3>DUA — Apresentação</h3>
            <p>${atividade.adaptacoes_dua.apresentacao}</p>
          </div>
          <div class="prof-item">
            <h3>DUA — Resposta</h3>
            <p>${atividade.adaptacoes_dua.resposta}</p>
          </div>
        </div>
      </div>

    </section>
  `;

  /* Renderiza o motor de atividade */
  const engine = $('atv-engine');
  _dispatchActivityEngine(engine, atividade);

  /* TTS no enunciado */
  $('btn-tts-enunciado')?.addEventListener('click', () => {
    speak(atividade.enunciado);
  });

  /* Dica */
  const dicaPanel = $('dica-panel');
  $('btn-dica')?.addEventListener('click', (e) => {
    const open = !dicaPanel.classList.contains('hidden');
    dicaPanel.classList.toggle('hidden', open);
    e.currentTarget.setAttribute('aria-expanded', String(!open));
  });

  /* Modo professor */
  $('btn-modo-prof')?.addEventListener('click', (e) => {
    const atual = state.modoProfesor;
    setState({ modoProfesor: !atual });
    $('modo-prof-panel')?.classList.toggle('hidden', atual);
    e.currentTarget.setAttribute('aria-pressed', String(!atual));
    e.currentTarget.textContent = !atual ? 'Sair do Modo Professor' : 'Modo Professor';
  });
}

function _renderSobre(main) {
  main.innerHTML = `
    <section class="page-sobre" aria-labelledby="sobre-title">
      <h1 id="sobre-title" class="page-title">Sobre este Produto Educacional</h1>

      <div class="sobre-content">
        <section class="sobre-section">
          <h2>O que é esta plataforma</h2>
          <p>
            Este é um produto educacional desenvolvido no contexto do Laboratório de Práticas
            Educativas e Extensão. Seu propósito é oferecer um acervo de atividades estruturadas
            para o Ensino Fundamental I, organizadas por habilidade e acessíveis sem necessidade
            de conexão à internet.
          </p>
        </section>

        <section class="sobre-section">
          <h2>BNCC como espinha dorsal</h2>
          <p>
            A Base Nacional Comum Curricular (BNCC) define as habilidades que organizam este acervo.
            Cada atividade é vinculada a um código de habilidade (ex.: EF03LP06), que funciona como
            metadado de classificação e não como prescrição rígida. O professor pode usar esses códigos
            para localizar atividades alinhadas ao que está sendo trabalhado em sala.
          </p>
        </section>

        <section class="sobre-section">
          <h2>CBTC-SC como referência territorial</h2>
          <p>
            O Currículo Base da Educação Infantil e do Ensino Fundamental do Território Catarinense
            (CBTC-SC) complementa a BNCC com especificidades regionais. Nos metadados de cada atividade,
            o campo <code>referencia_cbtc</code> indica o código territorial correspondente. Esses
            códigos são mantidos como tags de referência e não determinam o conteúdo das atividades.
          </p>
        </section>

        <section class="sobre-section">
          <h2>Desenho Universal para Aprendizagem (DUA)</h2>
          <p>
            O DUA é um conjunto de princípios que orienta o design de materiais acessíveis desde o início,
            sem tratá-lo como adaptação posterior. Esta plataforma implementa três camadas DUA em cada atividade:
          </p>
          <ul>
            <li><strong>Múltiplas formas de apresentar:</strong> texto claro, áudio via Web Speech API, opções de fonte e contraste.</li>
            <li><strong>Múltiplas formas de responder:</strong> clique, arrastar, ordenar, escrever ou gravar oralmente.</li>
            <li><strong>Múltiplas formas de engajar:</strong> missões curtas, feedback sem punição, dicas que orientam sem revelar.</li>
          </ul>
        </section>

        <section class="sobre-section">
          <h2>Licença e uso</h2>
          <p>
            Este produto é distribuído sob licença MIT. O conteúdo pode ser adaptado e redistribuído
            desde que mantida a atribuição original. Consulte o arquivo LICENSE no repositório.
          </p>
        </section>
      </div>
    </section>
  `;
}

function _renderAcessibilidade(main, state) {
  const { prefs } = state;
  main.innerHTML = `
    <section class="page-a11y" aria-labelledby="a11y-title">
      <h1 id="a11y-title" class="page-title">Controles de Acessibilidade</h1>

      <div class="a11y-controls" role="group" aria-label="Preferências de exibição">

        <div class="a11y-item">
          <div class="a11y-info">
            <h2>Fonte grande</h2>
            <p>Aumenta o tamanho do texto em toda a interface. Atalho: Alt + F</p>
          </div>
          <button id="btn-fonte" class="btn btn-toggle ${prefs.fonteGrande ? 'active' : ''}" type="button"
                  aria-pressed="${prefs.fonteGrande}" aria-label="Alternar fonte grande">
            ${prefs.fonteGrande ? 'Ativada' : 'Desativada'}
          </button>
        </div>

        <div class="a11y-item">
          <div class="a11y-info">
            <h2>Alto contraste</h2>
            <p>Aumenta o contraste de cores para facilitar a leitura. Atalho: Alt + C</p>
          </div>
          <button id="btn-contraste" class="btn btn-toggle ${prefs.altoContraste ? 'active' : ''}" type="button"
                  aria-pressed="${prefs.altoContraste}" aria-label="Alternar alto contraste">
            ${prefs.altoContraste ? 'Ativado' : 'Desativado'}
          </button>
        </div>

        <div class="a11y-item">
          <div class="a11y-info">
            <h2>Tema escuro</h2>
            <p>Reduz o brilho da tela com fundo escuro. Atalho: Alt + D</p>
          </div>
          <button id="btn-tema" class="btn btn-toggle ${prefs.temaEscuro ? 'active' : ''}" type="button"
                  aria-pressed="${prefs.temaEscuro}" aria-label="Alternar tema escuro">
            ${prefs.temaEscuro ? 'Ativado' : 'Desativado'}
          </button>
        </div>

      </div>

      <section class="a11y-nav" aria-labelledby="a11y-nav-title">
        <h2 id="a11y-nav-title">Navegação por teclado</h2>
        <table class="atalhos-table">
          <thead>
            <tr><th>Ação</th><th>Tecla</th></tr>
          </thead>
          <tbody>
            <tr><td>Mover entre elementos interativos</td><td>Tab / Shift+Tab</td></tr>
            <tr><td>Ativar botão ou link</td><td>Enter ou Espaço</td></tr>
            <tr><td>Fechar menu lateral / modal</td><td>Esc</td></tr>
            <tr><td>Alternar fonte grande</td><td>Alt + F</td></tr>
            <tr><td>Alternar alto contraste</td><td>Alt + C</td></tr>
            <tr><td>Alternar tema escuro</td><td>Alt + D</td></tr>
          </tbody>
        </table>
      </section>
    </section>
  `;

  /* Importação dinâmica para evitar circular — a11y já foi carregado no main */
  const { toggleFonteGrande, toggleAltoContraste, toggleTemaEscuro, applyAll } = window._a11y;

  $('btn-fonte')?.addEventListener('click', () => { toggleFonteGrande(); navigate('/acessibilidade'); });
  $('btn-contraste')?.addEventListener('click', () => { toggleAltoContraste(); navigate('/acessibilidade'); });
  $('btn-tema')?.addEventListener('click', () => { toggleTemaEscuro(); navigate('/acessibilidade'); });
}

/* ===================== COMPONENTES COMPARTILHADOS ===================== */

function _renderSidebar() {
  const sidebar = $('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <nav aria-label="Navegação principal">
      <ul class="nav-list" role="list">
        <li><a href="#/home" class="nav-link" data-page="home">Início</a></li>
        <li><a href="#/navegador" class="nav-link" data-page="navegador">Atividades</a></li>
        <li><a href="#/sobre" class="nav-link" data-page="sobre">Sobre</a></li>
        <li><a href="#/acessibilidade" class="nav-link" data-page="acessibilidade">Acessibilidade</a></li>
      </ul>
    </nav>
  `;
}

function _setupMenuToggle() {
  const btn = $('btn-menu');
  const sidebar = $('sidebar');
  if (!btn || !sidebar) return;

  btn.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });

  /* Fechar ao clicar fora */
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open')
        && !sidebar.contains(e.target)
        && e.target !== btn) {
      sidebar.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

function _updateBreadcrumb(state) {
  const bc = $('breadcrumb');
  if (!bc) return;

  const parts = [];
  if (state.ano) parts.push(`${state.ano}º ano`);
  if (state.componente) parts.push(COMPONENTE_LABEL[state.componente] ?? state.componente);

  if (state.atividade_id) {
    const atv = dataLoader.getAtividade(state.atividade_id);
    if (atv) {
      parts.push(atv.unidade_titulo);
      parts.push(atv.habilidade_bncc_codigo);
      parts.push(`${NIVEL_ABBR[atv.nivel]} — ${NIVEL_LABEL[atv.nivel]}`);
    }
  }

  bc.innerHTML = parts.length
    ? `<ol class="breadcrumb-list" aria-label="Localização atual">
        ${parts.map((p, i) => `<li class="bc-item ${i === parts.length-1 ? 'bc-current' : ''}" ${i === parts.length-1 ? 'aria-current="page"' : ''}>${p}</li>`).join('')}
       </ol>`
    : '';
}

function _updateSidebarActive(state) {
  document.querySelectorAll('.nav-link').forEach(link => {
    const page = link.dataset.page;
    const active = page === state.pagina;
    link.classList.toggle('active', active);
    link.setAttribute('aria-current', active ? 'page' : 'false');
  });
}

/* ===================== DESPACHO DE MOTOR DE ATIVIDADE ===================== */

function _dispatchActivityEngine(container, atividade) {
  switch (atividade.tipo_evidencia) {
    case 'marcar':  renderMarcar(container, atividade);  break;
    case 'ordenar': renderOrdenar(container, atividade); break;
    case 'arrastar': renderArrastar(container, atividade); break;
    case 'escrever': renderEscrever(container, atividade); break;
    default:
      container.textContent = `Tipo de atividade "${atividade.tipo_evidencia}" nao suportado neste protótipo.`;
  }
}

export { init, renderPage };
