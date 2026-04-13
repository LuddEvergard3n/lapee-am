/**
 * ui/componentes.js
 * Constantes compartilhadas, helpers de DOM e componentes persistentes
 * (sidebar, breadcrumb, toggle de menu) usados por todas as páginas.
 */

import { setState } from '../store.js';
import { getAtividade } from '../dataLoader/index.js';

/* ---- Atalho de DOM ---- */
export const $ = id => document.getElementById(id);

/**
 * Escapa caracteres HTML especiais em strings de dados antes de inserir via innerHTML.
 * Deve ser aplicado a todo campo JSON interpolado em templates de string.
 * @param {string} str
 * @returns {string}
 */
export function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ---- Constantes de exibição ---- */
export const COMPONENTE_LABEL = {
  'LP':         'Língua Portuguesa',
  'Matemática': 'Matemática',
  'Ciências':   'Ciências',
  'História':   'História',
  'Geografia':  'Geografia',
  'Arte':       'Arte',
};

export const NIVEL_LABEL = { 1: 'Mais fácil', 2: 'Normal', 3: 'Desafio' };
export const NIVEL_ABBR  = { 1: 'N1', 2: 'N2', 3: 'N3' };

/* ---- Sidebar ---- */

/**
 * Monta o conteúdo da sidebar. Chamado uma única vez na inicialização.
 */
export function renderSidebar() {
  const sidebar = $('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <nav aria-label="Menu principal">
      <ul class="nav-list" role="list">
        <li><a href="#/home"          class="nav-link" data-page="home">Início</a></li>
        <li><a href="#/navegador"     class="nav-link" data-page="navegador">Atividades</a></li>
        <li><a href="#/gerador"       class="nav-link" data-page="gerador">Gerar Atividades</a></li>
        <li><a href="#/guia"          class="nav-link" data-page="guia">Guia do Professor</a></li>
        <li><a href="#/planos"        class="nav-link" data-page="planos">Plano de Aula</a></li>
        <li><a href="#/sobre"         class="nav-link" data-page="sobre">Sobre</a></li>
        <li><a href="#/acessibilidade" class="nav-link" data-page="acessibilidade">Acessibilidade</a></li>
      </ul>
    </nav>
  `;
}

/**
 * Marca o link ativo na sidebar com base na página atual.
 * @param {object} state
 */
export function updateSidebarActive(state) {
  document.querySelectorAll('.nav-link').forEach(link => {
    const active = link.dataset.page === state.pagina;
    link.classList.toggle('active', active);
    link.setAttribute('aria-current', active ? 'page' : 'false');
  });
}

/* ---- Menu toggle (mobile drawer) ---- */

/**
 * Registra os eventos do botão de menu mobile. Chamado uma única vez.
 */
export function setupMenuToggle() {
  const btn     = $('btn-menu');
  const sidebar = $('sidebar');
  if (!btn || !sidebar) return;

  btn.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open')
        && !sidebar.contains(e.target)
        && e.target !== btn) {
      sidebar.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ---- Breadcrumb ---- */

/**
 * Atualiza o breadcrumb na topbar com base no estado atual.
 * @param {object} state
 */
export function updateBreadcrumb(state) {
  const bc = $('breadcrumb');
  if (!bc) return;

  const parts = [];
  if (state.ano)        parts.push(`${state.ano}º ano`);
  if (state.componente) parts.push(COMPONENTE_LABEL[state.componente] ?? state.componente);

  if (state.atividade_id) {
    const atv = getAtividade(state.atividade_id);
    if (atv) {
      parts.push(atv.unidade_titulo);
      parts.push(atv.habilidade_bncc_codigo);
      parts.push(`${NIVEL_ABBR[atv.nivel]} — ${NIVEL_LABEL[atv.nivel]}`);
    }
  }

  bc.innerHTML = parts.length
    ? `<ol class="breadcrumb-list" aria-label="Onde você está">
        ${parts.map((p, i) =>
          `<li class="bc-item ${i === parts.length - 1 ? 'bc-current' : ''}"
               ${i === parts.length - 1 ? 'aria-current="page"' : ''}>${p}</li>`
        ).join('')}
       </ol>`
    : '';
}
