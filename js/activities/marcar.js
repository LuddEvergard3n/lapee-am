/**
 * activities/marcar.js
 * Motor de atividade do tipo "marcar".
 *
 * Formatos de conteudo_base suportados:
 *
 *   (A) Escolha única:
 *       { opcoes: string[], resposta_correta: number }
 *
 *   (B) Múltipla escolha:
 *       { opcoes: string[], respostas_corretas: number[] }
 *
 *   (C) Pares (cada situação tem suas próprias opções):
 *       { pares: Array<{ situacao|descricao: string, opcoes: string[], correta: number }> }
 *
 * Todos os índices são baseados em zero.
 */

import { setProgress } from '../store.js';

function render(container, atividade, opts = {}) {
  const { conteudo_base } = atividade;
  const { onConcluida, onAcerto, onErro } = opts;
  container.innerHTML = '';

  if (conteudo_base.texto) {
    const el = document.createElement('div');
    el.className = 'activity-text';
    el.textContent = conteudo_base.texto;
    container.appendChild(el);
  }

  if (conteudo_base.contexto) {
    const el = document.createElement('div');
    el.className = 'activity-context';
    el.textContent = conteudo_base.contexto;
    container.appendChild(el);
  }

  if (conteudo_base.pares) {
    _renderPares(container, atividade, opts);
    return;
  }

  if ('respostas_corretas' in conteudo_base) {
    _renderMulti(container, atividade, opts);
    return;
  }

  _renderSingle(container, atividade, opts);
}

function _renderSingle(container, atividade, opts = {}) {
  const { onConcluida, onAcerto, onErro } = opts;
  const { conteudo_base, id: atv_id } = atividade;
  const { opcoes, resposta_correta } = conteudo_base;

  const list = document.createElement('ul');
  list.className = 'options-list';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-label', 'Opções de resposta');

  let selectedIdx = null;

  opcoes.forEach((texto, idx) => {
    const li  = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = texto;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');
    btn.type = 'button';

    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      selectedIdx = idx;
      list.querySelectorAll('.option-btn').forEach(b => {
        b.setAttribute('aria-checked', 'false');
        b.classList.remove('selected');
      });
      btn.setAttribute('aria-checked', 'true');
      btn.classList.add('selected');
    });

    li.appendChild(btn);
    list.appendChild(li);
  });

  container.appendChild(list);
  container.appendChild(
    _buildConfirm(atv_id, container, onConcluida, onAcerto, onErro, () => {
      if (selectedIdx === null) return null;
      return selectedIdx === resposta_correta;
    })
  );
}

function _renderMulti(container, atividade, opts = {}) {
  const { onConcluida, onAcerto, onErro } = opts;
  const { conteudo_base, id: atv_id } = atividade;
  const { opcoes, respostas_corretas } = conteudo_base;

  const instrucao = document.createElement('p');
  instrucao.className = 'activity-instruction';
  instrucao.textContent = 'Marca ' + respostas_corretas.length + (respostas_corretas.length === 1 ? ' resposta.' : ' respostas.');
  container.appendChild(instrucao);

  const list = document.createElement('ul');
  list.className = 'options-list';
  list.setAttribute('role', 'group');
  list.setAttribute('aria-label', 'Opções de resposta');

  const selected = new Set();

  opcoes.forEach((texto, idx) => {
    const li  = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = texto;
    btn.setAttribute('aria-pressed', 'false');
    btn.type = 'button';

    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      if (selected.has(idx)) {
        selected.delete(idx);
        btn.setAttribute('aria-pressed', 'false');
        btn.classList.remove('selected');
      } else {
        selected.add(idx);
        btn.setAttribute('aria-pressed', 'true');
        btn.classList.add('selected');
      }
    });

    li.appendChild(btn);
    list.appendChild(li);
  });

  container.appendChild(list);

  const correctSet = new Set(respostas_corretas);
  container.appendChild(
    _buildConfirm(atv_id, container, onConcluida, onAcerto, onErro, () => {
      if (selected.size === 0) return null;
      if (selected.size !== correctSet.size) return false;
      for (const idx of selected) {
        if (!correctSet.has(idx)) return false;
      }
      return true;
    })
  );
}

function _renderPares(container, atividade, opts = {}) {
  const { onConcluida, onAcerto, onErro } = opts;
  const { conteudo_base, id: atv_id } = atividade;
  const { pares } = conteudo_base;

  const respostas = new Array(pares.length).fill(null);

  pares.forEach((par, parIdx) => {
    const grupo = document.createElement('div');
    grupo.className = 'pair-group';

    const situacao = document.createElement('p');
    situacao.className = 'pair-situacao';
    situacao.textContent = par.situacao || par.descricao;
    grupo.appendChild(situacao);

    const list = document.createElement('ul');
    list.className = 'options-list options-inline';
    list.setAttribute('role', 'radiogroup');

    par.opcoes.forEach((texto, optIdx) => {
      const li  = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = 'option-btn option-sm';
      btn.textContent = texto;
      btn.type = 'button';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');

      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        list.querySelectorAll('.option-btn').forEach(b => {
          b.setAttribute('aria-checked', 'false');
          b.classList.remove('selected');
        });
        btn.setAttribute('aria-checked', 'true');
        btn.classList.add('selected');
        respostas[parIdx] = optIdx;
      });

      li.appendChild(btn);
      list.appendChild(li);
    });

    grupo.appendChild(list);
    container.appendChild(grupo);
  });

  container.appendChild(
    _buildConfirm(atv_id, container, onConcluida, onAcerto, onErro, () => {
      if (respostas.some(r => r === null)) return null;
      const corretas = pares.filter((p, i) => respostas[i] === p.correta).length;
      if (corretas === pares.length) return true;
      return { parcial: true, corretas, total: pares.length };
    })
  );
}

/**
 * Constrói bloco de confirmação + feedback.
 * checkFn() deve retornar:
 *   null  → nada selecionado ainda
 *   true  → acerto
 *   false → erro
 *   { parcial: true, corretas, total } → erro parcial (modo pares)
 */
function _buildConfirm(atv_id, container, onConcluida, onAcerto, onErro, checkFn) {
  const wrap = document.createElement('div');
  wrap.className = 'activity-actions';

  const feedback = document.createElement('div');
  feedback.className = 'feedback-area';
  feedback.setAttribute('aria-live', 'polite');

  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'Pronto!';
  btn.type = 'button';

  btn.addEventListener('click', () => {
    const result = checkFn();
    feedback.innerHTML = '';

    if (result === null) {
      feedback.innerHTML = '<div class="feedback feedback-warn" role="alert">Escolhe uma resposta primeiro.</div>';
      return;
    }

    if (result === true) {
      feedback.innerHTML = '<div class="feedback feedback-ok" role="alert">Isso aí! Acertou!</div>';
      setProgress(atv_id, 'concluida');
      _disableAll(container);
      if (typeof onAcerto    === 'function') onAcerto();
      if (typeof onConcluida === 'function') onConcluida();
      return;
    }

    if (result && result.parcial) {
      feedback.innerHTML = '<div class="feedback feedback-err" role="alert">' + result.corretas + ' de ' + result.total + ' certas. Quase! Tenta de novo.</div>';
      setProgress(atv_id, 'tentativa');
      if (typeof onErro === 'function') onErro();
      return;
    }

    feedback.innerHTML = '<div class="feedback feedback-err" role="alert">Quase! Tenta de novo.</div>';
    setProgress(atv_id, 'tentativa');
    if (typeof onErro === 'function') onErro();
  });

  wrap.appendChild(btn);
  wrap.appendChild(feedback);
  return wrap;
}

function _disableAll(container) {
  container.querySelectorAll('button.option-btn').forEach(b => { b.disabled = true; });
}

export { render };
