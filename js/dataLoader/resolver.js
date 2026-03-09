/**
 * dataLoader/resolver.js
 * Converte o par (componente, ano) no nome do arquivo JSON correspondente.
 * É aqui que a convenção de nomenclatura dos arquivos de dados é centralizada.
 *
 * Convenção de nome de arquivo:
 *   atividades-{slug-do-componente}-{ano}.json
 *
 * Exemplo:
 *   ("LP", 3)         → "atividades-lp-3.json"
 *   ("Matemática", 3) → "atividades-matematica-3.json"
 *   ("História", 3)   → "atividades-historia-3.json"
 */

/**
 * Mapa explícito de componente → slug de arquivo.
 * Preferível a uma transformação dinâmica de string para evitar
 * surpresas com acentuação e nomes compostos.
 */
const COMPONENTE_SLUG = {
  'LP':          'lp',
  'Matemática':  'matematica',
  'Ciências':    'ciencias',
  'História':    'historia',
  'Geografia':   'geografia',
  'Arte':        'arte',
};

/**
 * Retorna o caminho relativo do arquivo JSON para (componente, ano).
 * @param {string} componente - Ex.: "LP", "Matemática"
 * @param {number} ano        - Ex.: 3
 * @returns {string|null}     - Ex.: "./data/atividades-lp-3.json", ou null se inválido.
 */
function resolvearquivo(componente, ano) {
  const slug = COMPONENTE_SLUG[componente];
  if (!slug || !ano) return null;
  return `./data/atividades-${slug}-${ano}.json`;
}

/**
 * Retorna todos os slugs de componentes conhecidos.
 * Usado pelo dataLoader para enumerar os arquivos disponíveis.
 * @returns {string[]}
 */
function getComponentesConhecidos() {
  return Object.keys(COMPONENTE_SLUG);
}

export { resolvearquivo, getComponentesConhecidos };
