/**
 * dataLoader/index.js
 * API pública do dataLoader modularizado.
 * Substitui o antigo js/dataLoader.js.
 *
 * Estratégia de carregamento: lazy por (componente, ano).
 * O arquivo JSON correspondente é carregado apenas quando aquela
 * combinação é solicitada pela primeira vez.
 *
 * Para a tela inicial e o navegador, um carregamento eager de todos
 * os anos/componentes conhecidos é oferecido via loadAll().
 */

import * as cache    from './cache.js';
import * as resolver from './resolver.js';
import * as queries  from './queries.js';

/**
 * Carrega o arquivo JSON de um par (componente, ano) se ainda não estiver em cache.
 * @param {string} componente
 * @param {number} ano
 * @returns {Promise<void>}
 */
async function load(componente, ano) {
  const path = resolver.resolvearquivo(componente, ano);
  if (!path) return;
  if (cache.has(path)) return; /* já carregado */

  const resp = await fetch(path);
  if (!resp.ok) {
    /* Arquivo não encontrado é tratado como lista vazia, não como erro fatal.
       Isso permite que anos/componentes parcialmente implementados não quebrem a UI. */
    console.warn(`[dataLoader] Arquivo não encontrado: ${path}`);
    cache.set(path, []);
    return;
  }

  const data = await resp.json();
  cache.set(path, data);
}

/**
 * Carrega todos os arquivos conhecidos para todos os anos disponíveis.
 * Usado na inicialização para popular o cache e permitir que getAnos()
 * e getComponentes() retornem dados completos imediatamente.
 *
 * Anos suportados: 1 a 5 (Ensino Fundamental I).
 * Se um arquivo não existir, o load() individual ignora silenciosamente.
 *
 * @returns {Promise<void>}
 */
async function loadAll() {
  const componentes = resolver.getComponentesConhecidos();
  const anos = [1, 2, 3, 4, 5];

  const promises = [];
  for (const comp of componentes) {
    for (const ano of anos) {
      promises.push(load(comp, ano));
    }
  }

  await Promise.all(promises);
}

/* Re-exporta todas as funções de consulta para que os consumidores
   importem tudo de 'js/dataLoader/index.js' sem precisar conhecer
   a estrutura interna do módulo. */
export {
  load,
  loadAll,
};

export {
  getAnos,
  getComponentes,
  getUnidades,
  getAtividadesDaUnidade,
  getAtividade,
  getAtividadePorNivel,
  getAllAtividades,
} from './queries.js';
