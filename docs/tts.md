# tts.js

Síntese de fala via Web Speech API. Zero dependências externas. Funciona offline.

## API pública

```js
import { speak, stop, isSpeaking, isSupported } from './tts.js';
```

### `speak(text, opts?) → { ok, reason? }`

| Opção | Padrão | Descrição |
|---|---|---|
| `opts.lang` | `'pt-BR'` | Idioma da síntese |
| `opts.rate` | `0.95` | Velocidade |
| `opts.pitch` | `1` | Tom |
| `opts.onEnd` | — | Chamado ao terminar OU ao ser cancelado por `stop()` |

### `stop()` / `isSpeaking() → boolean` / `isSupported() → boolean`

## Workaround Chrome

O Chrome trava o engine de síntese após ~15s de inatividade. Fix: `pause()` + `resume()` antes de cada `speak()`. Referência: Chromium #679437.

## Uso no botão "Ouvir"

O botão em `ui/atividade.js` alterna entre "Ouvir" e "Ouvindo..." usando `isSpeaking()` + `opts.onEnd`. Segundo clique cancela. Leitura cancelada no `hashchange { once: true }`.
