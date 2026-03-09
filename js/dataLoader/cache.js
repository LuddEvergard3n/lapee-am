/**
 * dataLoader/cache.js
 * Cache em memória dos arquivos JSON já carregados.
 * Evita fetch repetido do mesmo arquivo durante a sessão.
 *
 * Chave de cache: caminho do arquivo (ex.: "./data/atividades-lp-3.json")
 * Valor: array de objetos de atividade
 */

/** @type {Map<string, object[]>} */
const _cache = new Map();

/**
 * Verifica se um arquivo já está em cache.
 * @param {string} path
 * @returns {boolean}
 */
function has(path) {
  return _cache.has(path);
}

/**
 * Retorna os dados em cache para um arquivo.
 * @param {string} path
 * @returns {object[]|null}
 */
function get(path) {
  return _cache.get(path) ?? null;
}

/**
 * Armazena os dados de um arquivo no cache.
 * @param {string} path
 * @param {object[]} data
 */
function set(path, data) {
  _cache.set(path, data);
}

/**
 * Retorna todos os arrays de atividades armazenados no cache, concatenados.
 * Usado por funções que precisam varrer todos os dados carregados.
 * @returns {object[]}
 */
function getAll() {
  const result = [];
  for (const atividades of _cache.values()) {
    result.push(...atividades);
  }
  return result;
}

/**
 * Limpa o cache inteiro. Útil em testes ou se o conteúdo for atualizado em runtime.
 */
function clear() {
  _cache.clear();
}

export { has, get, set, getAll, clear };
