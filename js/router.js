/**
 * router.js
 * Roteamento baseado em hash (#) para SPA estática.
 * Não depende de servidor. Compatível com GitHub Pages e abertura local.
 *
 * Formato do hash:
 *   #/home
 *   #/sobre
 *   #/acessibilidade
 *   #/navegador
 *   #/atividade/:id
 */

import { setState } from './store.js';

/** Mapa de rotas: padrão → handler */
const _routes = new Map();

/**
 * Registra um handler para uma rota.
 * @param {string} path - Ex.: '/home', '/atividade/:id'
 * @param {function} handler - Recebe params extraídos da URL.
 */
function on(path, handler) {
  _routes.set(path, handler);
}

/**
 * Inicia o roteador — registra ouvinte de 'hashchange' e resolve rota inicial.
 */
function start() {
  window.addEventListener('hashchange', _resolve);
  _resolve();
}

/**
 * Navega para uma rota programaticamente.
 * @param {string} path - Ex.: '/atividade/lp-001-n1'
 */
function navigate(path) {
  window.location.hash = path;
}

/* ---- Privado ---- */

function _resolve() {
  const raw = window.location.hash.slice(1) || '/home';

  for (const [pattern, handler] of _routes) {
    const params = _match(pattern, raw);
    if (params !== null) {
      handler(params);
      return;
    }
  }

  /* Rota não encontrada → home */
  navigate('/home');
}

/**
 * Tenta casar um padrão de rota com o path atual.
 * @param {string} pattern - Ex.: '/atividade/:id'
 * @param {string} path    - Ex.: '/atividade/lp-001-n1'
 * @returns {object|null}  - Objeto com params ou null se não casar.
 */
function _match(pattern, path) {
  const pSegs = pattern.split('/').filter(Boolean);
  const hSegs = path.split('/').filter(Boolean);
  if (pSegs.length !== hSegs.length) return null;

  const params = {};
  for (let i = 0; i < pSegs.length; i++) {
    if (pSegs[i].startsWith(':')) {
      params[pSegs[i].slice(1)] = hSegs[i];
    } else if (pSegs[i] !== hSegs[i]) {
      return null;
    }
  }
  return params;
}

export { on, start, navigate };
