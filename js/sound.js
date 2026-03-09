/**
 * sound.js
 * Síntese de efeitos sonoros via Web Audio API.
 * Zero dependências externas. Funciona offline.
 *
 * AudioContext é criado lazily na primeira chamada a play() para
 * respeitar a política de autoplay dos navegadores modernos (exige
 * gesto do usuário antes de criar contexto de áudio).
 *
 * Sons disponíveis:
 *   'acerto'    — arpejo ascendente curto (resposta correta)
 *   'erro'      — queda de tom (resposta errada)
 *   'conquista' — fanfarra (emblema desbloqueado)
 *   'clique'    — tique suave (interação de UI)
 *
 * Uso:
 *   import { play, setMuted, isMuted } from './sound.js';
 *   play('acerto');
 *   setMuted(true);
 */

const _supported = typeof window !== 'undefined' && 'AudioContext' in window;

/** @type {AudioContext|null} */
let _ctx = null;

/** @type {boolean} */
let _muted = false;

/* --------------------------------------------------------------------------
   API pública
   -------------------------------------------------------------------------- */

/**
 * Toca um efeito sonoro.
 * Cria o AudioContext na primeira chamada (após gesto do usuário).
 * @param {'acerto'|'erro'|'conquista'|'clique'} nome
 */
function play(nome) {
  if (!_supported || _muted) return;

  /* AudioContext só pode ser criado após interação do usuário */
  if (!_ctx) {
    try {
      _ctx = new AudioContext();
    } catch {
      return; /* falha silenciosa se bloqueado */
    }
  }

  /* Resume se suspenso (política de autoplay do Chrome) */
  if (_ctx.state === 'suspended') {
    _ctx.resume();
  }

  const now = _ctx.currentTime;

  switch (nome) {
    case 'acerto':    _playAcerto(now);    break;
    case 'erro':      _playErro(now);      break;
    case 'conquista': _playConquista(now); break;
    case 'clique':    _playClique(now);    break;
  }
}

/**
 * Liga ou desliga todos os sons.
 * @param {boolean} muted
 */
function setMuted(muted) {
  _muted = muted;
}

/**
 * @returns {boolean}
 */
function isMuted() {
  return _muted;
}

/* --------------------------------------------------------------------------
   Síntese dos sons
   Cada função agenda notas no AudioContext sem bloquear a thread.
   -------------------------------------------------------------------------- */

/**
 * Acerto: arpejo ascendente C5 → E5 → G5 (triangle, suave e alegre).
 */
function _playAcerto(t) {
  /* C5, E5, G5 */
  _tone(_ctx, 523.25, 'triangle', t + 0.00, 0.14, 0.18);
  _tone(_ctx, 659.25, 'triangle', t + 0.11, 0.14, 0.18);
  _tone(_ctx, 784.00, 'triangle', t + 0.22, 0.22, 0.20);
}

/**
 * Erro: descida E4 → C4 (sine, suave — erra sem punir).
 */
function _playErro(t) {
  _tone(_ctx, 329.63, 'sine', t + 0.00, 0.14, 0.14);
  _tone(_ctx, 261.63, 'sine', t + 0.13, 0.22, 0.14);
}

/**
 * Conquista: fanfarra C5 → E5 → G5 → C6, último tom mais longo.
 */
function _playConquista(t) {
  _tone(_ctx, 523.25, 'triangle', t + 0.00, 0.10, 0.22);
  _tone(_ctx, 659.25, 'triangle', t + 0.10, 0.10, 0.22);
  _tone(_ctx, 784.00, 'triangle', t + 0.20, 0.10, 0.22);
  _tone(_ctx, 1046.50,'triangle', t + 0.30, 0.40, 0.25);
  /* Acorde de apoio: G5 + E5 atrás do C6 */
  _tone(_ctx, 784.00, 'sine',     t + 0.30, 0.35, 0.10);
  _tone(_ctx, 659.25, 'sine',     t + 0.30, 0.35, 0.08);
}

/**
 * Clique: impulso curto em 900 Hz (sine), 20 ms — tique de UI discreto.
 */
function _playClique(t) {
  _tone(_ctx, 900, 'sine', t, 0.020, 0.07);
}

/* --------------------------------------------------------------------------
   Primitivo de síntese
   -------------------------------------------------------------------------- */

/**
 * Agenda uma nota sintética com envelope de ganho (attack + decay).
 *
 * @param {AudioContext} ctx
 * @param {number} freq       Frequência em Hz
 * @param {OscillatorType} type  Forma de onda ('sine'|'triangle'|'square'|'sawtooth')
 * @param {number} startTime  Tempo de início em ctx.currentTime
 * @param {number} duration   Duração em segundos
 * @param {number} peak       Ganho máximo (0–1); valores acima de 0.3 podem distorcer
 */
function _tone(ctx, freq, type, startTime, duration, peak) {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  /* Envelope: ataque de 10 ms, decaimento exponencial até silêncio */
  const attackEnd = startTime + 0.01;
  const decayEnd  = startTime + duration;

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peak, attackEnd);
  gain.gain.exponentialRampToValueAtTime(0.0001, decayEnd);

  osc.start(startTime);
  osc.stop(decayEnd + 0.01); /* margem de segurança para o decaimento */
}

export { play, setMuted, isMuted };
