# tts.js

Síntese de fala via Web Speech API. Zero dependências externas. Funciona offline (sem rede).

## API pública

```js
import { speak, stop, isSpeaking, isSupported } from './tts.js';
```

### `speak(text, opts?) → { ok, reason? }`

Lê um texto em voz alta. Cancela qualquer leitura em andamento antes de iniciar.

| Opção | Tipo | Padrão | Descrição |
|---|---|---|---|
| `opts.lang` | string | `'pt-BR'` | Idioma da síntese |
| `opts.rate` | number | `0.95` | Velocidade (0.1–10) |
| `opts.pitch` | number | `1` | Tom (0–2) |
| `opts.onEnd` | function | — | Chamado ao terminar OU ao ser cancelado por `stop()` |

Retorna `{ ok: false, reason }` se a API não estiver disponível; `{ ok: true }` caso contrário.

### `stop()`

Cancela a leitura em andamento. Se havia um `onEnd` registrado, ele é chamado.

### `isSpeaking() → boolean`

Retorna `true` se há uma leitura em andamento. Útil para feedback visual no botão.

### `isSupported() → boolean`

Retorna `true` se `speechSynthesis` está disponível no browser atual.

## Workaround para bug do Chrome

O Chrome tem um bug documentado onde `speechSynthesis` entra em estado travado após ~15 segundos sem atividade — novas chamadas a `speak()` ficam em `pending` indefinidamente sem produzir áudio.

**Fix aplicado:** `speak()` chama `window.speechSynthesis.pause()` seguido de `resume()` imediatamente antes de enfileirar cada nova utterance. Isso "acorda" o engine sem efeito colateral observável.

Referência: [Chromium Issue #679437](https://bugs.chromium.org/p/chromium/issues/detail?id=679437)

## Uso no botão "Ouvir"

O botão em `ui/atividade.js` usa `isSpeaking()` + `onEnd` para dar feedback visual:

- Primeiro clique: inicia leitura, botão muda para "Ouvindo..." com `aria-pressed="true"`
- Segundo clique (durante leitura): cancela, botão volta para "Ouvir"
- Ao terminar naturalmente: `onEnd` restaura o botão
- Ao navegar para outra página: `hashchange { once: true }` cancela a leitura pendente

## Compatibilidade

| Browser | Suporte | Observação |
|---|---|---|
| Chrome / Edge | Bom | Bug de inatividade corrigido pelo workaround |
| Firefox | Parcial | Voz pt-BR pode soar sintética dependendo do SO |
| Safari (macOS) | Bom | Exige que `speak()` seja chamado em handler síncrono de clique — satisfeito |
| Safari (iOS) | Parcial | Voz pt-BR pode não estar disponível em todos os dispositivos |
