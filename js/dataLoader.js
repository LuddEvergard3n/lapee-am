/**
 * dataLoader.js
 * Carrega e indexa os dados de atividades a partir de /data/atividades.json.
 * Funciona offline (sem fetch externo). Expõe funções de consulta reutilizáveis.
 */

let _atividades = [];
let _loaded = false;

/**
 * Carrega o JSON de atividades. Deve ser chamado uma única vez na inicialização.
 * @returns {Promise<void>}
 */
async function load() {
  if (_loaded) return;
  const resp = await fetch('./data/atividades.json');
  if (!resp.ok) throw new Error(`Falha ao carregar dados: ${resp.status}`);
  _atividades = await resp.json();
  _loaded = true;
}

/**
 * Retorna todos os anos presentes nos dados (ordenados).
 * @returns {number[]}
 */
function getAnos() {
  return [...new Set(_atividades.map(a => a.ano))].sort((x, y) => x - y);
}

/**
 * Retorna todos os componentes curriculares de um dado ano.
 * @param {number} ano
 * @returns {string[]}
 */
function getComponentes(ano) {
  return [...new Set(
    _atividades.filter(a => a.ano === ano).map(a => a.componente)
  )];
}

/**
 * Retorna todas as unidades de um componente/ano (sem duplicação).
 * @param {number} ano
 * @param {string} componente
 * @returns {{ unidade_id: string, unidade_titulo: string }[]}
 */
function getUnidades(ano, componente) {
  const seen = new Set();
  return _atividades
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
 * Retorna as atividades de uma unidade específica.
 * @param {string} unidade_id
 * @returns {object[]}
 */
function getAtividadesDaUnidade(unidade_id) {
  return _atividades.filter(a => a.unidade_id === unidade_id);
}

/**
 * Retorna uma atividade específica por ID.
 * @param {string} id
 * @returns {object|null}
 */
function getAtividade(id) {
  return _atividades.find(a => a.id === id) ?? null;
}

/**
 * Retorna a atividade de um determinado nível dentro de uma unidade.
 * @param {string} unidade_id
 * @param {number} nivel - 1, 2 ou 3
 * @returns {object|null}
 */
function getAtividadePorNivel(unidade_id, nivel) {
  return _atividades.find(a => a.unidade_id === unidade_id && a.nivel === nivel) ?? null;
}

/**
 * Retorna a lista completa de atividades (para cálculos de progresso).
 * @returns {object[]}
 */
function getAllAtividades() {
  return _atividades;
}

export {
  load,
  getAnos,
  getComponentes,
  getUnidades,
  getAtividadesDaUnidade,
  getAtividade,
  getAtividadePorNivel,
  getAllAtividades,
};
