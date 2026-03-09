# recorder.js — Documentação Técnica

**Localização:** `js/recorder.js`

## Responsabilidade

Gravação de áudio local via `MediaRecorder` API.
Permite que o aluno registre uma resposta oral sem que o áudio seja enviado a nenhum servidor.

## Privacidade

- O áudio gravado existe **apenas em memória** durante a sessão do navegador.
- Nenhuma requisição de rede é feita.
- A URL de blob (`blob:...`) é revogada ao chamar `cleanup()` ou ao iniciar uma nova gravação.
- O stream de microfone é encerrado via `track.stop()` após cada gravação.

## API pública

### `start() → Promise<{ ok, reason? }>`

Solicita acesso ao microfone (se ainda não concedido) e inicia a gravação.

**Retorno:**
- `{ ok: true }` se a gravação foi iniciada com sucesso.
- `{ ok: false, reason: string }` nos casos:
  - `MediaRecorder` não disponível no navegador.
  - Permissão de microfone negada pelo usuário.
  - Nenhum dispositivo de áudio disponível.

Cancela a URL de blob da gravação anterior antes de iniciar, se existir.

### `stop() → Promise<{ ok, url?, reason? }>`

Para a gravação e retorna a URL de blob para reprodução.

**Retorno:**
- `{ ok: true, url: string }` — URL do tipo `blob:http://...` para usar em `<audio src>`.
- `{ ok: false, reason: string }` se não havia gravação ativa.

O evento `stop` do `MediaRecorder` é aguardado antes de resolver a Promise, garantindo que todos os chunks de dados estejam disponíveis.

### `isRecording() → boolean`

Retorna `true` se `_recorder.state === 'recording'`.

### `cleanup()`

Libera todos os recursos:
- Para o stream de microfone.
- Revoga a URL de blob (libera memória).
- Reseta `_recorder` e `_chunks`.

Deve ser chamado ao desmontar o componente que usa o recorder. Nesta versão, é chamado implicitamente quando uma nova gravação é iniciada.

## Formato do áudio

O `MediaRecorder` usa o formato padrão do navegador. Em navegadores Chromium, geralmente `audio/webm; codecs=opus`. Em Safari, `audio/mp4`.

O `Blob` é criado com `type: 'audio/webm'`, o que é aceito pelo `<audio>` na maioria dos navegadores.

## Disponibilidade

| Navegador | Suporte |
|---|---|
| Chrome / Edge | Sim |
| Firefox | Sim |
| Safari (macOS 14.1+, iOS 17.1+) | Sim (parcial) |
| Navegadores muito antigos | Não |

Em contextos sem HTTPS (ex.: `http://localhost`), o Chrome ainda permite acesso ao microfone. Em produção no GitHub Pages (HTTPS), não há restrição.

## Notas de implementação

- `getUserMedia` com `{ audio: true, video: false }` — câmera nunca é solicitada.
- O array `_chunks` acumula objetos `Blob` do evento `dataavailable` do MediaRecorder.
- A Promise de `stop()` é resolvida dentro do handler do evento `stop`, não imediatamente após chamar `_recorder.stop()`.
