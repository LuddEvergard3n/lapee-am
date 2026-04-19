/**
 * crossword.js — LAPEE AM
 * Gerador de palavras cruzadas para o browser.
 * Algoritmo de backtracking com score de interseções.
 * Sem dependências externas.
 *
 * API:
 *   const layout = Crossword.gerar(entradas, { tentativas });
 *   // entradas: [{ palavra, dica }]
 *   // retorno: { grid, palavrasColocadas, rows, cols, offsetL, offsetC }
 *
 * grid[l][c] = { letra, num?, bloqueada }
 * palavrasColocadas: [{ palavra, dica, linha, col, dir, num }]
 */

const Crossword = (() => {
  'use strict';

  const normalize = w => w.toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  function _criarGridVazio(rows, cols) {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({ letra: null }))
    );
  }

  function _podeColocar(colocadas, palavra, linha, col, dir) {
    const dL = dir === 'down' ? 1 : 0;
    const dC = dir === 'across' ? 1 : 0;

    // Verificar células antes e depois da palavra (não pode encostar em outra)
    const lAntes = linha - dL, cAntes = col - dC;
    const lDepois = linha + dL * palavra.length, cDepois = col + dC * palavra.length;

    for (const p of colocadas) {
      // Célula antes da palavra coincide com outra colocada?
      for (let i = 0; i < p.palavra.length; i++) {
        const pl = p.linha + (p.dir === 'down' ? i : 0);
        const pc = p.col  + (p.dir === 'across' ? i : 0);
        if (pl === lAntes && pc === cAntes) return false;
        if (pl === lDepois && pc === cDepois) return false;
      }
    }

    let interSecoes = 0;
    for (let i = 0; i < palavra.length; i++) {
      const l = linha + dL * i;
      const c = col  + dC * i;

      // Verificar conflito com células existentes
      for (const p of colocadas) {
        const pdL = p.dir === 'down' ? 1 : 0;
        const pdC = p.dir === 'across' ? 1 : 0;
        for (let j = 0; j < p.palavra.length; j++) {
          const pl = p.linha + pdL * j;
          const pc = p.col  + pdC * j;
          if (pl === l && pc === c) {
            if (p.palavra[j] !== palavra[i]) return false; // letra diferente
            if (p.dir === dir) return false; // mesma direção na mesma célula
            interSecoes++;
          }
        }

        // Células adjacentes na mesma direção não podem se tocar lateralmente
        if (dir === 'across' && p.dir === 'across') {
          // Mesmo row = conflito se adjacentes
          if (p.linha === linha) {
            const pFim = p.col + p.palavra.length - 1;
            const nFim = col + palavra.length - 1;
            if (!(nFim < p.col - 1 || col > pFim + 1)) return false;
          }
        }
        if (dir === 'down' && p.dir === 'down') {
          if (p.col === col) {
            const pFim = p.linha + p.palavra.length - 1;
            const nFim = linha + palavra.length - 1;
            if (!(nFim < p.linha - 1 || linha > pFim + 1)) return false;
          }
        }
      }
    }
    return interSecoes; // 0 também é válido para a primeira palavra
  }

  function _score(interSecoes, palavra, colocadas) {
    return interSecoes * 10 + (colocadas.length === 0 ? 5 : 0);
  }

  /**
   * @param {{ palavra: string, dica: string }[]} entradas
   * @param {{ tentativas?: number }} opts
   */
  function gerar(entradas, opts = {}) {
    const tentativasMax = opts.tentativas ?? 30;

    const items = entradas
      .map(e => ({ ...e, norm: normalize(e.palavra) }))
      .filter(e => e.norm.length >= 2)
      .sort((a, b) => b.norm.length - a.norm.length);

    if (items.length === 0) return null;

    let melhorLayout = null;
    let melhorContagem = -1;

    for (let t = 0; t < tentativasMax; t++) {
      const colocadas = [];

      for (let idx = 0; idx < items.length; idx++) {
        const { palavra: palavraOrig, norm: palavra, dica } = items[idx];

        if (colocadas.length === 0) {
          colocadas.push({ palavra, palavraOrig, dica, linha: 0, col: 0, dir: 'across' });
          continue;
        }

        // Tentar encaixar em cada interseção possível com palavras já colocadas
        let melhorPos = null;
        let melhorScore = -1;

        for (const p of colocadas) {
          const novaDir = p.dir === 'across' ? 'down' : 'across';
          const dL = novaDir === 'down' ? 1 : 0;
          const dC = novaDir === 'across' ? 1 : 0;

          for (let pi = 0; pi < p.palavra.length; pi++) {
            const letraExist = p.palavra[pi];
            for (let ni = 0; ni < palavra.length; ni++) {
              if (palavra[ni] !== letraExist) continue;

              const pL = p.linha + (p.dir === 'down' ? pi : 0);
              const pC = p.col  + (p.dir === 'across' ? pi : 0);
              const novaL = pL - dL * ni;
              const novaC = pC - dC * ni;

              const inter = _podeColocar(colocadas, palavra, novaL, novaC, novaDir);
              if (inter === false) continue;

              const sc = inter * 10 + (Math.random() * 2); // leve aleatoriedade
              if (sc > melhorScore) {
                melhorScore = sc;
                melhorPos = { linha: novaL, col: novaC, dir: novaDir };
              }
            }
          }
        }

        if (melhorPos) {
          colocadas.push({ palavra, palavraOrig, dica, ...melhorPos });
        }
      }

      if (colocadas.length > melhorContagem) {
        melhorContagem = colocadas.length;
        melhorLayout = colocadas.map(p => ({ ...p }));
      }

      if (melhorContagem === items.length) break;
    }

    if (!melhorLayout || melhorLayout.length === 0) return null;

    // Calcular bounds
    let minL = Infinity, minC = Infinity, maxL = -Infinity, maxC = -Infinity;
    for (const p of melhorLayout) {
      const dL = p.dir === 'down' ? 1 : 0;
      const dC = p.dir === 'across' ? 1 : 0;
      minL = Math.min(minL, p.linha);
      minC = Math.min(minC, p.col);
      maxL = Math.max(maxL, p.linha + dL * (p.palavra.length - 1));
      maxC = Math.max(maxC, p.col  + dC * (p.palavra.length - 1));
    }

    const offsetL = -minL, offsetC = -minC;
    const rows = maxL - minL + 1, cols = maxC - minC + 1;
    const grid = _criarGridVazio(rows, cols);

    // Preencher grid e numerar palavras
    let num = 1;
    const numeradas = [];

    // Ordenar por posição para numeração consistente (top→down, left→right)
    const ordenadas = [...melhorLayout].sort((a, b) => {
      const la = a.linha + offsetL, lb = b.linha + offsetL;
      const ca = a.col  + offsetC, cb = b.col  + offsetC;
      return la !== lb ? la - lb : ca - cb;
    });

    // Atribuir números
    const numPorPos = new Map();
    for (const p of ordenadas) {
      const key = `${p.linha + offsetL},${p.col + offsetC}`;
      if (!numPorPos.has(key)) {
        numPorPos.set(key, num++);
      }
      p.num = numPorPos.get(key);
    }

    // Preencher letras no grid
    for (const p of ordenadas) {
      const dL = p.dir === 'down' ? 1 : 0;
      const dC = p.dir === 'across' ? 1 : 0;
      for (let i = 0; i < p.palavra.length; i++) {
        const l = p.linha + offsetL + dL * i;
        const c = p.col  + offsetC + dC * i;
        grid[l][c].letra = p.palavra[i];
        if (i === 0) grid[l][c].num = p.num;
      }
    }

    return {
      grid, rows, cols, offsetL, offsetC,
      palavrasColocadas: ordenadas,
      totalEntrada: items.length,
    };
  }

  return { gerar, normalize };
})();

/* Expõe no escopo global para acesso pelo loader dinâmico (script tag clássico).
   'const' no topo de um script não vira propriedade de window automaticamente. */
window.Crossword = Crossword;

if (typeof module !== 'undefined') module.exports = Crossword;
