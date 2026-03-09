# router.js — Documentação Técnica

**Localização:** `js/router.js`

## Responsabilidade

Roteamento client-side baseado em hash (`window.location.hash`) sem dependências externas.
Permite navegação entre páginas sem recarregar o documento HTML.

## Por que hash routing?

- Funciona sem servidor (sem reescrita de URL).
- Compatível com GitHub Pages e abertura via `python3 -m http.server`.
- Não requer configuração de servidor.
- O `#` nunca é enviado ao servidor, então não há requisições 404.

## Formato dos hashes suportados

| Hash | Página |
|---|---|
| `#/home` | Página inicial |
| `#/navegador` | Navegador de conteúdo |
| `#/atividade/lp-001-n1` | Tela de atividade com id `lp-001-n1` |
| `#/sobre` | Sobre o produto |
| `#/acessibilidade` | Controles de acessibilidade |

## API pública

### `on(path, handler)`
Registra um handler para um padrão de rota.
`path` pode conter segmentos dinâmicos prefixados com `:` (ex.: `/atividade/:id`).

```javascript
router.on('/atividade/:id', ({ id }) => {
  // id === 'lp-001-n1'
});
```

### `start()`
Registra o ouvinte de `hashchange` e resolve a rota atual imediatamente.
Deve ser chamado após todos os handlers terem sido registrados.

### `navigate(path)`
Navega para um caminho programaticamente, alterando `window.location.hash`.

## Algoritmo de casamento de rota

```
_match(pattern, path):
  divide pattern e path em segmentos por '/'
  se comprimentos divergem → null
  para cada segmento do pattern:
    se começa com ':' → extrai como parâmetro nomeado
    se diferente do segmento correspondente em path → null
  retorna objeto com parâmetros extraídos
```

## Comportamento com hash vazio

Se o hash estiver vazio ou ausente, o router redireciona para `#/home`.

## Integração com store

`_resolve()` chama `setState({ pagina })` antes de despachar o handler da rota.
Isso garante que o store sempre reflete a página atual, mesmo que o handler falhe.
