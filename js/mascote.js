/**
 * mascote.js
 * Lua — a coruja mascote do LAPEE AM.
 *
 * Retorna SVG inline com animação CSS via classe de estado.
 * Estados: idle | acerto | erro | conquista
 *
 * Uso:
 *   import { renderMascote, setEstado } from './mascote.js';
 *   renderMascote(container);           // insere #mascote-lua no container
 *   setEstado('acerto');                // anima para o estado de acerto
 *   setEstado('idle', 2000);            // volta ao idle após 2s
 */

const SVG = `
<svg id="lua-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" aria-hidden="true">
  <defs>
    <radialGradient id="lua-body-grad" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#f5c842"/>
      <stop offset="100%" stop-color="#d4860a"/>
    </radialGradient>
    <radialGradient id="lua-belly-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fdeec0"/>
      <stop offset="100%" stop-color="#f5d87a"/>
    </radialGradient>
    <filter id="lua-glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Sombra no chão -->
  <ellipse class="lua-shadow" cx="60" cy="134" rx="28" ry="5" fill="rgba(0,0,0,0.12)"/>

  <!-- Corpo -->
  <ellipse class="lua-body" cx="60" cy="80" rx="36" ry="44" fill="url(#lua-body-grad)"/>

  <!-- Barriga -->
  <ellipse cx="60" cy="90" rx="22" ry="28" fill="url(#lua-belly-grad)"/>

  <!-- Asa esquerda -->
  <ellipse class="lua-wing-l" cx="26" cy="85" rx="12" ry="20"
           fill="#c77c08" transform="rotate(-15 26 85)"/>

  <!-- Asa direita -->
  <ellipse class="lua-wing-r" cx="94" cy="85" rx="12" ry="20"
           fill="#c77c08" transform="rotate(15 94 85)"/>

  <!-- Orelhas (plumas) -->
  <polygon class="lua-ear-l" points="34,44 26,28 44,38" fill="#c77c08"/>
  <polygon class="lua-ear-r" points="86,44 94,28 76,38" fill="#c77c08"/>

  <!-- Olhos — grupo animável -->
  <g class="lua-eyes">
    <!-- Olho esquerdo -->
    <circle cx="45" cy="66" r="12" fill="white"/>
    <circle class="lua-iris-l" cx="45" cy="67" r="8" fill="#2d3a8c"/>
    <circle cx="45" cy="67" r="4" fill="#1a1a2e"/>
    <circle cx="48" cy="64" r="2" fill="white"/>

    <!-- Olho direito -->
    <circle cx="75" cy="66" r="12" fill="white"/>
    <circle class="lua-iris-r" cx="75" cy="67" r="8" fill="#2d3a8c"/>
    <circle cx="75" cy="67" r="4" fill="#1a1a2e"/>
    <circle cx="78" cy="64" r="2" fill="white"/>
  </g>

  <!-- Bico -->
  <polygon class="lua-beak" points="60,76 54,84 66,84" fill="#d4860a"/>

  <!-- Bochechas (só no estado acerto) -->
  <circle class="lua-blush-l" cx="35" cy="78" r="8" fill="#ff7a9a" opacity="0"/>
  <circle class="lua-blush-r" cx="85" cy="78" r="8" fill="#ff7a9a" opacity="0"/>

  <!-- Estrelinhas de acerto (surgem no acerto) -->
  <g class="lua-stars" opacity="0">
    <text x="8"  y="50" font-size="14" fill="#f5c842">★</text>
    <text x="98" y="50" font-size="14" fill="#f5c842">★</text>
    <text x="50" y="20" font-size="10" fill="#f5c842">✦</text>
  </g>

  <!-- Lágrima (estado erro — pequena, encorajadora) -->
  <ellipse class="lua-tear" cx="40" cy="80" rx="2.5" ry="3.5" fill="#6aabff" opacity="0"/>
</svg>
`;

const ESTADO_CSS = {
  idle:      '',
  acerto:    'lua-acerto',
  erro:      'lua-erro',
  conquista: 'lua-conquista',
};

let _wrapper = null;
let _timeoutId = null;

/**
 * Insere o mascote no container fornecido.
 * @param {HTMLElement} container
 */
function renderMascote(container) {
  _wrapper = document.createElement('div');
  _wrapper.id = 'mascote-lua';
  _wrapper.className = 'mascote-wrapper';
  _wrapper.setAttribute('aria-hidden', 'true');
  _wrapper.innerHTML = SVG;
  container.appendChild(_wrapper);
}

/**
 * Altera o estado visual do mascote com animação.
 * @param {'idle'|'acerto'|'erro'|'conquista'} estado
 * @param {number} [duracaoMs] - Se fornecido, volta para idle após esse tempo.
 */
function setEstado(estado, duracaoMs) {
  if (!_wrapper) return;

  /* Cancela timeout anterior */
  if (_timeoutId !== null) {
    clearTimeout(_timeoutId);
    _timeoutId = null;
  }

  /* Remove todos os estados */
  Object.values(ESTADO_CSS).forEach(cls => {
    if (cls) _wrapper.classList.remove(cls);
  });

  const cls = ESTADO_CSS[estado];
  if (cls) _wrapper.classList.add(cls);

  if (duracaoMs) {
    _timeoutId = setTimeout(() => setEstado('idle'), duracaoMs);
  }
}

export { renderMascote, setEstado };
