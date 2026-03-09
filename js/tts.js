/**
 * tts.js
 * Síntese de fala via Web Speech API (SpeechSynthesis).
 * Sem dependências externas. Sem fallback de rede.
 * Se a API não estiver disponível, o chamador recebe { ok: false }.
 *
 * Workaround para bug do Chrome: após ~15s sem falar, speechSynthesis entra em
 * estado "stuck" e novas chamadas ficam em pending indefinidamente.
 * Fix: chamar pause()+resume() imediatamente antes de speak() para "acordar"
 * o engine. Documentado em https://bugs.chromium.org/p/chromium/issues/detail?id=679437
 */

const _supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

/** @type {SpeechSynthesisUtterance|null} */
let _current = null;

/** @type {Function|null} Callback registrado pelo chamador para quando terminar */
let _onEnd = null;

/**
 * Lê um texto em voz alta.
 * @param {string} text
 * @param {object} [opts]
 * @param {string}   [opts.lang]   Idioma (padrão: 'pt-BR')
 * @param {number}   [opts.rate]   Velocidade (padrão: 0.95)
 * @param {number}   [opts.pitch]  Tom (padrão: 1)
 * @param {Function} [opts.onEnd]  Chamado ao terminar ou ao ser cancelado
 * @returns {{ ok: boolean, reason?: string }}
 */
function speak(text, opts = {}) {
  if (!_supported) {
    return { ok: false, reason: 'API de síntese de fala não disponível neste navegador.' };
  }

  stop(); /* Cancela leitura anterior e notifica onEnd pendente */

  /*
   * Workaround para o bug do Chrome onde speechSynthesis trava após inatividade.
   * pause() + resume() acorda o engine antes de enfileirar uma nova utterance.
   */
  window.speechSynthesis.pause();
  window.speechSynthesis.resume();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang  = opts.lang  ?? 'pt-BR';
  utterance.rate  = opts.rate  ?? 0.95;
  utterance.pitch = opts.pitch ?? 1;

  _onEnd = opts.onEnd ?? null;

  utterance.addEventListener('end', () => {
    _current = null;
    if (typeof _onEnd === 'function') { _onEnd(); _onEnd = null; }
  });

  utterance.addEventListener('error', () => {
    _current = null;
    if (typeof _onEnd === 'function') { _onEnd(); _onEnd = null; }
  });

  _current = utterance;
  window.speechSynthesis.speak(utterance);

  return { ok: true };
}

/**
 * Interrompe a leitura em andamento, se houver.
 * Chama onEnd se estava lendo.
 */
function stop() {
  if (_supported) {
    window.speechSynthesis.cancel();
  }
  if (_current !== null) {
    _current = null;
    if (typeof _onEnd === 'function') { _onEnd(); _onEnd = null; }
  }
}

/**
 * Retorna true se há uma leitura em andamento.
 * @returns {boolean}
 */
function isSpeaking() {
  return _current !== null;
}

/**
 * Retorna se a API está disponível no navegador atual.
 * @returns {boolean}
 */
function isSupported() {
  return _supported;
}

export { speak, stop, isSpeaking, isSupported };
