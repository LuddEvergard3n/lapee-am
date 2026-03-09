/**
 * activities/desenhar.js
 * Motor de atividade do tipo "desenhar".
 *
 * Canvas estilo Paint com:
 *   - 24 cores básicas em paleta fixa
 *   - 6 tipos de pincel: lápis, pincel redondo, pincel largo, aquarela, borracha, spray
 *   - Controle de espessura (3 tamanhos por pincel)
 *   - Desfazer (Ctrl+Z, até 30 passos)
 *   - Limpar tela
 *   - Salvar como PNG (download)
 *   - Marcar como concluída
 *
 * Interface do motor: render(container, atividade, opts)
 *   opts.onConcluida  — chamado ao marcar como concluída
 *   opts.onAcerto     — chamado ao marcar como concluída (mesmo que onConcluida, para mascote)
 */

import { setProgress } from '../store.js';

/* --------------------------------------------------------------------------
   PALETA — 24 cores básicas, organizadas por família
   -------------------------------------------------------------------------- */
const PALETTE = [
  /* Pretos e brancos */
  '#000000', '#ffffff', '#808080', '#c0c0c0',
  /* Vermelhos e rosas */
  '#ff0000', '#8b0000', '#ff69b4', '#ff1493',
  /* Laranjas e amarelos */
  '#ff8c00', '#ffa500', '#ffff00', '#ffd700',
  /* Verdes */
  '#008000', '#00ff00', '#006400', '#32cd32',
  /* Azuis */
  '#0000ff', '#00bfff', '#000080', '#4169e1',
  /* Roxos e marrons */
  '#800080', '#ee82ee', '#8b4513', '#d2691e',
];

/* --------------------------------------------------------------------------
   PINCÉIS — 6 tipos com render próprio
   -------------------------------------------------------------------------- */
const BRUSHES = [
  {
    id: 'lapis',
    label: 'Lápis',
    icon: '✏️',
    sizes: [2, 4, 7],
    cursor: 'crosshair',
    draw(ctx, x, y, px, py, color, size) {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(x, y);
      ctx.stroke();
    },
  },
  {
    id: 'pincel',
    label: 'Pincel',
    icon: '🖌️',
    sizes: [6, 12, 22],
    cursor: 'crosshair',
    draw(ctx, x, y, px, py, color, size) {
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    },
  },
  {
    id: 'largo',
    label: 'Pincel Largo',
    icon: '🖍️',
    sizes: [12, 24, 40],
    cursor: 'crosshair',
    draw(ctx, x, y, px, py, color, size) {
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'bevel';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    },
  },
  {
    id: 'aquarela',
    label: 'Aquarela',
    icon: '💧',
    sizes: [16, 28, 48],
    cursor: 'crosshair',
    draw(ctx, x, y, px, py, color, size) {
      /* Pontos individuais com alpha baixo para efeito de aguada */
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = color;
      const r = size / 2;
      for (let i = 0; i < 4; i++) {
        const ox = (Math.random() - 0.5) * r;
        const oy = (Math.random() - 0.5) * r;
        ctx.beginPath();
        ctx.arc(x + ox, y + oy, r * (0.6 + Math.random() * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  },
  {
    id: 'spray',
    label: 'Spray',
    icon: '🔫',
    sizes: [14, 26, 44],
    cursor: 'crosshair',
    draw(ctx, x, y, _px, _py, color, size) {
      const density = 24;
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = color;
      for (let i = 0; i < density; i++) {
        const angle  = Math.random() * Math.PI * 2;
        const radius = Math.random() * size;
        const sx = x + radius * Math.cos(angle);
        const sy = y + radius * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  },
  {
    id: 'borracha',
    label: 'Borracha',
    icon: '⬜',
    sizes: [10, 20, 36],
    cursor: 'cell',
    draw(ctx, x, y, px, py, _color, size) {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(x, y);
      ctx.stroke();
    },
  },
];

/* --------------------------------------------------------------------------
   RENDER PRINCIPAL
   -------------------------------------------------------------------------- */

/**
 * @param {HTMLElement} container
 * @param {object} atividade
 * @param {object} opts
 */
function render(container, atividade, opts = {}) {
  const { conteudo_base, id: atv_id, criterios_sucesso } = atividade;
  const { onConcluida, onAcerto } = opts;
  container.innerHTML = '';

  /* Estado do motor */
  const state = {
    brushIdx:  0,
    sizeIdx:   1,           /* tamanho médio como padrão */
    color:     '#000000',
    drawing:   false,
    prevX:     0,
    prevY:     0,
    history:   [],          /* snapshots para undo */
    maxHistory: 30,
  };

  /* ---- Wrapper do paint ---- */
  const wrap = document.createElement('div');
  wrap.className = 'paint-wrap';

  /* ---- Barra superior: pincéis ---- */
  const toolBar = document.createElement('div');
  toolBar.className = 'paint-toolbar';
  toolBar.setAttribute('role', 'toolbar');
  toolBar.setAttribute('aria-label', 'Ferramentas de desenho');

  const brushBtns = BRUSHES.map((b, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'paint-tool' + (i === 0 ? ' active' : '');
    btn.title = b.label;
    btn.setAttribute('aria-label', b.label);
    btn.setAttribute('aria-pressed', String(i === 0));
    btn.innerHTML = `<span class="paint-tool-icon">${b.icon}</span>
                     <span class="paint-tool-label">${b.label}</span>`;
    btn.addEventListener('click', () => {
      state.brushIdx = i;
      brushBtns.forEach((b2, j) => {
        b2.classList.toggle('active', j === i);
        b2.setAttribute('aria-pressed', String(j === i));
      });
      canvas.style.cursor = BRUSHES[i].cursor;
      _updateSizeButtons();
    });
    return btn;
  });
  brushBtns.forEach(b => toolBar.appendChild(b));

  /* Separador */
  const sep1 = document.createElement('div');
  sep1.className = 'paint-sep';
  toolBar.appendChild(sep1);

  /* Botões de tamanho */
  const SIZE_LABELS = ['P', 'M', 'G'];
  const sizeBtns = SIZE_LABELS.map((lbl, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'paint-size' + (i === 1 ? ' active' : '');
    btn.setAttribute('aria-label', `Tamanho ${['pequeno','médio','grande'][i]}`);
    btn.setAttribute('aria-pressed', String(i === 1));
    const dot = document.createElement('span');
    dot.className = 'paint-size-dot';
    dot.style.width  = `${6 + i * 5}px`;
    dot.style.height = `${6 + i * 5}px`;
    btn.appendChild(dot);
    btn.addEventListener('click', () => {
      state.sizeIdx = i;
      sizeBtns.forEach((b2, j) => {
        b2.classList.toggle('active', j === i);
        b2.setAttribute('aria-pressed', String(j === i));
      });
    });
    return btn;
  });
  sizeBtns.forEach(b => toolBar.appendChild(b));

  /* Separador */
  const sep2 = document.createElement('div');
  sep2.className = 'paint-sep';
  toolBar.appendChild(sep2);

  /* Ações: desfazer, limpar, salvar */
  const btnUndo = document.createElement('button');
  btnUndo.type = 'button';
  btnUndo.className = 'paint-action';
  btnUndo.title = 'Desfazer (Ctrl+Z)';
  btnUndo.setAttribute('aria-label', 'Desfazer');
  btnUndo.innerHTML = '↩ Desfazer';
  btnUndo.disabled = true;
  btnUndo.addEventListener('click', _undo);

  const btnClear = document.createElement('button');
  btnClear.type = 'button';
  btnClear.className = 'paint-action paint-action-danger';
  btnClear.title = 'Limpar tela';
  btnClear.setAttribute('aria-label', 'Limpar tela');
  btnClear.innerHTML = '🗑 Limpar';
  btnClear.addEventListener('click', () => {
    _saveSnapshot();
    _clearCanvas();
  });

  const btnSave = document.createElement('button');
  btnSave.type = 'button';
  btnSave.className = 'paint-action paint-action-save';
  btnSave.title = 'Baixar como PNG';
  btnSave.setAttribute('aria-label', 'Baixar desenho como PNG');
  btnSave.innerHTML = '⬇ Salvar PNG';
  btnSave.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `desenho-${atv_id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  toolBar.appendChild(btnUndo);
  toolBar.appendChild(btnClear);
  toolBar.appendChild(btnSave);
  wrap.appendChild(toolBar);

  /* ---- Área central: paleta + canvas ---- */
  const canvasRow = document.createElement('div');
  canvasRow.className = 'paint-canvas-row';

  /* Paleta de cores (coluna lateral) */
  const paletteEl = document.createElement('div');
  paletteEl.className = 'paint-palette';
  paletteEl.setAttribute('role', 'group');
  paletteEl.setAttribute('aria-label', 'Paleta de cores');

  PALETTE.forEach(hex => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'paint-swatch';
    swatch.style.backgroundColor = hex;
    swatch.title = hex;
    swatch.setAttribute('aria-label', `Cor ${hex}`);
    swatch.setAttribute('aria-pressed', String(hex === state.color));
    if (hex === '#000000') swatch.classList.add('active');
    swatch.addEventListener('click', () => {
      state.color = hex;
      /* Borracha → volta para lápis ao trocar cor */
      if (BRUSHES[state.brushIdx].id === 'borracha') {
        state.brushIdx = 0;
        brushBtns.forEach((b, j) => {
          b.classList.toggle('active', j === 0);
          b.setAttribute('aria-pressed', String(j === 0));
        });
        canvas.style.cursor = BRUSHES[0].cursor;
        _updateSizeButtons();
      }
      paletteEl.querySelectorAll('.paint-swatch').forEach(sw => {
        sw.classList.toggle('active', sw.style.backgroundColor === _hexToRgb(hex));
        sw.setAttribute('aria-pressed', String(sw.style.backgroundColor === _hexToRgb(hex)));
      });
      colorPreview.style.backgroundColor = hex;
    });
    paletteEl.appendChild(swatch);
  });

  /* Preview da cor atual */
  const colorPreview = document.createElement('div');
  colorPreview.className = 'paint-color-preview';
  colorPreview.style.backgroundColor = state.color;
  colorPreview.title = 'Cor atual';
  paletteEl.appendChild(colorPreview);

  /* ---- Canvas ---- */
  const canvas = document.createElement('canvas');
  canvas.className = 'paint-canvas';
  canvas.setAttribute('aria-label', 'Área de desenho');
  canvas.style.cursor = 'crosshair';

  /* Dimensões responsivas: usa largura do pai */
  const CANVAS_H = 400;
  /* Largura definida após inserção no DOM — ver _initCanvas() */

  const ctx = canvas.getContext('2d');

  canvasRow.appendChild(paletteEl);
  canvasRow.appendChild(canvas);
  wrap.appendChild(canvasRow);

  /* ---- Prompt do tema ---- */
  if (conteudo_base.prompt_desenho) {
    const prompt = document.createElement('p');
    prompt.className = 'paint-prompt';
    prompt.textContent = conteudo_base.prompt_desenho;
    wrap.appendChild(prompt);
  }

  /* ---- Critérios ---- */
  if (criterios_sucesso?.length) {
    const details = document.createElement('details');
    details.className = 'criterio-wrap';
    const sum = document.createElement('summary');
    sum.textContent = 'Critérios de avaliação';
    details.appendChild(sum);
    const ul = document.createElement('ul');
    criterios_sucesso.forEach(c => {
      const li = document.createElement('li');
      li.textContent = c;
      ul.appendChild(li);
    });
    details.appendChild(ul);
    wrap.appendChild(details);
  }

  /* ---- Botão de conclusão ---- */
  const feedback = document.createElement('div');
  feedback.className = 'feedback-area';
  feedback.setAttribute('aria-live', 'polite');

  const btnConcluir = document.createElement('button');
  btnConcluir.type = 'button';
  btnConcluir.className = 'btn btn-primary';
  btnConcluir.textContent = 'Terminei meu desenho!';

  btnConcluir.addEventListener('click', () => {
    feedback.innerHTML = `<div class="feedback feedback-ok" role="alert">Que desenho incrível! Muito bem!</div>`;
    setProgress(atv_id, 'concluida');
    btnConcluir.disabled = true;
    if (typeof onAcerto    === 'function') onAcerto();
    if (typeof onConcluida === 'function') onConcluida();
  });

  const actions = document.createElement('div');
  actions.className = 'activity-actions';
  actions.appendChild(btnConcluir);
  actions.appendChild(feedback);
  wrap.appendChild(actions);

  container.appendChild(wrap);

  /* ---- Inicializar canvas após inserção no DOM ---- */
  /* O container pode ainda não ter largura até ser inserido.
     Usamos requestAnimationFrame para garantir layout. */
  requestAnimationFrame(() => _initCanvas());

  /* ---- Atalho teclado: Ctrl+Z ---- */
  function _onKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      _undo();
    }
  }
  window.addEventListener('keydown', _onKeyDown);
  /* Remove o listener ao navegar */
  window.addEventListener('hashchange', () => window.removeEventListener('keydown', _onKeyDown), { once: true });

  /* ================================================================
     FUNÇÕES INTERNAS
     ================================================================ */

  function _initCanvas() {
    const W = canvas.parentElement?.clientWidth ?? 600;
    canvas.width  = Math.max(W - paletteEl.offsetWidth - 16, 300);
    canvas.height = CANVAS_H;
    _clearCanvas(/* silent */ true);
  }

  function _clearCanvas(silent = false) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!silent) btnUndo.disabled = state.history.length === 0;
  }

  function _saveSnapshot() {
    if (state.history.length >= state.maxHistory) state.history.shift();
    state.history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    btnUndo.disabled = false;
  }

  function _undo() {
    if (state.history.length === 0) return;
    const snap = state.history.pop();
    ctx.putImageData(snap, 0, 0);
    btnUndo.disabled = state.history.length === 0;
  }

  function _updateSizeButtons() {
    /* Atualiza o visual dos dots com os tamanhos do pincel atual */
    const sizes = BRUSHES[state.brushIdx].sizes;
    sizeBtns.forEach((btn, i) => {
      const dot = btn.querySelector('.paint-size-dot');
      if (dot) {
        dot.style.width  = `${sizes[i] * 0.7 + 4}px`;
        dot.style.height = `${sizes[i] * 0.7 + 4}px`;
      }
    });
  }

  function _getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * (canvas.width  / rect.width),
      y: (src.clientY - rect.top)  * (canvas.height / rect.height),
    };
  }

  function _startDraw(e) {
    e.preventDefault();
    _saveSnapshot();
    state.drawing = true;
    const { x, y } = _getPos(e);
    state.prevX = x;
    state.prevY = y;
    /* Ponto único ao clicar sem mover */
    const brush = BRUSHES[state.brushIdx];
    const size  = brush.sizes[state.sizeIdx];
    brush.draw(ctx, x, y, x, y, state.color, size);
  }

  function _moveDraw(e) {
    if (!state.drawing) return;
    e.preventDefault();
    const { x, y } = _getPos(e);
    const brush = BRUSHES[state.brushIdx];
    const size  = brush.sizes[state.sizeIdx];
    brush.draw(ctx, x, y, state.prevX, state.prevY, state.color, size);
    state.prevX = x;
    state.prevY = y;
  }

  function _endDraw(e) {
    if (!state.drawing) return;
    e.preventDefault();
    state.drawing = false;
  }

  /* Mouse */
  canvas.addEventListener('mousedown',  _startDraw);
  canvas.addEventListener('mousemove',  _moveDraw);
  canvas.addEventListener('mouseup',    _endDraw);
  canvas.addEventListener('mouseleave', _endDraw);

  /* Touch */
  canvas.addEventListener('touchstart',  _startDraw, { passive: false });
  canvas.addEventListener('touchmove',   _moveDraw,  { passive: false });
  canvas.addEventListener('touchend',    _endDraw,   { passive: false });
  canvas.addEventListener('touchcancel', _endDraw,   { passive: false });
}

/**
 * Converte hex (#rrggbb) para string rgb(...) retornada pelo browser.
 * Usado para comparar com style.backgroundColor.
 * @param {string} hex
 * @returns {string}
 */
function _hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

export { render };
