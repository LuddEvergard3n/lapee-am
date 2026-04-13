# app.js

Ponto de entrada da aplicação. Coordena inicialização, rotas e a ligação entre store e UI.

## Sequência de inicialização

```
main()
  1. store.init()                    carrega localStorage
  2. a11y.applyAll()                 aplica classes de acessibilidade no <html> e mute/unmute de som
  3. a11y.registerKeyboardShortcuts()
  4. data.loadAll()                  fetch eager de todos os 30 JSONs (await)
     └─ erro → exibe mensagem de "abra com servidor HTTP" e encerra
  5. ui.init()                       monta sidebar e menu toggle
  6. store.subscribe(cb)             cb compara navKey antes de chamar renderPage
  7. router.on(...)                  registra 7 handlers de rota
  8. router.start()                  resolve rota inicial pelo hash atual
```

## Rotas registradas

| Hash | `state.pagina` |
|---|---|
| `/home` | `'home'` |
| `/navegador` | `'navegador'` |
| `/atividade/:id` | `'atividade'` |
| `/sobre` | `'sobre'` |
| `/acessibilidade` | `'acessibilidade'` |
| `/planos` | `'planos'` |
| `/guia` | `'guia'` |

## navKey

Mecanismo de deduplicação de renders. O subscriber só chama `renderPage` quando a chave de navegação muda:

```js
const navKey = `${pagina}|${atividade_id}|${ano}|${componente}|${unidade_id}`;
```

Mudanças de `prefs` (acessibilidade) não disparam re-render — `a11y.applyAll()` aplica classes no `<html>` diretamente, sem destruir o motor de atividade em andamento.

## Dependências

`store`, `dataLoader/index`, `router`, `ui/index`, `a11y` — importadas como namespace.
`a11y` também exposto em `window._a11y` para acesso em `ui/paginas.js` sem dependência circular.
