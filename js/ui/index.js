/**
 * ui/index.js
 * Orquestrador da UI. Substitui o antigo js/ui.js.
 * Expõe apenas init() e renderPage() — a API que app.js consome.
 * Cada página é delegada ao seu módulo específico.
 */

import { renderHome }           from './home.js';
import { renderNavegador }      from './navegador.js';
import { renderAtividade }      from './atividade.js';
import { renderSobre, renderAcessibilidade } from './paginas.js';
import { renderPlanos }         from './planos.js';
import { renderGuia }           from './guia.js';
import { renderGerador }        from './gerador.js';
import {
  renderSidebar,
  setupMenuToggle,
  updateSidebarActive,
  updateBreadcrumb,
  $,
} from './componentes.js';

/**
 * Inicializa os componentes persistentes da interface.
 * Chamado uma única vez em app.js após o carregamento dos dados.
 */
function init() {
  renderSidebar();
  setupMenuToggle();
}

/**
 * Renderiza a página correta com base no estado atual do store.
 * Chamado pelo store.subscribe() a cada mudança de estado.
 * @param {object} state
 */
async function renderPage(state) {
  const main = $('main-content');
  if (!main) return;

  main.innerHTML = '';

  updateBreadcrumb(state);
  updateSidebarActive(state);

  switch (state.pagina) {
    case 'home':
      renderHome(main);
      break;
    case 'navegador':
      await renderNavegador(main, state);
      break;
    case 'atividade':
      renderAtividade(main, state);
      break;
    case 'sobre':
      renderSobre(main);
      break;
    case 'acessibilidade':
      renderAcessibilidade(main, state);
      break;
    case 'planos':
      renderPlanos(main);
      break;
    case 'guia':
      renderGuia(main);
      break;
    case 'gerador':
      renderGerador(main);
      break;
    default:
      renderHome(main);
  }
}

export { init, renderPage };
