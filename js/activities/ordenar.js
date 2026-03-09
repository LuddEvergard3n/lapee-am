/**
 * activities/ordenar.js
 * Motor de atividade do tipo "ordenar": o aluno reordena cards via drag-and-drop
 * ou botões de teclado. Valida a sequência ao confirmar.
 */

import { setProgress } from '../store.js';

/**
 * Renderiza uma atividade de ordenação dentro do container.
 * @param {HTMLElement} container
 * @param {object} atividade
 */
function render(container, atividade, opts = {}) {
  const { conteudo_base, id: atv_id } = atividade;
  const { onConcluida, onAcerto, onErro } = opts;
  const itens = [...conteudo_base.itens];

  container.innerHTML = '';

  /* Estado de drag local ao motor — evita variável de módulo compartilhada */
  const dragState = { src: null };

  /* Embaralha os itens para exibição (Fisher-Yates) */
  const shuffled = _shuffle([...itens.keys()].map(i => ({ idx: i, texto: itens[i] })));

  const lista = document.createElement('ol');
  lista.className = 'sort-list';
  lista.setAttribute('aria-label', 'Lista para ordenar — arraste ou use os botoes');

  const renderCards = () => {
    lista.innerHTML = '';
    shuffled.forEach((item, pos) => {
      const li = document.createElement('li');
      li.className = 'sort-card';
      li.draggable = true;
      li.dataset.pos = pos;
      li.dataset.origIdx = item.idx;

      const grip = document.createElement('span');
      grip.className = 'sort-grip';
      grip.setAttribute('aria-hidden', 'true');
      grip.textContent = '::';

      const texto = document.createElement('span');
      texto.className = 'sort-texto';
      texto.textContent = item.texto;

      /* Botões de mover para cima/baixo (acessibilidade de teclado) */
      const btnUp = document.createElement('button');
      btnUp.type = 'button';
      btnUp.className = 'sort-btn';
      btnUp.setAttribute('aria-label', `Mover item ${pos + 1} para cima`);
      btnUp.textContent = 'cima';
      btnUp.disabled = pos === 0;

      const btnDown = document.createElement('button');
      btnDown.type = 'button';
      btnDown.className = 'sort-btn';
      btnDown.setAttribute('aria-label', `Mover item ${pos + 1} para baixo`);
      btnDown.textContent = 'baixo';
      btnDown.disabled = pos === shuffled.length - 1;

      btnUp.addEventListener('click', () => {
        if (pos === 0) return;
        [shuffled[pos], shuffled[pos - 1]] = [shuffled[pos - 1], shuffled[pos]];
        renderCards();
      });

      btnDown.addEventListener('click', () => {
        if (pos === shuffled.length - 1) return;
        [shuffled[pos], shuffled[pos + 1]] = [shuffled[pos + 1], shuffled[pos]];
        renderCards();
      });

      li.appendChild(grip);
      li.appendChild(texto);

      const btnWrap = document.createElement('div');
      btnWrap.className = 'sort-btn-wrap';
      btnWrap.appendChild(btnUp);
      btnWrap.appendChild(btnDown);
      li.appendChild(btnWrap);

      /* Drag-and-drop */
      _attachDrag(li, pos, shuffled, renderCards, dragState);

      lista.appendChild(li);
    });
  };

  renderCards();
  container.appendChild(lista);

  /* Feedback e confirmação */
  const feedback = document.createElement('div');
  feedback.className = 'feedback-area';
  feedback.setAttribute('aria-live', 'polite');

  const btnConfirmar = document.createElement('button');
  btnConfirmar.className = 'btn btn-primary';
  btnConfirmar.textContent = 'Pronto, essa é minha ordem';
  btnConfirmar.type = 'button';

  btnConfirmar.addEventListener('click', () => {
    const currentOrder = shuffled.map(item => item.idx);
    const correct = conteudo_base.ordem_correta;
    const ok = currentOrder.every((v, i) => v === correct[i]);

    feedback.innerHTML = '';
    if (ok) {
      feedback.innerHTML = `<div class="feedback feedback-ok" role="alert">Isso aí! Essa é a ordem certa!</div>`;
      setProgress(atv_id, 'concluida');
      lista.querySelectorAll('button').forEach(b => (b.disabled = true));
      lista.querySelectorAll('.sort-card').forEach(c => (c.draggable = false));
      btnConfirmar.disabled = true;
      if (typeof onAcerto    === 'function') onAcerto();
      if (typeof onConcluida === 'function') onConcluida();
    } else {
      feedback.innerHTML = `<div class="feedback feedback-err" role="alert">Quase! Tenta de novo.</div>`;
      setProgress(atv_id, 'tentativa');
      if (typeof onErro === 'function') onErro();
    }
  });

  const actions = document.createElement('div');
  actions.className = 'activity-actions';
  actions.appendChild(btnConfirmar);
  actions.appendChild(feedback);
  container.appendChild(actions);
}

/* ---- Privados ---- */

function _shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* _dragSrc é passado por referência via objeto wrapper para que _attachDrag possa
   modificar o valor no closure correto sem variável de módulo compartilhada. */
function _attachDrag(li, pos, shuffled, rerender, dragState) {
  li.addEventListener('dragstart', (e) => {
    dragState.src = pos;
    e.dataTransfer.effectAllowed = 'move';
    li.classList.add('dragging');
  });

  li.addEventListener('dragend', () => {
    li.classList.remove('dragging');
  });

  li.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    li.classList.add('drag-over');
  });

  li.addEventListener('dragleave', () => {
    li.classList.remove('drag-over');
  });

  li.addEventListener('drop', (e) => {
    e.preventDefault();
    li.classList.remove('drag-over');
    if (dragState.src === null || dragState.src === pos) return;
    [shuffled[dragState.src], shuffled[pos]] = [shuffled[pos], shuffled[dragState.src]];
    dragState.src = null;
    rerender();
  });
}

export { render };
