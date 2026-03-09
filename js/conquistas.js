/**
 * conquistas.js
 * Sistema de emblemas baseado no progresso já armazenado no store.
 *
 * Uma conquista é desbloqueada quando todos os 3 níveis de uma unidade
 * estão com status 'concluida' no store.progress.
 *
 * Não armazena estado próprio — deriva tudo do store.progress.
 * Compatível com o cache existente de atividades.
 */

import { getProgress } from './store.js';
import { getAllAtividades } from './dataLoader/index.js';

/* Mapa de ícones SVG por componente — embutidos, sem dependência de rede */
const EMBLEMA_SVG = {
  'LP': `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="18" fill="currentColor" opacity=".15"/>
    <text x="20" y="26" text-anchor="middle" font-size="18" fill="currentColor">📖</text>
  </svg>`,
  'Matemática': `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="18" fill="currentColor" opacity=".15"/>
    <text x="20" y="26" text-anchor="middle" font-size="18" fill="currentColor">🔢</text>
  </svg>`,
  'Ciências': `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="18" fill="currentColor" opacity=".15"/>
    <text x="20" y="26" text-anchor="middle" font-size="18" fill="currentColor">🔭</text>
  </svg>`,
  'História': `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="18" fill="currentColor" opacity=".15"/>
    <text x="20" y="26" text-anchor="middle" font-size="18" fill="currentColor">🏛️</text>
  </svg>`,
  'Geografia': `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="18" fill="currentColor" opacity=".15"/>
    <text x="20" y="26" text-anchor="middle" font-size="18" fill="currentColor">🌍</text>
  </svg>`,
  'Arte': `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="18" fill="currentColor" opacity=".15"/>
    <text x="20" y="26" text-anchor="middle" font-size="18" fill="currentColor">🎨</text>
  </svg>`,
};

/**
 * Calcula todas as conquistas desbloqueadas e bloqueadas para um dado ano.
 *
 * @param {number} ano
 * @returns {Array<{
 *   componente: string,
 *   unidade_id: string,
 *   unidade_titulo: string,
 *   desbloqueada: boolean,
 *   total: number,
 *   concluidas: number,
 * }>}
 */
function getConquistasDoAno(ano) {
  const todas = getAllAtividades().filter(a => a.ano === ano);

  /*
   * Agrupar por COMPONENTE (não por unidade_id).
   * Um emblema representa o domínio completo da matéria no ano,
   * independente de quantas unidades ela tenha.
   * Ordem canônica preservada via inserção sequencial das atividades do cache.
   */
  const componentes = new Map();
  for (const a of todas) {
    if (!componentes.has(a.componente)) {
      componentes.set(a.componente, { componente: a.componente, atividades: [] });
    }
    componentes.get(a.componente).atividades.push(a);
  }

  const resultado = [];
  for (const c of componentes.values()) {
    const total     = c.atividades.length;
    const concluidas = c.atividades.filter(a => getProgress(a.id) === 'concluida').length;
    resultado.push({
      componente:   c.componente,
      desbloqueada: concluidas === total && total > 0,
      total,
      concluidas,
    });
  }

  return resultado;
}

/**
 * Conta conquistas desbloqueadas num ano.
 * @param {number} ano
 * @returns {number}
 */
function contarConquistas(ano) {
  return getConquistasDoAno(ano).filter(c => c.desbloqueada).length;
}

/**
 * Retorna o SVG do emblema de um componente.
 * @param {string} componente
 * @returns {string}
 */
function getEmblemaSVG(componente) {
  return EMBLEMA_SVG[componente] ?? EMBLEMA_SVG['Arte'];
}

export { getConquistasDoAno, contarConquistas, getEmblemaSVG };
