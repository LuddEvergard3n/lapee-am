/**
 * store.js
 * Estado global da aplicação (sem framework).
 * Armazena seleção de navegação, preferências de acessibilidade e progresso.
 * Persistência: localStorage para preferências; memória para navegação ativa.
 */

const STORAGE_KEY_PREFS = 'lapee_prefs';
const STORAGE_KEY_PROGRESS = 'lapee_progress';

const _state = {
  /* Navegação */
  ano: null,          // 1–5
  componente: null,   // "LP", "Matemática", etc.
  unidade_id: null,
  nivel: null,        // 1, 2 ou 3
  atividade_id: null,
  pagina: 'home',     // "home" | "navegador" | "atividade" | "sobre" | "acessibilidade"

  /* Modo professor */
  modoProfesor: false,

  /* Preferências de acessibilidade (persiste em localStorage) */
  prefs: {
    fonteGrande: false,
    altoContraste: false,
    temaEscuro: false,
    somAtivado: true,
  },

  /* Progresso do aluno: { [atividade_id]: "concluida" | "tentativa" } */
  progress: {},

  /* Ouvintes registrados */
  _listeners: [],
};

/**
 * Carrega preferências e progresso do localStorage.
 * Chamado uma única vez na inicialização.
 */
function init() {
  try {
    const rawPrefs = localStorage.getItem(STORAGE_KEY_PREFS);
    if (rawPrefs) {
      const parsed = JSON.parse(rawPrefs);
      Object.assign(_state.prefs, parsed);
    }

    const rawProgress = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (rawProgress) {
      _state.progress = JSON.parse(rawProgress);
    }
  } catch {
    /* Falha silenciosa: localStorage pode estar bloqueado em alguns contextos */
  }
}

/**
 * Retorna uma cópia rasa do estado atual.
 * @returns {object}
 */
function getState() {
  return {
    ano:          _state.ano,
    componente:   _state.componente,
    unidade_id:   _state.unidade_id,
    nivel:        _state.nivel,
    atividade_id: _state.atividade_id,
    pagina:       _state.pagina,
    modoProfesor: _state.modoProfesor,
    prefs:        { ..._state.prefs },
    progress:     { ..._state.progress },
  };
}

/**
 * Atualiza parcialmente o estado e notifica todos os ouvintes.
 * @param {object} partial - Campos a atualizar.
 */
function setState(partial) {
  const hasPrefsChange = 'prefs' in partial;

  Object.assign(_state, partial);

  if (hasPrefsChange) {
    Object.assign(_state.prefs, partial.prefs);
    _persistPrefs();
  }

  _notify();
}

/**
 * Registra o progresso de uma atividade.
 * @param {string} atividade_id
 * @param {'concluida'|'tentativa'} status
 */
function setProgress(atividade_id, status) {
  _state.progress[atividade_id] = status;
  _persistProgress();
  /* Não chama _notify() aqui: o motor de atividade não deve ser re-renderizado
     ao registrar progresso — isso destruiria o feedback na tela. */
}

/**
 * Retorna o status de progresso de uma atividade.
 * @param {string} atividade_id
 * @returns {'concluida'|'tentativa'|null}
 */
function getProgress(atividade_id) {
  return _state.progress[atividade_id] ?? null;
}

/**
 * Conta atividades concluídas de uma unidade.
 * @param {string} unidade_id
 * @param {object[]} atividades - Lista completa de atividades.
 * @returns {{ total: number, concluidas: number }}
 */
function getProgressoUnidade(unidade_id, atividades) {
  const daunidade = atividades.filter(a => a.unidade_id === unidade_id);
  const concluidas = daunidade.filter(a => _state.progress[a.id] === 'concluida').length;
  return { total: daunidade.length, concluidas };
}

/**
 * Registra uma função que será chamada sempre que o estado mudar.
 * @param {function} fn
 * @returns {function} Função para cancelar o registro.
 */
function subscribe(fn) {
  _state._listeners.push(fn);
  return () => {
    _state._listeners = _state._listeners.filter(l => l !== fn);
  };
}

/* ---- Privados ---- */

function _notify() {
  const snapshot = getState();
  for (const fn of _state._listeners) {
    fn(snapshot);
  }
}

function _persistPrefs() {
  try {
    localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(_state.prefs));
  } catch {
    /* Falha silenciosa */
  }
}

function _persistProgress() {
  try {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(_state.progress));
  } catch {
    /* Falha silenciosa */
  }
}

/**
 * Apaga todo o progresso do aluno (memória + localStorage).
 * Chamado pelo botão de reset na página de acessibilidade.
 */
function clearProgress() {
  _state.progress = {};
  try { localStorage.removeItem(STORAGE_KEY_PROGRESS); } catch { /* silencioso */ }
  _notify();
}

export { init, getState, setState, setProgress, getProgress, getProgressoUnidade, clearProgress, subscribe };
