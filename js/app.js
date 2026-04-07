/**
 * app.js
 * Ponto de entrada da aplicação.
 * Responsável por: inicializar módulos, registrar rotas e iniciar o roteador.
 */

import * as store  from './store.js';
import * as data    from './dataLoader/index.js';
import * as router  from './router.js';
import * as ui      from './ui/index.js';
import * as a11y    from './a11y.js';

/* Expõe a11y globalmente para acesso em ui/paginas.js sem dependência circular */
window._a11y = a11y;

async function main() {
  /* 1. Inicializar store */
  store.init();

  /* 2. Aplicar preferências de acessibilidade imediatamente */
  a11y.applyAll();
  a11y.registerKeyboardShortcuts();

  /* 3. Carregar todos os dados do acervo inicial */
  try {
    await data.loadAll();
  } catch (err) {
    document.body.innerHTML = `
      <main role="main" style="padding:2rem;font-family:Georgia,serif;max-width:600px;margin:0 auto">
        <h1>Não foi possível carregar as atividades</h1>
        <p>Esta plataforma precisa de um servidor HTTP para funcionar.
           Abrir o arquivo diretamente (<code>file://</code>) não funciona.</p>
        <h2 style="margin-top:1rem">Como resolver:</h2>
        <ul style="margin-top:.5rem;line-height:2">
          <li><strong>Python:</strong> <code>python3 -m http.server 8080</code></li>
          <li><strong>Node.js:</strong> <code>npx serve .</code></li>
          <li><strong>VSCode:</strong> extensão "Live Server" → botão "Go Live"</li>
        </ul>
        <details style="margin-top:1rem">
          <summary>Detalhe técnico</summary>
          <pre style="font-size:.8rem;overflow:auto">${err.message}</pre>
        </details>
      </main>
    `;
    return;
  }

  /* 4. Inicializar UI */
  ui.init();

  /* 5. Conectar store → renderização.
     Só re-renderiza quando campos de navegação mudam.
     Mudanças de prefs (fonteGrande, altoContraste, temaEscuro) não devem destruir
     o motor de atividade em andamento — applyAll() em a11y.js já aplica as classes. */
  let _lastNavKey = '';
  store.subscribe((state) => {
    const navKey = `${state.pagina}|${state.atividade_id}|${state.ano}|${state.componente}|${state.unidade_id}`;
    if (navKey === _lastNavKey) return;
    _lastNavKey = navKey;
    ui.renderPage(state);
  });

  /* 6. Registrar rotas */
  router.on('/home', () => {
    store.setState({ pagina: 'home' });
  });

  router.on('/navegador', () => {
    store.setState({ pagina: 'navegador' });
  });

  router.on('/atividade/:id', ({ id }) => {
    const atv = data.getAtividade(id);
    if (atv) {
      store.setState({
        pagina:       'atividade',
        atividade_id: id,
        ano:          atv.ano,
        componente:   atv.componente,
        unidade_id:   atv.unidade_id,
        nivel:        atv.nivel,
      });
    } else {
      store.setState({ pagina: 'atividade', atividade_id: id });
    }
  });

  router.on('/sobre', () => {
    store.setState({ pagina: 'sobre' });
  });

  router.on('/acessibilidade', () => {
    store.setState({ pagina: 'acessibilidade' });
  });

  router.on('/planos', () => {
    store.setState({ pagina: 'planos' });
  });

  router.on('/guia', () => {
    store.setState({ pagina: 'guia' });
  });

  /* 7. Iniciar roteador */
  router.start();
}

main();
