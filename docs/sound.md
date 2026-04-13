# sound.js

Síntese de efeitos sonoros via Web Audio API. Zero dependências externas. Funciona offline.

## API

```js
import { play, setMuted, isMuted } from './sound.js';

play('acerto');    // arpejo C5→E5→G5
play('erro');      // descida E4→C4
play('conquista'); // fanfarra C5→E5→G5→C6 + acorde
play('clique');    // impulso 900Hz, 20ms
setMuted(true);    // silencia todos os sons
```

## Detalhes de implementação

`AudioContext` criado lazily na primeira chamada a `play()` — obrigatório, browsers bloqueiam criação antes de interação do usuário. Se `_ctx.state === 'suspended'` (Chrome após inatividade), chama `resume()` antes de enfileirar notas.

Cada som usa osciladores com envelope linear (`linearRampToValueAtTime` no ataque + `exponentialRampToValueAtTime` no decaimento). Osciladores são descartados após `stop()` — sem acumulação de recursos.

## Integração com a11y

`a11y.applyAll()` chama `setMuted(!prefs.somAtivado)` a cada mudança de prefs, sincronizando o estado de mute com o toggle de som na página de Acessibilidade.

## Onde é chamado

`ui/atividade.js` — `onAcerto` → `play('acerto')`, `onErro` → `play('erro')`, `onConcluida` → `play('conquista')`.  
`ui/navegador.js` — mudança de `sel-ano` e `sel-comp` → `play('clique')`.
