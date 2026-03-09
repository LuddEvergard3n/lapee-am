/**
 * recorder.js
 * Gravação de áudio local via MediaRecorder API.
 * O áudio nunca é enviado a nenhum servidor.
 * Armazenado em memória (Blob) durante a sessão.
 */

let _stream = null;
let _recorder = null;
let _chunks = [];
let _blobUrl = null;

/**
 * Inicia a gravação de áudio.
 * Solicita permissão ao usuário se ainda não concedida.
 * @returns {Promise<{ ok: boolean, reason?: string }>}
 */
async function start() {
  if (!('MediaRecorder' in window)) {
    return { ok: false, reason: 'Gravação não suportada neste navegador.' };
  }

  try {
    _stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  } catch (err) {
    return { ok: false, reason: 'Permissão de microfone negada ou indisponível.' };
  }

  _chunks = [];
  _revoke(); /* Libera URL anterior se existir */

  _recorder = new MediaRecorder(_stream);

  _recorder.addEventListener('dataavailable', (e) => {
    if (e.data.size > 0) _chunks.push(e.data);
  });

  _recorder.start();
  return { ok: true };
}

/**
 * Para a gravação e retorna a URL de objeto (blob:) para reprodução local.
 * @returns {Promise<{ ok: boolean, url?: string, reason?: string }>}
 */
function stop() {
  return new Promise((resolve) => {
    if (!_recorder || _recorder.state === 'inactive') {
      resolve({ ok: false, reason: 'Nenhuma gravação em andamento.' });
      return;
    }

    _recorder.addEventListener('stop', () => {
      const blob = new Blob(_chunks, { type: 'audio/webm' });
      _blobUrl = URL.createObjectURL(blob);
      _stopStream();
      resolve({ ok: true, url: _blobUrl });
    }, { once: true });

    _recorder.stop();
  });
}

/**
 * Verifica se a gravação está em andamento.
 * @returns {boolean}
 */
function isRecording() {
  return _recorder !== null && _recorder.state === 'recording';
}

/**
 * Libera recursos: para o stream e revoga a URL de blob.
 * Deve ser chamado ao desmontar o componente que usa o recorder.
 */
function cleanup() {
  _stopStream();
  _revoke();
  _recorder = null;
  _chunks = [];
}

/* ---- Privados ---- */

function _stopStream() {
  if (_stream) {
    _stream.getTracks().forEach(t => t.stop());
    _stream = null;
  }
}

function _revoke() {
  if (_blobUrl) {
    URL.revokeObjectURL(_blobUrl);
    _blobUrl = null;
  }
}

export { start, stop, isRecording, cleanup };
