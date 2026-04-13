# recorder.js

Gravação de áudio local via MediaRecorder API. O áudio nunca é enviado a nenhum servidor.

## API pública

```js
import { start, stop, isRecording, cleanup } from './recorder.js';

const result = await start();   // { ok, reason? }
const result = await stop();    // { ok, url?, reason? }
cleanup();                      // libera stream e revoga blob URL
```

### `start() → Promise<{ ok, reason? }>`

Solicita `getUserMedia({ audio: true })`. Retorna `{ ok: false, reason }` se MediaRecorder não suportado ou permissão negada.

### `stop() → Promise<{ ok, url?, reason? }>`

Para a gravação, cria um `Blob` em `audio/webm`, gera URL de objeto e retorna `{ ok: true, url }` para reprodução local via `<audio>`.

### `cleanup()`

Para o stream de microfone e revoga a blob URL. Deve ser chamado no `hashchange { once: true }` para liberar o microfone quando o aluno navega sem parar a gravação manualmente.

## Notas

- Sem upload, sem persistência — o áudio existe apenas enquanto a aba está aberta
- A blob URL é revogada automaticamente no próximo `start()` ou no `cleanup()`
- Em conexões não-HTTPS, alguns browsers bloqueiam `getUserMedia` — GitHub Pages usa HTTPS
