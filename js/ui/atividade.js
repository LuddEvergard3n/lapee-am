/**
 * ui/atividade.js
 * Tela de atividade interativa.
 * Inclui: seletor de nível, enunciado, DUA (áudio, dica), motor e painel do professor.
 * Linguagem dos controles simplificada para crianças do Ensino Fundamental I.
 */

import { getAtividade, getAtividadesDaUnidade } from '../dataLoader/index.js';
import { speak, stop as ttsStop, isSpeaking, isSupported as ttsSupported } from '../tts.js';
import { $, NIVEL_LABEL, NIVEL_ABBR, esc } from './componentes.js';

/* Motores de atividade */
import { render as renderMarcar }   from '../activities/marcar.js';
import { render as renderOrdenar }  from '../activities/ordenar.js';
import { render as renderArrastar } from '../activities/arrastar.js';
import { render as renderEscrever } from '../activities/escrever.js';
import { renderMascote, setEstado as mascoteEstado } from '../mascote.js';
import { render as renderDesenhar } from '../activities/desenhar.js';
import { play as playSound } from '../sound.js';

/**
 * Renderiza a tela de atividade.
 * @param {HTMLElement} main
 * @param {object} state
 */
export function renderAtividade(main, state) {
  const atividade = getAtividade(state.atividade_id);

  if (!atividade) {
    main.innerHTML = `<p class="empty-state">Atividade não encontrada.</p>`;
    return;
  }

  const nivel            = atividade.nivel;
  const atividadesUnidade = getAtividadesDaUnidade(atividade.unidade_id);

  main.innerHTML = `
    <section class="page-atividade" aria-labelledby="atv-title">

      <div class="atv-top-bar">
        <div class="nivel-switcher" role="group" aria-label="Escolher nível">
          ${atividadesUnidade.map(a => `
            <a href="#/atividade/${a.id}"
               class="nivel-tab ${a.id === atividade.id ? 'active' : ''}"
               aria-current="${a.id === atividade.id ? 'page' : 'false'}"
               aria-label="Nível ${a.nivel}: ${NIVEL_LABEL[a.nivel]}">
              <span class="badge badge-nivel badge-n${a.nivel}">${NIVEL_ABBR[a.nivel]}</span>
              ${NIVEL_LABEL[a.nivel]}
            </a>
          `).join('')}
        </div>

        <button id="btn-modo-prof"
                class="btn btn-secondary btn-sm"
                type="button"
                aria-pressed="${state.modoProfesor}"
                aria-label="Painel do professor">
          ${state.modoProfesor ? 'Fechar' : 'Para o professor'}
        </button>
      </div>

      <header class="atv-header">
        <div class="atv-meta">
          <span class="badge badge-nivel badge-n${nivel}">${NIVEL_ABBR[nivel]} — ${NIVEL_LABEL[nivel]}</span>
          <span class="meta-tag" title="Habilidade BNCC">${esc(atividade.habilidade_bncc_codigo)}</span>
          <span class="meta-tag meta-cbtc" title="Referência CBTC">${esc(atividade.referencia_cbtc)}</span>
          <span class="meta-tag">Tempo: uns ${esc(String(atividade.tempo_medio_min))} minutos</span>
        </div>
        <h1 id="atv-title" class="atv-titulo">${esc(atividade.unidade_titulo)}</h1>
      </header>

      <div class="atv-dua-controls">
        <button id="btn-tts-enunciado"
                class="btn btn-secondary btn-sm"
                type="button"
                aria-label="Ouvir a pergunta em voz alta"
                ${ttsSupported() ? '' : 'disabled title="Voz não disponível neste navegador"'}>
          Ouvir
        </button>
        <button id="btn-dica"
                class="btn btn-secondary btn-sm"
                type="button"
                aria-expanded="false">
          Preciso de ajuda
        </button>
      </div>

      <div class="atv-enunciado" aria-label="O que você vai fazer">
        <p>${esc(atividade.enunciado)}</p>
      </div>

      <div id="dica-panel"
           class="dica-panel hidden"
           role="complementary"
           aria-label="Ajuda">
        <h3>Uma ajudinha</h3>
        <p>${esc(atividade.adaptacoes_dua.engajamento)}</p>
      </div>

      <div id="atv-engine"
           class="atv-engine"
           aria-label="Atividade interativa">
      </div>

      <div id="modo-prof-panel"
           class="modo-prof-panel ${state.modoProfesor ? '' : 'hidden'}"
           aria-label="Painel do Professor">
        <h2>Para o professor</h2>
        <div class="prof-grid">
          <div class="prof-item">
            <h3>O que o aluno vai aprender</h3>
            <p>${esc(atividade.modo_professor.objetivo_pedagogico)}</p>
          </div>
          <div class="prof-item">
            <h3>Resposta esperada</h3>
            <p>${esc(atividade.modo_professor.gabarito)}</p>
          </div>
          <div class="prof-item">
            <h3>Perguntas para orientar o aluno</h3>
            <ul>
              ${atividade.modo_professor.perguntas_orientadoras.map(p => `<li>${esc(p)}</li>`).join('')}
            </ul>
          </div>
          <div class="prof-item">
            <h3>Tempo sugerido</h3>
            <p>${esc(atividade.modo_professor.tempo_estimado)}</p>
          </div>
          <div class="prof-item">
            <h3>O que muda neste nível</h3>
            <p>${esc(atividade.modo_professor.adaptacao_nivel)}</p>
          </div>
          <div class="prof-item">
            <h3>Como o conteúdo é apresentado</h3>
            <p>${esc(atividade.adaptacoes_dua.apresentacao)}</p>
          </div>
          <div class="prof-item">
            <h3>Formas de responder</h3>
            <p>${esc(atividade.adaptacoes_dua.resposta)}</p>
          </div>
        </div>
      </div>

    </section>
  `;

  /* Motor da atividade */
  _despacharMotor($('atv-engine'), atividade);

  /* Ouvir enunciado — alterna entre "Ouvir" e "Ouvindo..." com feedback visual.
     Segundo clique cancela a leitura. Para quando navegar para outra página. */
  const btnTts = $('btn-tts-enunciado');
  if (btnTts) {
    const _resetBtn = () => {
      btnTts.textContent = 'Ouvir';
      btnTts.classList.remove('active');
      btnTts.setAttribute('aria-pressed', 'false');
    };

    btnTts.addEventListener('click', () => {
      if (isSpeaking()) {
        ttsStop();
        _resetBtn();
        return;
      }
      speak(atividade.enunciado, {
        onEnd: _resetBtn,
      });
      btnTts.textContent = 'Ouvindo...';
      btnTts.classList.add('active');
      btnTts.setAttribute('aria-pressed', 'true');
    });

    /* Limpa estado do botão ao navegar para outra página */
    window.addEventListener('hashchange', () => { if (isSpeaking()) ttsStop(); }, { once: true });
  }

  /* Dica */
  const dicaPanel = $('dica-panel');
  $('btn-dica')?.addEventListener('click', (e) => {
    const aberto = !dicaPanel.classList.contains('hidden');
    dicaPanel.classList.toggle('hidden', aberto);
    e.currentTarget.setAttribute('aria-expanded', String(!aberto));
    e.currentTarget.textContent = aberto ? 'Preciso de ajuda' : 'Fechar ajuda';
  });

  /* Modo professor — manipula DOM direto para não acionar re-render via setState */
  $('btn-modo-prof')?.addEventListener('click', (e) => {
    const profPanel = $('modo-prof-panel');
    if (!profPanel) return;
    const aberto = !profPanel.classList.contains('hidden');
    profPanel.classList.toggle('hidden', aberto);
    e.currentTarget.setAttribute('aria-pressed', String(!aberto));
    e.currentTarget.textContent = !aberto ? 'Fechar' : 'Para o professor';
  });
}

/* ---- Privado ---- */

function _despacharMotor(container, atividade) {
  /* Área com mascote ao lado do feedback */
  const feedbackRow = document.createElement('div');
  feedbackRow.className = 'atv-feedback-row';

  const engineInner = document.createElement('div');
  engineInner.className = 'atv-engine-inner';
  engineInner.style.flex = '1';

  const mascoteArea = document.createElement('div');
  mascoteArea.className = 'atv-mascote-area';
  renderMascote(mascoteArea);

  feedbackRow.appendChild(engineInner);
  feedbackRow.appendChild(mascoteArea);
  container.appendChild(feedbackRow);

  const opts = {
    onConcluida: () => {
      playSound('conquista');
      mascoteEstado('conquista', 2500);
      _mostrarBannerConcluida(engineInner, atividade);
    },
    onAcerto: () => { playSound('acerto'); mascoteEstado('acerto', 2500); },
    onErro:   () => { playSound('erro');   mascoteEstado('erro',   2000); },
  };
  switch (atividade.tipo_evidencia) {
    case 'marcar':   renderMarcar(engineInner, atividade, opts);   break;
    case 'ordenar':  renderOrdenar(engineInner, atividade, opts);  break;
    case 'arrastar': renderArrastar(engineInner, atividade, opts); break;
    case 'escrever':  renderEscrever(engineInner, atividade, opts);  break;
    case 'desenhar':  renderDesenhar(engineInner, atividade, opts);  break;
    default:
      engineInner.textContent = `Tipo de atividade "${atividade.tipo_evidencia}" ainda não disponível.`;
  }
}

/**
 * Exibe banner de parabéns e botão para voltar ao navegador após concluir.
 * Não força navegação automática — professor pode querer revisar com o aluno.
 * @param {HTMLElement} container
 * @param {object} atividade
 */
function _mostrarBannerConcluida(container, atividade) {
  /* Evita duplicar se chamado mais de uma vez */
  if (container.querySelector('.banner-concluida')) return;

  const banner = document.createElement('div');
  banner.className = 'banner-concluida';
  banner.setAttribute('role', 'status');
  banner.innerHTML = `
    <p class="banner-texto">Atividade concluída!</p>
    <a href="#/navegador" class="btn btn-primary btn-sm">Escolher outra atividade</a>
  `;
  container.appendChild(banner);
}
