/**
 * activities/cruzadas.js
 * Motor de palavras cruzadas interativo para o LAPEE AM.
 *
 * conteudo_base esperado:
 * {
 *   entradas: [
 *     { palavra: "GATO", dica: "Animal que faz miau" },
 *     ...
 *   ]
 * }
 */

import { play } from '../sound.js';

let _cwLoaded = null;

function _carregarCrossword() {
  if (_cwLoaded) return _cwLoaded;
  _cwLoaded = new Promise((res, rej) => {
    if (window.Crossword) { res(window.Crossword); return; }
    const s = document.createElement('script');
    s.src = './assets/js/crossword.js';
    s.onload  = () => res(window.Crossword);
    s.onerror = () => rej(new Error('crossword.js não encontrado'));
    document.head.appendChild(s);
  });
  return _cwLoaded;
}

/**
 * @param {HTMLElement} container
 * @param {object}      atividade
 * @param {{ onAcerto, onErro, onConcluida }} opts
 */
export async function renderCruzadas(container, atividade, opts = {}) {
  const { onAcerto = () => {}, onErro = () => {}, onConcluida = () => {} } = opts;
  const cb = atividade.conteudo_base;
  const entradas = cb.entradas ?? [];

  container.innerHTML = '<p class="atv-carregando">Gerando palavras cruzadas…</p>';

  let cw;
  try {
    cw = await _carregarCrossword();
  } catch {
    container.innerHTML = '<p class="atv-erro">Erro ao carregar o gerador. Recarregue a página.</p>';
    return;
  }

  const layout = cw.gerar(entradas, { tentativas: 40 });
  if (!layout || layout.palavrasColocadas.length === 0) {
    container.innerHTML = '<p class="atv-erro">Não foi possível gerar as palavras cruzadas para essa lista.</p>';
    return;
  }

  const { grid, rows, cols, palavrasColocadas } = layout;

  // Estado: célula → letra digitada
  const respostasUsuario = new Map();
  const palavrasCorretas = new Set();
  const totalPalavras    = palavrasColocadas.length;

  // ---- Render ----
  const acrossWords = palavrasColocadas.filter(p => p.dir === 'across').sort((a,b) => a.num - b.num);
  const downWords   = palavrasColocadas.filter(p => p.dir === 'down').sort((a,b) => a.num - b.num);

  container.innerHTML = `
    <div class="cruzadas-wrapper">
      <div class="cruzadas-grid-area">
        <table class="cruzadas-grid" id="cruzadas-grid" aria-label="Grade das palavras cruzadas"></table>
      </div>
      <div class="cruzadas-pistas-area">
        <div class="cruzadas-pistas-bloco">
          <h3 class="cruzadas-pistas-titulo">Horizontal →</h3>
          <ol class="cruzadas-pistas-lista">
            ${acrossWords.map(p => `<li value="${p.num}" class="cruzadas-pista" data-num="${p.num}" data-dir="across">${p.dica}</li>`).join('')}
          </ol>
        </div>
        <div class="cruzadas-pistas-bloco">
          <h3 class="cruzadas-pistas-titulo">Vertical ↓</h3>
          <ol class="cruzadas-pistas-lista">
            ${downWords.map(p => `<li value="${p.num}" class="cruzadas-pista" data-num="${p.num}" data-dir="down">${p.dica}</li>`).join('')}
          </ol>
        </div>
      </div>
    </div>
    <div class="cruzadas-acoes">
      <button class="btn btn-secondary" id="cruzadas-verificar">Verificar</button>
      <button class="btn btn-ghost" id="cruzadas-apagar">Apagar tudo</button>
    </div>
    <p class="cruzadas-feedback" id="cruzadas-feedback"></p>
  `;

  // Construir tabela
  const tabela = container.querySelector('#cruzadas-grid');
  for (let l = 0; l < rows; l++) {
    const tr = document.createElement('tr');
    for (let c = 0; c < cols; c++) {
      const td = document.createElement('td');
      const cel = grid[l][c];
      if (cel.letra === null) {
        td.className = 'cruzadas-bloqueada';
      } else {
        td.className = 'cruzadas-cel';
        td.dataset.l = l;
        td.dataset.c = c;

        // Número
        if (cel.num) {
          const span = document.createElement('span');
          span.className = 'cruzadas-num';
          span.textContent = cel.num;
          td.appendChild(span);
        }

        // Input
        const input = document.createElement('input');
        input.type        = 'text';
        input.maxLength   = 1;
        input.className   = 'cruzadas-input';
        input.dataset.l   = l;
        input.dataset.c   = c;
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('aria-label', `Linha ${l+1}, coluna ${c+1}`);

        input.addEventListener('input', (e) => {
          const val = e.target.value.toUpperCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(-1);
          e.target.value = val;
          respostasUsuario.set(`${l},${c}`, val);
          // Avançar foco para próximo input na linha/coluna — heurística simples
          _avancarFoco(tabela, l, c);
        });

        input.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !input.value) _voltarFoco(tabela, l, c);
        });

        td.appendChild(input);
      }
      tr.appendChild(td);
    }
    tabela.appendChild(tr);
  }

  // Destacar palavra ao clicar na pista
  container.querySelectorAll('.cruzadas-pista').forEach(li => {
    li.addEventListener('click', () => {
      const num = parseInt(li.dataset.num);
      const dir = li.dataset.dir;
      const p   = palavrasColocadas.find(x => x.num === num && x.dir === dir);
      if (!p) return;
      // Remover destaque anterior
      tabela.querySelectorAll('.cruzadas-cel.destacada').forEach(el => el.classList.remove('destacada'));
      const dL = dir === 'down' ? 1 : 0;
      const dC = dir === 'across' ? 1 : 0;
      for (let i = 0; i < p.palavra.length; i++) {
        const cel = tabela.querySelector(`td[data-l="${p.linha + dL * i}"][data-c="${p.col + dC * i}"]`);
        cel?.classList.add('destacada');
      }
      // Focar o primeiro input da palavra
      const primeiroInput = tabela.querySelector(`td[data-l="${p.linha}"][data-c="${p.col}"] input`);
      primeiroInput?.focus();
    });
  });

  // Verificar
  container.querySelector('#cruzadas-verificar')?.addEventListener('click', () => {
    let erros = 0;
    palavrasColocadas.forEach(p => {
      const dL = p.dir === 'down' ? 1 : 0;
      const dC = p.dir === 'across' ? 1 : 0;
      let correta = true;
      for (let i = 0; i < p.palavra.length; i++) {
        const key = `${p.linha + dL * i},${p.col + dC * i}`;
        const letra = respostasUsuario.get(key) ?? '';
        const esperada = p.palavra[i];
        const input = tabela.querySelector(`td[data-l="${p.linha + dL * i}"][data-c="${p.col + dC * i}"] input`);
        if (letra !== esperada) {
          correta = false;
          input?.classList.add('cruzadas-errada');
          input?.classList.remove('cruzadas-certa');
        } else {
          input?.classList.remove('cruzadas-errada');
          input?.classList.add('cruzadas-certa');
        }
      }
      if (correta) {
        palavrasCorretas.add(p.num + p.dir);
      } else {
        erros++;
      }
    });

    const fb = container.querySelector('#cruzadas-feedback');
    if (erros === 0) {
      fb.textContent = '🎉 Parabéns! Todas as palavras estão corretas!';
      fb.className = 'cruzadas-feedback ok';
      play('conquista');
      onConcluida();
    } else {
      fb.textContent = `Tem ${erros} palavra${erros > 1 ? 's' : ''} com erro. Continue tentando!`;
      fb.className = 'cruzadas-feedback erro';
      play('erro');
      onErro();
    }
  });

  // Apagar
  container.querySelector('#cruzadas-apagar')?.addEventListener('click', () => {
    respostasUsuario.clear();
    palavrasCorretas.clear();
    tabela.querySelectorAll('.cruzadas-input').forEach(i => {
      i.value = '';
      i.classList.remove('cruzadas-errada', 'cruzadas-certa');
    });
    container.querySelector('#cruzadas-feedback').textContent = '';
  });

  function _avancarFoco(table, l, c) {
    // Tentar próxima coluna, depois próxima linha
    const next = table.querySelector(`td[data-l="${l}"][data-c="${c+1}"] input`)
               ?? table.querySelector(`td[data-l="${l+1}"][data-c="${c}"] input`);
    next?.focus();
  }

  function _voltarFoco(table, l, c) {
    const prev = table.querySelector(`td[data-l="${l}"][data-c="${c-1}"] input`)
               ?? table.querySelector(`td[data-l="${l-1}"][data-c="${c}"] input`);
    prev?.focus();
  }
}
