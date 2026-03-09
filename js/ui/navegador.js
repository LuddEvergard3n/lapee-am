/**
 * ui/navegador.js
 * Página do Navegador de Conteúdo.
 * Lista unidades e atividades por ano e componente selecionados.
 * Linguagem simplificada para uso direto por professores e alunos.
 */

import { setState, getProgress } from '../store.js';
import { navigate }            from '../router.js';
import { load, getAnos, getComponentes, getUnidades,
         getAtividadesDaUnidade } from '../dataLoader/index.js';
import { $, COMPONENTE_LABEL, NIVEL_LABEL, NIVEL_ABBR, esc } from './componentes.js';
import { play as playSound } from '../sound.js';

/**
 * Renderiza o navegador de conteúdo.
 * @param {HTMLElement} main
 * @param {object} state
 */
export async function renderNavegador(main, state) {
  /* Se houver ano e componente selecionados, garante que o arquivo esteja carregado */
  if (state.ano && state.componente) {
    await load(state.componente, state.ano);
  }

  const anos        = getAnos();
  const componentes = state.ano ? getComponentes(state.ano) : [];
  const unidades    = (state.ano && state.componente)
    ? getUnidades(state.ano, state.componente) : [];


  main.innerHTML = `
    <section class="page-navegador" aria-labelledby="nav-title">
      <h1 id="nav-title" class="page-title">Qual atividade você quer fazer?</h1>

      <div class="nav-selectors" role="group" aria-label="Filtros">
        <div class="selector-group">
          <label for="sel-ano" class="selector-label">Qual ano?</label>
          <select id="sel-ano" class="selector-select" aria-label="Escolha o ano escolar">
            <option value="">Escolha o ano</option>
            ${anos.map(a =>
              `<option value="${a}" ${state.ano === a ? 'selected' : ''}>${a}º ano</option>`
            ).join('')}
          </select>
        </div>

        <div class="selector-group">
          <label for="sel-comp" class="selector-label">Qual matéria?</label>
          <select id="sel-comp" class="selector-select"
                  aria-label="Escolha a matéria"
                  ${!state.ano ? 'disabled' : ''}>
            <option value="">Escolha a matéria</option>
            ${componentes.map(c =>
              `<option value="${c}" ${state.componente === c ? 'selected' : ''}>${COMPONENTE_LABEL[c] ?? c}</option>`
            ).join('')}
          </select>
        </div>
      </div>

      <div id="unidades-container" class="unidades-container">
        ${unidades.length === 0
          ? `<p class="empty-state">Escolha o ano e a matéria para ver as atividades.</p>`
          : unidades.map(u => _cardUnidade(u)).join('')
        }
      </div>
    </section>
  `;

  /* Eventos dos selects */
  $('sel-ano')?.addEventListener('change', async (e) => {
    const ano = Number(e.target.value) || null;
    playSound('clique');
    setState({ ano, componente: null });
    navigate('/navegador');
  });

  $('sel-comp')?.addEventListener('change', async (e) => {
    const comp = e.target.value || null;
    playSound('clique');
    if (comp && state.ano) await load(comp, state.ano);
    setState({ componente: comp });
    navigate('/navegador');
  });
}

/* ---- Privado ---- */

function _cardUnidade(u) {
  const atividades = getAtividadesDaUnidade(u.unidade_id);
  const total      = atividades.length;
  const statusList = atividades.map(a => getProgress(a.id));
  const concluidas = statusList.filter(s => s === 'concluida').length;

  return `
    <article class="card card-unidade" aria-label="Atividade: ${esc(u.unidade_titulo)}">
      <header class="unidade-header">
        <h2 class="unidade-titulo">${esc(u.unidade_titulo)}</h2>
        <div class="trilha-estrelas" aria-label="${concluidas} de ${total} níveis concluídos">
          ${statusList.map((s, i) => {
            const cls = s === 'concluida' ? 'concluida' : s === 'tentativa' ? 'tentativa' : 'vazia';
            return `<span class="trilha-estrela ${cls}" title="${NIVEL_LABEL[i+1] ?? 'Nível ' + (i+1)}">★</span>`;
          }).join('')}
        </div>
      </header>

      <div class="niveis-list">
        ${atividades.map(a => {
          const status = getProgress(a.id);
          const feito  = status === 'concluida';
          return `
            <a href="#/atividade/${a.id}"
               class="nivel-link ${feito ? 'concluida' : ''}"
               aria-label="Nível ${a.nivel}: ${NIVEL_LABEL[a.nivel]}${feito ? ' — feito' : ''}">
              <span class="badge badge-nivel badge-n${a.nivel}">${NIVEL_ABBR[a.nivel]}</span>
              <span class="nivel-nome">${NIVEL_LABEL[a.nivel]}</span>
              <span class="nivel-tipo">${a.tipo_evidencia}</span>
              ${feito ? '<span class="check-mark" aria-hidden="true">feito</span>' : ''}
            </a>
          `;
        }).join('')}
      </div>

      <div class="unidade-meta">
        <span class="meta-tag" title="Habilidade BNCC">${esc(atividades[0]?.habilidade_bncc_codigo ?? '')}</span>
        <span class="meta-tag meta-cbtc" title="Referência CBTC">${esc(atividades[0]?.referencia_cbtc?.split('—')[0]?.trim() ?? '')}</span>
      </div>
    </article>
  `;
}
