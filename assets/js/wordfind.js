/**
 * wordfind.js — LAPEE AM
 * Gerador e resolvedor de caça-palavras (word search).
 * Algoritmo próprio, sem dependências externas.
 * Suporta: horizontal, vertical, diagonal (todas as 8 direções).
 * Letras de preenchimento: apenas letras comuns do português.
 *
 * API:
 *   const puzzle = WordFind.gerar(palavras, { tamanho, diagonais });
 *   // puzzle.grid     — array 2D de letras
 *   // puzzle.posicoes — Map(palavra → {linha, col, dir})
 *   // puzzle.palavras — palavras efetivamente colocadas
 */

const WordFind = (() => {
  'use strict';

  const LETRAS_PT = 'aabcdeeeefghiijlmnnooopqrrstuuuvz';

  // Direções: [dLinha, dCol]
  const DIRECOES = {
    horizontal:      [ 0,  1],
    horizontalBack:  [ 0, -1],
    vertical:        [ 1,  0],
    verticalUp:      [-1,  0],
    diagonal:        [ 1,  1],
    diagonalUp:      [-1,  1],
    diagonalBack:    [ 1, -1],
    diagonalUpBack:  [-1, -1],
  };

  function _embaralhar(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function _criarGrid(tam) {
    return Array.from({ length: tam }, () => Array(tam).fill(null));
  }

  function _podeColocar(grid, palavra, linha, col, dL, dC) {
    const tam = grid.length;
    for (let i = 0; i < palavra.length; i++) {
      const l = linha + dL * i;
      const c = col  + dC * i;
      if (l < 0 || l >= tam || c < 0 || c >= tam) return false;
      const atual = grid[l][c];
      if (atual !== null && atual !== palavra[i]) return false;
    }
    return true;
  }

  function _colocar(grid, palavra, linha, col, dL, dC) {
    for (let i = 0; i < palavra.length; i++) {
      grid[linha + dL * i][col + dC * i] = palavra[i];
    }
  }

  function _preencher(grid) {
    for (let l = 0; l < grid.length; l++) {
      for (let c = 0; c < grid[l].length; c++) {
        if (grid[l][c] === null) {
          grid[l][c] = LETRAS_PT[Math.floor(Math.random() * LETRAS_PT.length)];
        }
      }
    }
  }

  /**
   * @param {string[]} palavras
   * @param {{ tamanho?: number, diagonais?: boolean, tentativas?: number }} opts
   */
  function gerar(palavras, opts = {}) {
    const diagonais = opts.diagonais !== false;
    const tentativasMax = opts.tentativas ?? 50;

    // Normalizar: minúsculas, sem acentos simples usados no PT
    const normalize = w => w.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const palavrasNorm = palavras
      .map(p => ({ original: p, norm: normalize(p) }))
      .filter(p => p.norm.length >= 2)
      .sort((a, b) => b.norm.length - a.norm.length); // maiores primeiro

    const maxLen = palavrasNorm.reduce((m, p) => Math.max(m, p.norm.length), 0);
    const tam = opts.tamanho ?? Math.max(maxLen + 2, Math.ceil(Math.sqrt(palavrasNorm.length * 8)) + 2, 10);

    const dirs = Object.entries(DIRECOES).filter(([k]) =>
      diagonais || !k.startsWith('diagonal')
    );

    const posicoes = new Map();
    let grid;

    for (let tentativa = 0; tentativa < tentativasMax; tentativa++) {
      grid = _criarGrid(tam);
      posicoes.clear();
      let ok = true;

      for (const { original, norm } of palavrasNorm) {
        let colocada = false;
        const dirsEmb = _embaralhar(dirs);

        outer:
        for (const [dirNome, [dL, dC]] of dirsEmb) {
          const linhasEmb = _embaralhar([...Array(tam).keys()]);
          for (const l of linhasEmb) {
            const colsEmb = _embaralhar([...Array(tam).keys()]);
            for (const c of colsEmb) {
              if (_podeColocar(grid, norm, l, c, dL, dC)) {
                _colocar(grid, norm, l, c, dL, dC);
                posicoes.set(original, { linha: l, col: c, dir: dirNome, dL, dC, norm });
                colocada = true;
                break outer;
              }
            }
          }
        }

        if (!colocada) { ok = false; break; }
      }

      if (ok) break;
    }

    _preencher(grid);

    return {
      grid,
      tamanho: tam,
      posicoes,
      palavras: [...posicoes.keys()],
    };
  }

  /**
   * Encontra todas as ocorrências de palavras no grid (para verificação).
   * @param {string[][]} grid
   * @param {string} palavra — já normalizada
   * @returns {{ linha, col, dir }[]}
   */
  function encontrar(grid, palavra) {
    const resultados = [];
    const tam = grid.length;
    for (const [dirNome, [dL, dC]] of Object.entries(DIRECOES)) {
      for (let l = 0; l < tam; l++) {
        for (let c = 0; c < tam; c++) {
          let match = true;
          for (let i = 0; i < palavra.length; i++) {
            const ll = l + dL * i, cc = c + dC * i;
            if (ll < 0 || ll >= tam || cc < 0 || cc >= tam || grid[ll][cc] !== palavra[i]) {
              match = false; break;
            }
          }
          if (match) resultados.push({ linha: l, col: c, dir: dirNome, dL, dC });
        }
      }
    }
    return resultados;
  }

  return { gerar, encontrar };
})();

/* Expõe no escopo global para acesso pelo loader dinâmico (script tag clássico).
   'const' no topo de um script não vira propriedade de window automaticamente. */
window.WordFind = WordFind;

if (typeof module !== 'undefined') module.exports = WordFind;
