# app.js

Ponto de entrada da aplicacao. Coordena inicializacao, rotas e a ligacao entre store e UI.

## Sequencia de inicializacao

```
main()
  1. store.init()                    carrega localStorage
  2. a11y.applyAll()                 aplica classes de acessibilidade no <html>
  3. a11y.registerKeyboardShortcuts()
  4. data.loadAll()                  fetch eager de todos os JSONs (await)
     └─ erro -> exibe mensagem "abra com servidor HTTP" e encerra
  5. ui.init()                       monta sidebar e menu toggle
  6. store.subscribe(cb)             cb compara navKey antes de chamar renderPage
  7. router.on(...)                  registra 8 handlers de rota
  8. router.start()                  resolve rota inicial pelo hash atual
```

## Rotas registradas

| Hash | state.pagina |
|---|---|
| `/home` | `'home'` |
| `/navegador` | `'navegador'` |
| `/atividade/:id` | `'atividade'` |
| `/sobre` | `'sobre'` |
| `/acessibilidade` | `'acessibilidade'` |
| `/planos` | `'planos'` |
| `/guia` | `'guia'` |
| `/gerador` | `'gerador'` |

## navKey

Mecanismo de deduplicacao de renders:
```js
const navKey = `${pagina}|${atividade_id}|${ano}|${componente}|${unidade_id}`;
```

Mudancas de `prefs` nao disparam re-render — `a11y.applyAll()` aplica classes no `<html>` diretamente.

## Exposicao global

`window._a11y = a11y` — permite acesso em `ui/paginas.js` sem dependencia circular.
