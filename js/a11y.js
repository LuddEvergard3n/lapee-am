/**
 * a11y.js
 * Controles de acessibilidade: fonte grande, alto contraste, tema escuro,
 * navegação por teclado e atalhos globais.
 * Aplica classes no <html> com base nas preferências do store.
 */

import { getState, setState } from './store.js';
import { setMuted } from './sound.js';

const ROOT = document.documentElement;

/**
 * Aplica todas as preferências de acessibilidade salvas no store ao DOM.
 * Deve ser chamado na inicialização e sempre que as prefs mudarem.
 */
function applyAll() {
  const { prefs } = getState();
  _toggle('fonte-grande',    prefs.fonteGrande);
  _toggle('alto-contraste',  prefs.altoContraste);
  _toggle('tema-escuro',     prefs.temaEscuro);
  setMuted(!prefs.somAtivado);
}

/**
 * Alterna o modo de fonte grande.
 */
function toggleFonteGrande() {
  const { prefs } = getState();
  setState({ prefs: { ...prefs, fonteGrande: !prefs.fonteGrande } });
  applyAll();
}

/**
 * Alterna o modo de alto contraste.
 */
function toggleAltoContraste() {
  const { prefs } = getState();
  setState({ prefs: { ...prefs, altoContraste: !prefs.altoContraste } });
  applyAll();
}

/**
 * Alterna o tema escuro.
 */
function toggleTemaEscuro() {
  const { prefs } = getState();
  setState({ prefs: { ...prefs, temaEscuro: !prefs.temaEscuro } });
  applyAll();
}

/**
 * Alterna o som dos efeitos de atividade.
 */
function toggleSom() {
  const { prefs } = getState();
  setState({ prefs: { ...prefs, somAtivado: !prefs.somAtivado } });
  applyAll();
}

/**
 * Registra atalhos de teclado globais.
 * Alt+F: fonte grande
 * Alt+C: alto contraste
 * Alt+D: tema escuro
 * Esc:   fecha drawers/modais abertos
 */
function registerKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'f') { e.preventDefault(); toggleFonteGrande(); }
    if (e.altKey && e.key === 'c') { e.preventDefault(); toggleAltoContraste(); }
    if (e.altKey && e.key === 'd') { e.preventDefault(); toggleTemaEscuro(); }
    if (e.key === 'Escape') _closeOpenDrawers();
  });
}

/**
 * Move o foco para o elemento com id especificado, se existir.
 * Útil após navegação entre páginas para acessibilidade de leitores de tela.
 * @param {string} id
 */
function focusById(id) {
  const el = document.getElementById(id);
  if (el) {
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: false });
  }
}

/* ---- Privados ---- */

function _toggle(className, active) {
  ROOT.classList.toggle(className, active);
}

function _closeOpenDrawers() {
  /* Fecha sidebar/drawer se estiver aberto */
  const drawer = document.getElementById('sidebar');
  if (drawer && drawer.classList.contains('open')) {
    drawer.classList.remove('open');
    const toggle = document.getElementById('btn-menu');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }
}

export {
  applyAll,
  toggleFonteGrande,
  toggleAltoContraste,
  toggleTemaEscuro,
  toggleSom,
  registerKeyboardShortcuts,
  focusById,
};
