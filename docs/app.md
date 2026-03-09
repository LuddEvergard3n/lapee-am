# app.js

Ponto de entrada da aplicação. Coordena inicialização, rotas e a ligação entre store e UI.

## Sequência de inicialização

```
main()
  1. store.init()                    carrega localStorage
  2. a11y.applyAll()                 aplica classes de acessibilidade no <html>
  3. a11y.registerKeyboardShortcuts()
  4. data.loadAll()                  fetch eager de todos os 30 JSONs (await)
     └─ erro → exibe mensagem de "abra com servidor HTTP" e encerra
  5. ui.init()                       monta sidebar e menu toggle
  6. store.subscribe(cb)             cb compara navKey antes de chamar renderPage
  7. router.on('/home', ...)         registra 5 handlers de rota
     router.on('/navegador', ...)
     router.on('/atividade/:id', ...)
     router.on('/sobre', ...)
     router.on('/acessibilidade', ...)
  8. router.start()                  resolve rota inicial pelo hash atual
```

## navKey

Mecanismo de deduplicação de renders. O subscriber só chama `renderPage` quando a chave de navegação muda:

```js
const navKey = `${pagina}|${atividade_id}|${ano}|${componente}|${unidade_id}`;
```

**Por que não incluir `prefs`:** mudanças de acessibilidade (fonte grande, alto contraste, tema escuro) são aplicadas por `a11y.applyAll()` diretamente no `<html>`, sem re-render. Re-renderizar ao mudar prefs destruiria o motor de atividade em andamento.

## Rota `/atividade/:id`

Quando o ID de atividade não existe no cache (atividade removida ou link inválido), `setState` é chamado com `pagina: 'atividade'` e `atividade_id: id`. A tela de atividade exibe "Atividade não encontrada."

## Dependências

`store`, `dataLoader/index`, `router`, `ui/index`, `a11y` — todas importadas como namespace.  
`a11y` também é exposto em `window._a11y` para acesso em `ui/paginas.js` sem criar dependência circular.
