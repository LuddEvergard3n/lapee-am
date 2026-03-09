/**
 * activities/arrastar.js
 * Motor de atividade do tipo "arrastar": associar itens a colunas/categorias.
 * Suporta pares (blocos → coluna) e categorias abertas.
 * Acessível: alternativa de clique sequencial para teclado/mobile.
 */

import { setProgress } from '../store.js';

/**
 * Renderiza atividade de arrastar dentro do container.
 * @param {HTMLElement} container
 * @param {object} atividade
 */
function render(container, atividade, opts = {}) {
  const { conteudo_base, id: atv_id } = atividade;
  const { onConcluida, onAcerto, onErro } = opts;

  container.innerHTML = '';

  /* Detecta subtipo — passa opts completo para que onAcerto/onErro cheguem ao _appendValidation */
  if (conteudo_base.pares && !conteudo_base.categorias) {
    _renderPares(container, atividade, opts);
  } else if (conteudo_base.categorias) {
    _renderCategorias(container, atividade, opts);
  } else if (conteudo_base.blocos) {
    _renderBlocos(container, atividade, opts);
  }
}

/* ---- Pares: arrastar descrição para nome (ex.: geo-001-n2) ---- */

function _renderPares(container, atividade, opts = {}) {
  const { onConcluida, onAcerto, onErro } = opts;
  const { conteudo_base, id: atv_id } = atividade;
  const { pares } = conteudo_base;

  const instrucao = document.createElement('p');
  instrucao.className = 'activity-instruction';
  instrucao.textContent = 'Arrasta cada palavra para o lugar certo. Ou clica na palavra e depois no lugar.';
  container.appendChild(instrucao);

  /* Estado de seleção (alternativa de clique) */
  let selected = null;

  /* Zona de destinos */
  const targets = document.createElement('div');
  targets.className = 'drag-targets';

  /* Zona de fontes */
  const sources = document.createElement('div');
  sources.className = 'drag-sources';

  /* Mapa: nome → elemento de destino */
  const targetMap = new Map();
  /* Mapa: id do chip → nome esperado */
  const expectedMap = new Map();

  pares.forEach((par, i) => {
    const chip = document.createElement('div');
    chip.className = 'drag-chip';
    chip.draggable = true;
    chip.dataset.id = `chip-${i}`;
    chip.dataset.target = par.nome;
    chip.textContent = par.elemento;
    chip.setAttribute('tabindex', '0');
    chip.setAttribute('role', 'button');
    chip.setAttribute('aria-label', `Arrasta: ${par.elemento}`);
    expectedMap.set(`chip-${i}`, par.nome);
    sources.appendChild(chip);

    /* Drag source events */
    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', `chip-${i}`);
      chip.classList.add('dragging');
    });
    chip.addEventListener('dragend', () => chip.classList.remove('dragging'));

    /* Alternativa clique */
    chip.addEventListener('click', () => {
      if (chip.classList.contains('placed')) return;
      sources.querySelectorAll('.drag-chip').forEach(c => c.classList.remove('sel-source'));
      chip.classList.add('sel-source');
      selected = chip;
    });
    chip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chip.click(); }
    });
  });

  /* Embaralha os targets para não dar a ordem direta */
  const shuffledPares = _shuffle([...pares]);

  shuffledPares.forEach((par) => {
    const zone = document.createElement('div');
    zone.className = 'drag-zone';
    zone.dataset.name = par.nome;
    zone.setAttribute('aria-label', `Destino: ${par.nome}`);

    const label = document.createElement('div');
    label.className = 'drag-zone-label';
    label.textContent = par.nome;

    const slot = document.createElement('div');
    slot.className = 'drag-zone-slot';
    slot.dataset.name = par.nome;

    zone.appendChild(label);
    zone.appendChild(slot);
    targets.appendChild(zone);
    targetMap.set(par.nome, slot);

    /* Drop events */
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      /* Slot de pares aceita apenas 1 chip */
      if (slot.children.length > 0) return;
      const chipId = e.dataTransfer.getData('text/plain');
      const chip = sources.querySelector(`[data-id="${chipId}"]`)
                ?? container.querySelector(`[data-id="${chipId}"]`);
      if (!chip || chip.classList.contains('placed')) return;
      _placeChip(chip, slot);
    });

    /* Alternativa clique no destino */
    zone.addEventListener('click', () => {
      if (!selected || slot.children.length > 0) return;
      _placeChip(selected, slot);
      selected = null;
    });
  });

  container.appendChild(sources);
  container.appendChild(targets);
  _appendValidation(container, atv_id, expectedMap, targetMap, onConcluida, onAcerto, onErro);
}

/* ---- Categorias: múltiplos itens → categorias (ex.: art-001-n2) ---- */

function _renderCategorias(container, atividade, opts = {}) {
  const { onConcluida, onAcerto, onErro } = opts;
  const { conteudo_base, id: atv_id } = atividade;
  const { itens, categorias } = conteudo_base;

  const instrucao = document.createElement('p');
  instrucao.className = 'activity-instruction';
  instrucao.textContent = 'Arrasta cada coisa para o grupo certo. Ou clica nela e depois no grupo.';
  container.appendChild(instrucao);

  let selected = null;
  const expectedMap = new Map();
  const targetMap   = new Map();

  const sources = document.createElement('div');
  sources.className = 'drag-sources';

  /* Atribui IDs estáveis antes de embaralhar */
  const itensComId = itens.map((item, i) => ({ ...item, id: item.id != null ? item.id : 'cat-item-' + i }));

  _shuffle(itensComId).forEach((item) => {
    const chip = document.createElement('div');
    chip.className = 'drag-chip';
    chip.draggable = true;
    chip.dataset.id = item.id;
    chip.dataset.expected = item.categoria;
    chip.textContent = item.label;
    chip.setAttribute('tabindex', '0');
    chip.setAttribute('role', 'button');
    expectedMap.set(item.id, item.categoria);
    sources.appendChild(chip);

    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', item.id);
      chip.classList.add('dragging');
    });
    chip.addEventListener('dragend', () => chip.classList.remove('dragging'));

    chip.addEventListener('click', () => {
      if (chip.classList.contains('placed')) return;
      sources.querySelectorAll('.drag-chip').forEach(c => c.classList.remove('sel-source'));
      chip.classList.add('sel-source');
      selected = chip;
    });
    chip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chip.click(); }
    });
  });

  const targetsEl = document.createElement('div');
  targetsEl.className = 'drag-targets drag-targets-grid';

  categorias.forEach((cat) => {
    const zone = document.createElement('div');
    zone.className = 'drag-zone';
    zone.dataset.name = cat;
    zone.setAttribute('aria-label', `Categoria: ${cat}`);

    const label = document.createElement('div');
    label.className = 'drag-zone-label';
    label.textContent = cat;

    const slot = document.createElement('div');
    slot.className = 'drag-zone-slot drag-zone-slot-multi';
    slot.dataset.name = cat;

    zone.appendChild(label);
    zone.appendChild(slot);
    targetsEl.appendChild(zone);
    targetMap.set(cat, slot);

    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const chipId = e.dataTransfer.getData('text/plain');
      const chip = sources.querySelector(`[data-id="${chipId}"]`);
      if (!chip || chip.classList.contains('placed')) return;
      _placeChip(chip, slot);
    });

    zone.addEventListener('click', () => {
      if (!selected) return;
      _placeChip(selected, slot);
      selected = null;
    });
  });

  container.appendChild(sources);
  container.appendChild(targetsEl);
  _appendValidation(container, atv_id, expectedMap, targetMap, onConcluida, onAcerto, onErro);
}

/* ---- Blocos: numéricos (ex.: mat-001-n2) ---- */

function _renderBlocos(container, atividade, opts = {}) {
  const { onConcluida, onAcerto, onErro } = opts;
  const { conteudo_base, id: atv_id } = atividade;
  const { blocos, colunas } = conteudo_base;

  const instrucao = document.createElement('p');
  instrucao.className = 'activity-instruction';
  instrucao.textContent = 'Arrasta cada grupo para o lugar certo.';
  container.appendChild(instrucao);

  let selected = null;
  const expectedMap = new Map();
  const targetMap   = new Map();

  const sources = document.createElement('div');
  sources.className = 'drag-sources';

  _shuffle([...blocos]).forEach((bloco) => {
    if (bloco.posicao === 'distrator') {
      /* Distratores ficam nas fontes mas não devem ir para nenhuma coluna real */
    }
    const chip = document.createElement('div');
    chip.className = 'drag-chip';
    chip.draggable = true;
    chip.dataset.id = bloco.id;
    chip.dataset.expected = bloco.posicao;
    chip.textContent = bloco.label;
    chip.setAttribute('tabindex', '0');
    chip.setAttribute('role', 'button');
    expectedMap.set(bloco.id, bloco.posicao);
    sources.appendChild(chip);

    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', bloco.id);
      chip.classList.add('dragging');
    });
    chip.addEventListener('dragend', () => chip.classList.remove('dragging'));

    chip.addEventListener('click', () => {
      if (chip.classList.contains('placed')) return;
      sources.querySelectorAll('.drag-chip').forEach(c => c.classList.remove('sel-source'));
      chip.classList.add('sel-source');
      selected = chip;
    });
    chip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chip.click(); }
    });
  });

  const targetsEl = document.createElement('div');
  targetsEl.className = 'drag-targets';

  colunas.forEach((col) => {
    const zone = document.createElement('div');
    zone.className = 'drag-zone';
    zone.dataset.name = col;

    const label = document.createElement('div');
    label.className = 'drag-zone-label';
    label.textContent = col.charAt(0).toUpperCase() + col.slice(1);

    const slot = document.createElement('div');
    slot.className = 'drag-zone-slot drag-zone-slot-multi';
    slot.dataset.name = col;

    zone.appendChild(label);
    zone.appendChild(slot);
    targetsEl.appendChild(zone);
    targetMap.set(col, slot);

    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const chipId = e.dataTransfer.getData('text/plain');
      const chip = sources.querySelector(`[data-id="${chipId}"]`);
      if (!chip || chip.classList.contains('placed')) return;
      _placeChip(chip, slot);
    });

    zone.addEventListener('click', () => {
      if (!selected) return;
      _placeChip(selected, slot);
      selected = null;
    });
  });

  container.appendChild(sources);
  container.appendChild(targetsEl);
  _appendValidation(container, atv_id, expectedMap, targetMap, onConcluida, onAcerto, onErro);
}

/* ---- Shared helpers ---- */

function _placeChip(chip, slot) {
  chip.classList.add('placed');
  chip.classList.remove('sel-source');
  chip.draggable = false;
  slot.appendChild(chip);
}

function _appendValidation(container, atv_id, expectedMap, targetMap, onConcluida, onAcerto, onErro) {
  const feedback = document.createElement('div');
  feedback.className = 'feedback-area';
  feedback.setAttribute('aria-live', 'polite');

  const btnConfirmar = document.createElement('button');
  btnConfirmar.className = 'btn btn-primary';
  btnConfirmar.textContent = 'Pronto!';
  btnConfirmar.type = 'button';

  btnConfirmar.addEventListener('click', () => {
    let total = 0, corretos = 0;

    expectedMap.forEach((expectedCat, chipId) => {
      total++;
      /* Procura o chip dentro dos targets */
      for (const [catName, slot] of targetMap) {
        if (slot.querySelector(`[data-id="${chipId}"]`)) {
          if (catName === expectedCat) corretos++;
          break;
        }
      }
      /* Chips distratores que ficam nas sources sem categoria real são OK */
      if (expectedCat === 'distrator') {
        /* Verifica se o chip foi parar em algum slot — se não foi, está na fonte (correto) */
        let emSlot = false;
        for (const [, slot] of targetMap) {
          if (slot.querySelector(`[data-id="${chipId}"]`)) { emSlot = true; break; }
        }
        if (!emSlot) corretos++;
      }
    });

    feedback.innerHTML = '';
    if (corretos === total) {
      feedback.innerHTML = `<div class="feedback feedback-ok" role="alert">Isso aí! Tudo no lugar certo!</div>`;
      setProgress(atv_id, 'concluida');
      btnConfirmar.disabled = true;
      if (typeof onAcerto    === 'function') onAcerto();
      if (typeof onConcluida === 'function') onConcluida();
    } else {
      feedback.innerHTML = `<div class="feedback feedback-err" role="alert">${corretos} de ${total} certos. Quase! Tenta de novo.</div>`;
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

function _shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export { render };
