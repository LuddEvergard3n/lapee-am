/**
 * notificacoes.js
 * Sistema de notificações toast para feedback de ações na UI.
 *
 * Tipos: 'sucesso' | 'erro' | 'aviso' | 'info'
 * Uso:
 *   import { notificar } from './notificacoes.js';
 *   notificar('Progresso apagado!', 'sucesso');
 *   notificar('Erro ao gerar plano.', 'erro', 6000);
 *
 * O container é criado automaticamente na primeira chamada.
 */

const DURACAO_PADRAO = 4000; /* ms */

/** @type {HTMLElement|null} */
let _container = null;

/**
 * Exibe uma notificação toast.
 * @param {string} mensagem
 * @param {'sucesso'|'erro'|'aviso'|'info'} tipo
 * @param {number} [duracao] ms até auto-fechar; 0 = permanente
 * @returns {() => void} Função para fechar manualmente
 */
function notificar(mensagem, tipo = 'info', duracao = DURACAO_PADRAO) {
  _ensureContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.setAttribute('role', tipo === 'erro' ? 'alert' : 'status');
  toast.setAttribute('aria-live', tipo === 'erro' ? 'assertive' : 'polite');
  toast.setAttribute('aria-atomic', 'true');

  const icon = _icone(tipo);
  const texto = document.createElement('span');
  texto.className = 'toast-msg';
  texto.textContent = mensagem;

  const btnFechar = document.createElement('button');
  btnFechar.type = 'button';
  btnFechar.className = 'toast-close';
  btnFechar.setAttribute('aria-label', 'Fechar notificação');
  btnFechar.textContent = '×';

  toast.appendChild(icon);
  toast.appendChild(texto);
  toast.appendChild(btnFechar);
  _container.appendChild(toast);

  /* Força reflow para a animação de entrada funcionar */
  void toast.offsetHeight;
  toast.classList.add('toast-visible');

  const dismiss = () => {
    if (!toast.isConnected) return;
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-saindo');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    /* Fallback caso transitionend não dispare */
    setTimeout(() => toast.remove(), 400);
  };

  btnFechar.addEventListener('click', dismiss);

  let timerId = null;
  if (duracao > 0) {
    timerId = setTimeout(dismiss, duracao);
  }

  /* Pausar auto-dismiss ao hover */
  toast.addEventListener('mouseenter', () => {
    if (timerId) { clearTimeout(timerId); timerId = null; }
  });
  toast.addEventListener('mouseleave', () => {
    if (duracao > 0 && timerId === null) {
      timerId = setTimeout(dismiss, duracao);
    }
  });

  return dismiss;
}

/* ---- Privados ---- */

function _ensureContainer() {
  if (_container && _container.isConnected) return;
  _container = document.createElement('div');
  _container.id = 'toast-container';
  _container.setAttribute('aria-label', 'Notificações');
  document.body.appendChild(_container);
}

function _icone(tipo) {
  const span = document.createElement('span');
  span.className = 'toast-icon';
  span.setAttribute('aria-hidden', 'true');
  span.textContent = { sucesso: '✓', erro: '✕', aviso: '!', info: 'i' }[tipo] ?? 'i';
  return span;
}

export { notificar };
