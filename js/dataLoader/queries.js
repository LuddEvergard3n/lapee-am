/**
 * dataLoader/queries.js
 * Funções de consulta sobre os dados já carregados no cache.
 * Todas as funções são puras em relação ao cache — leem mas não modificam.
 *
 * Dependência: cache.js (via parâmetro ou importação)
 * As funções recebem o cache como dependência explícita para facilitar testes.
 */

import * as cache    from './cache.js';
import { getComponentesConhecidos } from './resolver.js';

/** Ordem canônica de componentes — determinística independente da ordem de fetch. */
const _COMP_ORDER = getComponentesConhecidos();

/**
 * Retorna todos os anos presentes nos dados carregados, ordenados crescentemente.
 * @returns {number[]}
 */
function getAnos() {
  return [...new Set(cache.getAll().map(a => a.ano))].sort((x, y) => x - y);
}

/**
 * Retorna os componentes disponíveis para um dado ano.
 * Considera apenas os dados já carregados no cache.
 * @param {number} ano
 * @returns {string[]}
 */
function getComponentes(ano) {
  const presentes = new Set(
    cache.getAll()
      .filter(a => a.ano === ano)
      .map(a => a.componente)
  );
  /* Retorna na ordem canônica do resolver para UI determinística. */
  return _COMP_ORDER.filter(c => presentes.has(c));
}

/**
 * Retorna as unidades de um par (ano, componente), sem duplicação de unidade_id.
 * Preserva a ordem de aparição nos dados.
 * @param {number} ano
 * @param {string} componente
 * @returns {{ unidade_id: string, unidade_titulo: string }[]}
 */
function getUnidades(ano, componente) {
  const seen = new Set();
  return cache.getAll()
    .filter(a => a.ano === ano && a.componente === componente)
    .reduce((acc, a) => {
      if (!seen.has(a.unidade_id)) {
        seen.add(a.unidade_id);
        acc.push({ unidade_id: a.unidade_id, unidade_titulo: a.unidade_titulo });
      }
      return acc;
    }, []);
}

/**
 * Retorna todas as atividades de uma unidade (todos os níveis).
 * @param {string} unidade_id
 * @returns {object[]}
 */
function getAtividadesDaUnidade(unidade_id) {
  return cache.getAll().filter(a => a.unidade_id === unidade_id);
}

/**
 * Retorna uma atividade pelo ID.
 * @param {string} id
 * @returns {object|null}
 */
function getAtividade(id) {
  return cache.getAll().find(a => a.id === id) ?? null;
}

/**
 * Retorna a atividade de um nível específico dentro de uma unidade.
 * @param {string} unidade_id
 * @param {number} nivel
 * @returns {object|null}
 */
function getAtividadePorNivel(unidade_id, nivel) {
  return cache.getAll().find(a => a.unidade_id === unidade_id && a.nivel === nivel) ?? null;
}

/**
 * Retorna todas as atividades carregadas até o momento.
 * @returns {object[]}
 */
function getAllAtividades() {
  return cache.getAll();
}

export {
  getAnos,
  getComponentes,
  getUnidades,
  getAtividadesDaUnidade,
  getAtividade,
  getAtividadePorNivel,
  getAllAtividades,
};
