/**
 * activities/cacapalavras.js
 * Motor de caça-palavras interativo para o LAPEE AM.
 *
 * conteudo_base esperado:
 * {
 *   palavras: ["GATO", "BOLA", ...],
 *   dicas:    ["Animal que faz miau", "Objeto redondo", ...]  // índice paralelo
 * }
 *
 * Geração do puzzle via assets/js/wordfind.js (carregado lazily).
 */

import { notificar } from '../notificacoes.js';
import { play }      from '../sound.js';

let _wfLoaded = null;

function _carregarWordfind() {
  if (_wfLoaded) return _wfLoaded;
  _wfLoaded = new Promise((res, rej) => {
    if (window.WordFind) { res(window.WordFind); return; }
    const s = document.createElement('script');
    s.src = './assets/js/wordfind.js';
    s.onload  = () => res(window.WordFind);
    s.onerror = () => rej(new Error('wordfind.js não encontrado'));
    document.head.appendChild(s);
  });
  return _wfLoaded;
}

/**
 * @param {HTMLElement} container
 * @param {object}      atividade
 * @param {{ onAcerto, onErro, onConcluida }} opts
 */
export async function renderCacaPalavras(container, atividade, opts = {}) {
  const { onAcerto = () => {}, onErro = () => {}, onConcluida = () => {} } = opts;
  const cb = atividade.conteudo_base;
  const palavrasOrig = cb.palavras ?? [];
  const dicas        = cb.dicas   ?? [];

  container.innerHTML = '<p class="atv-carregando">Gerando caça-palavras…</p>';

  let wf;
  try {
    wf = await _carregarWordfind();
  } catch {
    container.innerHTML = '<p class="atv-erro">Erro ao carregar o gerador. Recarregue a página.</p>';
    return;
  }

  const puzzle = wf.gerar(palavrasOrig, { diagonais: false });

  // Estado
  const encontradas  = new Set();
  const totalPalavras = puzzle.palavras.length;
  let selecionando   = null; // { linha, col }
  let celSelecionadas = [];

  // ---- Render ----
  container.innerHTML = `
    <div class="caca-wrapper">
      <div class="caca-grid-area">
        <table class="caca-grid" id="caca-grid" aria-label="Grade do caça-palavras"></table>
        <p class="caca-instrucao">Clique na primeira letra, depois na última letra da palavra.</p>
      </div>
      <div class="caca-lista-area">
        <h3 class="caca-lista-titulo">Encontre as palavras</h3>
        <ul class="caca-lista" id="caca-lista">
          ${puzzle.palavras.map((p, i) => `
            <li class="caca-item" data-palavra="${p}" id="caca-item-${p}">
              <span class="caca-palavra">${palavrasOrig[i] ?? p}</span>
              ${dicas[i] ? `<span class="caca-dica">${dicas[i]}</span>` : ''}
            </li>
          `).join('')}
        </ul>
        <p class="caca-contagem" id="caca-contagem">0 / ${totalPalavras} encontradas</p>
      </div>
    </div>
  `;

  // Construir tabela
  const tabela = container.querySelector('#caca-grid');
  puzzle.grid.forEach((row, l) => {
    const tr = document.createElement('tr');
    row.forEach((letra, c) => {
      const td = document.createElement('td');
      td.className = 'caca-cel';
      td.textContent = letra.toUpperCase();
      td.dataset.l = l;
      td.dataset.c = c;
      td.addEventListener('click', () => _clicarCelula(td, l, c));
      tr.appendChild(td);
    });
    tabela.appendChild(tr);
  });

  function _clicarCelula(td, l, c) {
    if (td.classList.contains('encontrada')) return;

    if (!selecionando) {
      // Primeira letra
      selecionando = { l, c };
      celSelecionadas = [td];
      td.classList.add('selecionada');
      return;
    }

    // Segunda letra — tentar encontrar palavra
    const l1 = selecionando.l, c1 = selecionando.c;
    const l2 = l, c2 = c;

    // Limpar seleção visual anterior
    celSelecionadas.forEach(el => el.classList.remove('selecionada'));
    selecionando = null;
    celSelecionadas = [];

    // Determinar direção e extrair letras
    const dL = Math.sign(l2 - l1), dC = Math.sign(c2 - c1);
    if (dL === 0 && dC === 0) return; // mesma célula

    // Só horizontal ou vertical (sem diagonal nesta versão)
    if (dL !== 0 && dC !== 0) {
      notificar('Tente apenas horizontal ou vertical.', 'aviso', 2000);
      return;
    }

    // Coletar letras do trajeto
    let letras = '';
    const cels = [];
    let cl = l1, cc = c1;
    while (true) {
      const el = tabela.querySelector(`td[data-l="${cl}"][data-c="${cc}"]`);
      if (!el) break;
      letras += el.textContent;
      cels.push(el);
      if (cl === l2 && cc === c2) break;
      cl += dL; cc += dC;
      if (Math.abs(cl - l1) > 20 || Math.abs(cc - c1) > 20) break; // safety
    }

    // Verificar se a palavra extraída está na lista
    const normalizar = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    const match = puzzle.palavras.find(p => {
      const pn = normalizar(p);
      return pn === letras || pn === [...letras].reverse().join('');
    });

    if (match && !encontradas.has(match)) {
      encontradas.add(match);
      cels.forEach(el => { el.classList.add('encontrada'); el.classList.remove('selecionada'); });
      container.querySelector(`#caca-item-${match}`)?.classList.add('achada');
      container.querySelector('#caca-contagem').textContent =
        `${encontradas.size} / ${totalPalavras} encontradas`;
      play('acerto');
      onAcerto();

      if (encontradas.size === totalPalavras) {
        setTimeout(() => {
          container.querySelector('.caca-instrucao').textContent = '🎉 Você encontrou todas as palavras!';
          onConcluida();
          play('conquista');
        }, 300);
      }
    } else if (letras.length >= 2) {
      cels.forEach(el => el.classList.add('erro-flash'));
      setTimeout(() => cels.forEach(el => el.classList.remove('erro-flash')), 600);
      onErro();
    }
  }
}
