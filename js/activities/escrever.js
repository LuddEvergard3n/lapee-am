/**
 * activities/escrever.js
 * Motor de atividade do tipo "escrever": campos de texto livre + resposta oral opcional.
 * Nao faz correção automática — o professor avalia ou o aluno autoavalia com critérios.
 */

import { setProgress } from '../store.js';
import { start as recStart, stop as recStop, isRecording, cleanup as recClean } from '../recorder.js';

/**
 * Renderiza atividade de escrita dentro do container.
 * @param {HTMLElement} container
 * @param {object} atividade
 */
function render(container, atividade, opts = {}) {
  const { conteudo_base, id: atv_id, criterios_sucesso } = atividade;
  const { onConcluida, onAcerto } = opts;
  container.innerHTML = '';

  /* Texto de apoio se houver */
  if (conteudo_base.texto) {
    const textoEl = document.createElement('div');
    textoEl.className = 'activity-text';
    textoEl.textContent = conteudo_base.texto;
    container.appendChild(textoEl);
  }

  /* Palavras obrigatórias (badge visual) */
  if (conteudo_base.palavras_obrigatorias?.length) {
    const badgeWrap = document.createElement('div');
    badgeWrap.className = 'palavras-badge-wrap';
    const label = document.createElement('span');
    label.className = 'palavras-label';
    label.textContent = 'Use estas palavras: ';
    badgeWrap.appendChild(label);
    conteudo_base.palavras_obrigatorias.forEach(p => {
      const b = document.createElement('span');
      b.className = 'badge badge-word';
      b.textContent = p;
      badgeWrap.appendChild(b);
    });
    container.appendChild(badgeWrap);
  }

  /* Banco de eventos (se houver) */
  if (conteudo_base.banco_eventos?.length) {
    const bancoWrap = document.createElement('div');
    bancoWrap.className = 'banco-eventos';
    const bancoLabel = document.createElement('p');
    bancoLabel.className = 'banco-label';
    bancoLabel.textContent = 'Banco de eventos para consulta:';
    bancoWrap.appendChild(bancoLabel);
    const ul = document.createElement('ul');
    conteudo_base.banco_eventos.forEach(ev => {
      const li = document.createElement('li');
      li.textContent = ev;
      ul.appendChild(li);
    });
    bancoWrap.appendChild(ul);
    container.appendChild(bancoWrap);
  }

  /* Campos de texto */
  const fieldsWrap = document.createElement('div');
  fieldsWrap.className = 'write-fields';

  const fieldValues = {};

  conteudo_base.campos.forEach(campo => {
    const group = document.createElement('div');
    group.className = 'field-group';

    const label = document.createElement('label');
    label.htmlFor = `field-${atv_id}-${campo.id}`;
    label.className = 'field-label';
    label.textContent = campo.label;

    const textarea = document.createElement('textarea');
    textarea.id = `field-${atv_id}-${campo.id}`;
    textarea.className = 'field-textarea';
    textarea.maxLength = campo.max ?? 300;
    textarea.rows = 4;
    textarea.setAttribute('aria-label', campo.label);

    const counter = document.createElement('span');
    counter.className = 'field-counter';
    counter.textContent = `0 / ${campo.max ?? 300}`;
    counter.setAttribute('aria-live', 'polite');

    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      counter.textContent = `${len} / ${campo.max ?? 300}`;
      fieldValues[campo.id] = textarea.value;
    });

    group.appendChild(label);
    group.appendChild(textarea);
    group.appendChild(counter);
    fieldsWrap.appendChild(group);
  });

  container.appendChild(fieldsWrap);

  /* Critérios de sucesso para autoavaliação */
  if (criterios_sucesso?.length) {
    const criterioWrap = document.createElement('details');
    criterioWrap.className = 'criterio-wrap';
    const sum = document.createElement('summary');
    sum.textContent = 'Critérios de avaliação (para conferir sua resposta)';
    criterioWrap.appendChild(sum);
    const ul = document.createElement('ul');
    criterios_sucesso.forEach(c => {
      const li = document.createElement('li');
      li.textContent = c;
      ul.appendChild(li);
    });
    criterioWrap.appendChild(ul);
    container.appendChild(criterioWrap);
  }

  /* Resposta oral */
  const oralSection = _buildOralSection(atv_id);
  container.appendChild(oralSection);

  /* Botão de conclusão (autoavaliação — sem correção automática) */
  const feedback = document.createElement('div');
  feedback.className = 'feedback-area';
  feedback.setAttribute('aria-live', 'polite');

  const btnConcluir = document.createElement('button');
  btnConcluir.className = 'btn btn-primary';
  btnConcluir.textContent = 'Terminei!';
  btnConcluir.type = 'button';

  btnConcluir.addEventListener('click', () => {
    /* Verifica que pelo menos um campo foi preenchido */
    const algumPreenchido = Object.values(fieldValues).some(v => v.trim().length > 0);
    if (!algumPreenchido) {
      feedback.innerHTML = `<div class="feedback feedback-warn" role="alert">Escreve alguma coisa antes de terminar.</div>`;
      return;
    }
    feedback.innerHTML = `<div class="feedback feedback-ok" role="alert">Anotei sua resposta! Olha os critérios lá em cima para ver se acertou.</div>`;
    setProgress(atv_id, 'concluida');
    btnConcluir.disabled = true;
    if (typeof onAcerto    === 'function') onAcerto();
    if (typeof onConcluida === 'function') onConcluida();
  });

  const actions = document.createElement('div');
  actions.className = 'activity-actions';
  actions.appendChild(btnConcluir);
  actions.appendChild(feedback);
  container.appendChild(actions);
}

/* ---- Seção de resposta oral ---- */

function _buildOralSection(atv_id) {
  const section = document.createElement('div');
  section.className = 'oral-section';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'btn btn-secondary btn-sm';
  toggle.textContent = 'Quero gravar minha resposta';
  toggle.setAttribute('aria-expanded', 'false');

  const panel = document.createElement('div');
  panel.className = 'oral-panel hidden';
  panel.id = `oral-panel-${atv_id}`;

  toggle.addEventListener('click', () => {
    const open = !panel.classList.contains('hidden');
    panel.classList.toggle('hidden', open);
    toggle.setAttribute('aria-expanded', String(!open));
  });

  /* Controles de gravação */
  const statusEl = document.createElement('p');
  statusEl.className = 'oral-status';
  statusEl.textContent = 'Clique em "Começar a gravar" para falar sua resposta.';

  const btnGravar = document.createElement('button');
  btnGravar.type = 'button';
  btnGravar.className = 'btn btn-secondary';
  btnGravar.textContent = 'Começar a gravar';

  const btnParar = document.createElement('button');
  btnParar.type = 'button';
  btnParar.className = 'btn btn-secondary';
  btnParar.textContent = 'Parar de gravar';
  btnParar.disabled = true;

  const audioEl = document.createElement('audio');
  audioEl.controls = true;
  audioEl.className = 'oral-audio hidden';
  audioEl.setAttribute('aria-label', 'Reprodução da resposta gravada');

  btnGravar.addEventListener('click', async () => {
    const result = await recStart();
    if (!result.ok) {
      statusEl.textContent = `Erro: ${result.reason}`;
      return;
    }
    /* Garante que o stream seja liberado se o aluno navegar sem parar a gravação */
    window.addEventListener('hashchange', () => { recClean(); }, { once: true });
    statusEl.textContent = 'Gravando...';
    btnGravar.disabled = true;
    btnParar.disabled = false;
    audioEl.classList.add('hidden');
  });

  btnParar.addEventListener('click', async () => {
    const result = await recStop();
    if (!result.ok) {
      statusEl.textContent = `Erro ao parar: ${result.reason}`;
      return;
    }
    statusEl.textContent = 'Gravação pronta! Ouça abaixo:';
    btnGravar.disabled = false;
    btnParar.disabled = true;
    audioEl.src = result.url;
    audioEl.classList.remove('hidden');
  });

  panel.appendChild(statusEl);

  const btnWrap = document.createElement('div');
  btnWrap.className = 'oral-btn-wrap';
  btnWrap.appendChild(btnGravar);
  btnWrap.appendChild(btnParar);
  panel.appendChild(btnWrap);
  panel.appendChild(audioEl);

  section.appendChild(toggle);
  section.appendChild(panel);
  return section;
}

export { render };
