/**
 * activities/arrastar.js
 * Motor de atividade do tipo "arrastar": associar itens a colunas/categorias.
 * Suporta pares (chips → slot nomeado) e categorias (múltiplos chips por grupo).
 * Acessível: alternativa de clique sequencial para teclado/mobile.
 *
 * Comportamento de erro: ao clicar "Pronto!" com resposta errada,
 * todos os chips são devolvidos para a zona de fontes e podem ser
 * recolocados. O usuário nunca fica preso após um erro.
 *
 * Deselecionar: clicar no chip já selecionado cancela a seleção.
 */

import { setProgress } from '../store.js';

/**
 * @param {HTMLElement} container
 * @param {object} atividade
 * @param {object} opts
 */
function render(container, atividade, opts = {}) {
  const { conteudo_base } = atividade;

  container.innerHTML = '';

  if (conteudo_base.pares && !conteudo_base.categorias) {
    _renderPares(container, atividade, opts);
  } else if (conteudo_base.categorias) {
    _renderCategorias(container, atividade, opts);
  } else if (conteudo_base.blocos) {
    _renderBlocos(container, atividade, opts);
  }
}

/* ---- Pares: cada chip vai para exatamente um slot nomeado ---- */

function _renderPares(container, atividade, opts = {}) {
  const { onConcluida, onAcerto, onErro } = opts;
  const { conteudo_base, id: atv_id } = atividade;
  const { pares } = conteudo_base;

  const instrucao = document.createElement('p');
  instrucao.className = 'activity-instruction';
  instrucao.textContent = 'Arrasta cada palavra para o lugar certo. Ou clica na palavra e depois no lugar.';
  container.appendChild(instrucao);

  /* selRef: referência compartilhada com _appendValidation para reset no erro */
  const selRef = { value: null };

  const sources = document.createElement('div');
  sources.className = 'drag-sources';

  const targets = document.createElement('div');
  targets.className = 'drag-targets';

  const targetMap  = new Map(); /* nome → slot element */
  const expectedMap = new Map(); /* chip-id → nome esperado */

  pares.forEach((par, i) => {
    const chip = document.createElement('div');
    chip.className = 'drag-chip';
    chip.draggable = true;
    chip.dataset.id = `chip-${i}`;
    chip.textContent = par.elemento;
    chip.setAttribute('tabindex', '0');
    chip.setAttribute('role', 'button');
    chip.setAttribute('aria-label', `Arrasta: ${par.elemento}`);
    expectedMap.set(`chip-${i}`, par.nome);
    sources.appendChild(chip);

    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', `chip-${i}`);
      chip.classList.add('dragging');
    });
    chip.addEventListener('dragend', () => chip.classList.remove('dragging'));

    chip.addEventListener('click', () => {
      if (chip.classList.contains('placed')) return;
      /* Toggle: segundo clique no mesmo chip deseleciona */
      if (selRef.value === chip) {
        chip.classList.remove('sel-source');
        selRef.value = null;
        return;
      }
      sources.querySelectorAll('.drag-chip').forEach(c => c.classList.remove('sel-source'));
      chip.classList.add('sel-source');
      selRef.value = chip;
    });
    chip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chip.click(); }
    });
  });

  /* Embaralha targets para não entregar a ordem */
  _shuffle([...pares]).forEach((par) => {
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

    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      if (slot.children.length > 0) return; /* slot de pares aceita 1 chip */
      const chipId = e.dataTransfer.getData('text/plain');
      const chip = sources.querySelector(`[data-id="${chipId}"]`)
                ?? container.querySelector(`[data-id="${chipId}"]`);
      if (!chip || chip.classList.contains('placed')) return;
      _placeChip(chip, slot);
    });

    zone.addEventListener('click', () => {
      if (!selRef.value || slot.children.length > 0) return;
      _placeChip(selRef.value, slot);
      selRef.value = null;
    });
  });

  container.appendChild(sources);
  container.appendChild(targets);
  _appendValidation(container, atv_id, expectedMap, targetMap, sources, selRef,
                    onConcluida, onAcerto, onErro);
}

/* ---- Categorias: múltiplos chips → categorias (slots aceitam vários) ---- */

function _renderCategorias(container, atividade, opts = {}) {
  const { onConcluida, onAcerto, onErro } = opts;
  const { conteudo_base, id: atv_id } = atividade;
  const { itens, categorias } = conteudo_base;

  const instrucao = document.createElement('p');
  instrucao.className = 'activity-instruction';
  instrucao.textContent = 'Arrasta cada coisa para o grupo certo. Ou clica nela e depois no grupo.';
  container.appendChild(instrucao);

  const selRef = { value: null };
  const expectedMap = new Map();
  const targetMap   = new Map();

  const sources = document.createElement('div');
  sources.className = 'drag-sources';

  /* IDs estáveis antes de embaralhar */
  const itensComId = itens.map((item, i) => ({
    ...item,
    id: item.id != null ? String(item.id) : `cat-item-${i}`,
  }));

  _shuffle(itensComId).forEach((item) => {
    const chip = document.createElement('div');
    chip.className = 'drag-chip';
    chip.draggable = true;
    chip.dataset.id = item.id;
    chip.textContent = item.label;
    chip.setAttribute('tabindex', '0');
    chip.setAttribute('role', 'button');
    chip.setAttribute('aria-label', item.label);
    expectedMap.set(item.id, item.categoria);
    sources.appendChild(chip);

    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', item.id);
      chip.classList.add('dragging');
    });
    chip.addEventListener('dragend', () => chip.classList.remove('dragging'));

    chip.addEventListener('click', () => {
      if (chip.classList.contains('placed')) return;
      if (selRef.value === chip) {
        chip.classList.remove('sel-source');
        selRef.value = null;
        return;
      }
      sources.querySelectorAll('.drag-chip').forEach(c => c.classList.remove('sel-source'));
      chip.classList.add('sel-source');
      selRef.value = chip;
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
      const chip = sources.querySelector(`[data-id="${chipId}"]`)
                ?? container.querySelector(`[data-id="${chipId}"]`);
      if (!chip || chip.classList.contains('placed')) return;
      _placeChip(chip, slot);
    });

    zone.addEventListener('click', () => {
      if (!selRef.value) return;
      _placeChip(selRef.value, slot);
      selRef.value = null;
    });
  });

  container.appendChild(sources);
  container.appendChild(targetsEl);
  _appendValidation(container, atv_id, expectedMap, targetMap, sources, selRef,
                    onConcluida, onAcerto, onErro);
}

/* ---- Blocos: numéricos com colunas e distratorores opcionais ---- */

function _renderBlocos(container, atividade, opts = {}) {
  const { onConcluida, onAcerto, onErro } = opts;
  const { conteudo_base, id: atv_id } = atividade;
  const { blocos, colunas } = conteudo_base;

  const instrucao = document.createElement('p');
  instrucao.className = 'activity-instruction';
  instrucao.textContent = 'Arrasta cada grupo para o lugar certo.';
  container.appendChild(instrucao);

  const selRef = { value: null };
  const expectedMap = new Map();
  const targetMap   = new Map();

  const sources = document.createElement('div');
  sources.className = 'drag-sources';

  _shuffle([...blocos]).forEach((bloco) => {
    const chip = document.createElement('div');
    chip.className = 'drag-chip';
    chip.draggable = true;
    chip.dataset.id = bloco.id;
    chip.textContent = bloco.label;
    chip.setAttribute('tabindex', '0');
    chip.setAttribute('role', 'button');
    chip.setAttribute('aria-label', bloco.label);
    expectedMap.set(bloco.id, bloco.posicao);
    sources.appendChild(chip);

    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', bloco.id);
      chip.classList.add('dragging');
    });
    chip.addEventListener('dragend', () => chip.classList.remove('dragging'));

    chip.addEventListener('click', () => {
      if (chip.classList.contains('placed')) return;
      if (selRef.value === chip) {
        chip.classList.remove('sel-source');
        selRef.value = null;
        return;
      }
      sources.querySelectorAll('.drag-chip').forEach(c => c.classList.remove('sel-source'));
      chip.classList.add('sel-source');
      selRef.value = chip;
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
      const chip = sources.querySelector(`[data-id="${chipId}"]`)
                ?? container.querySelector(`[data-id="${chipId}"]`);
      if (!chip || chip.classList.contains('placed')) return;
      _placeChip(chip, slot);
    });

    zone.addEventListener('click', () => {
      if (!selRef.value) return;
      _placeChip(selRef.value, slot);
      selRef.value = null;
    });
  });

  container.appendChild(sources);
  container.appendChild(targetsEl);
  _appendValidation(container, atv_id, expectedMap, targetMap, sources, selRef,
                    onConcluida, onAcerto, onErro);
}

/* ---- Helpers compartilhados ---- */

function _placeChip(chip, slot) {
  chip.classList.add('placed');
  chip.classList.remove('sel-source');
  chip.draggable = false;
  slot.appendChild(chip);
}

/**
 * Devolve todos os chips colocados de volta para a zona de fontes.
 * Restaura draggable e remove a classe 'placed'.
 * Chamado quando o aluno erra para permitir nova tentativa.
 */
function _returnAllChips(container, sources, selRef) {
  container.querySelectorAll('.drag-chip.placed').forEach(chip => {
    chip.classList.remove('placed', 'sel-source');
    chip.draggable = true;
    sources.appendChild(chip);
  });
  /* Limpa seleção pendente */
  sources.querySelectorAll('.drag-chip').forEach(c => c.classList.remove('sel-source'));
  selRef.value = null;
}

/**
 * Monta o botão "Pronto!" e a área de feedback.
 * Em caso de erro, devolve todos os chips para sources antes de exibir o feedback.
 */
function _appendValidation(container, atv_id, expectedMap, targetMap, sources, selRef,
                            onConcluida, onAcerto, onErro) {
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

      /* Verifica se o chip está no slot correto */
      for (const [catName, slot] of targetMap) {
        if (slot.querySelector(`[data-id="${chipId}"]`)) {
          if (catName === expectedCat) corretos++;
          break;
        }
      }

      /* Distratorres que ficam nas sources (sem colocar em nenhum slot) = correto */
      if (expectedCat === 'distrator') {
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
      /* Devolve chips para sources antes de exibir feedback — permite nova tentativa */
      _returnAllChips(container, sources, selRef);
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
