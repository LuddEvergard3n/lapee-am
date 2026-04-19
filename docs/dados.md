# Dados — Atividades JSON

Documentacao do acervo de atividades e convencoes de formato.

## Estado atual do acervo (v1.17.0)

Total: **183 atividades** em 31 arquivos JSON.

| Ano | LP | Mat | Cie | His | Geo | Arte | Extras |
|-----|----|----|-----|-----|-----|------|--------|
| 1º | OK | OK | OK | OK | OK | OK | — |
| 2º | OK | OK | OK | OK | OK | OK | — |
| 3º | OK | OK | OK | OK | OK | OK | extras-3.json |
| 4º | auto | auto | auto | auto | auto | auto | — |
| 5º | auto | auto | auto | auto | auto | auto | — |

**OK** = gerado com cuidado nesta sessao, validado 0 erros.
**auto** = gerado automaticamente em versao anterior, qualidade aceitavel mas nao revisado.

## Nomenclatura de arquivos

```
data/atividades-{slug}-{ano}.json
data/atividades-extras-{ano}.json   <- atividades de tipos especiais (caca_palavras, cruzadas)
```

| Componente | Slug |
|---|---|
| LP | `lp` |
| Matematica | `matematica` |
| Ciencias | `ciencias` |
| Historia | `historia` |
| Geografia | `geografia` |
| Arte | `arte` |

## Estrutura de um arquivo

Array de exatamente **6 objetos** por arquivo padrao (2 unidades x 3 niveis).
Arquivos `extras` podem ter qualquer quantidade.

Ordem canonica: `u1-n1, u1-n2, u1-n3, u2-n1, u2-n2, u2-n3`.

## Convencao de IDs

```
{prefix}-{ano}-u{unidade}-n{nivel}

Exemplos: lp-3-u1-n1, mat-4-u2-n3, art-1-u2-n3
```

| Componente | Prefixo |
|---|---|
| LP | `lp` |
| Matematica | `mat` |
| Ciencias | `cie` |
| Historia | `his` |
| Geografia | `geo` |
| Arte | `art` |

IDs de arquivos extras seguem o padrao livre: `lp-3-u1-caca`, `cie-3-u1-cruzadas`.

## Regra de tipos por nivel

| Nivel | Tipo obrigatorio |
|---|---|
| N1 | sempre `marcar` |
| N2 | `ordenar`, `arrastar`, ou `marcar` (pares/multipla) |
| N3 | sempre `escrever` — **exceto Arte U2 N3 = `desenhar`** |

Tipos especiais (`caca_palavras`, `cruzadas`) so aparecem em arquivos `extras`.

## Schema do objeto de atividade

Todos os campos sao obrigatorios exceto onde indicado.

```json
{
  "id": "lp-3-u1-n1",
  "ano": 3,
  "componente": "LP",
  "unidade_id": "lp-3-u1",
  "unidade_titulo": "string",
  "habilidade_bncc_codigo": "EF03LP01",
  "referencia_cbtc": "CBTC-SC: ...",
  "objetivo": "string — uma frase",
  "nivel": 1,
  "tipo_evidencia": "marcar",
  "tempo_medio_min": 5,
  "enunciado": "string — linguagem infantil",
  "conteudo_base": { ... },
  "criterios_sucesso": ["string"],
  "adaptacoes_dua": {
    "apresentacao": "string",
    "resposta": "string",
    "engajamento": "string — dica que NAO entrega a resposta"
  },
  "modo_professor": {
    "gabarito": "string",
    "objetivo_pedagogico": "string",
    "perguntas_orientadoras": ["string", "string"],
    "tempo_estimado": "string",
    "adaptacao_nivel": "string"
  }
}
```

**`componente`** deve ser exatamente: `"LP"`, `"Matematica"`, `"Ciencias"`, `"Historia"`, `"Geografia"`, `"Arte"`.

**`nivel`** e **`ano`**: inteiros, NUNCA strings.

## Formatos de conteudo_base por tipo

### marcar — escolha unica
```json
{ "opcoes": ["A","B","C","D"], "resposta_correta": 0 }
```
`resposta_correta`: indice **inteiro base zero**.

### marcar — multipla escolha
```json
{ "opcoes": [...], "respostas_corretas": [0, 2] }
```
Indices inteiros base zero. Enunciado deve mencionar quantas marcar.

### marcar — pares
```json
{ "pares": [{ "descricao": "...", "opcoes": ["A","B","C"], "correta": 0 }] }
```
`correta`: indice inteiro base zero dentro de `opcoes`.
**Pares de marcar TEM campo `correta`. Pares de arrastar NAO TEM.**

### ordenar
```json
{ "itens": ["A","B","C","D"], "ordem_correta": [1,3,0,2] }
```
`ordem_correta` deve ser permutacao exata de `[0..n-1]`.

### arrastar — pares
```json
{ "pares": [{ "elemento": "Gato", "nome": "Felino" }] }
```
SEM campo `correta`.

### arrastar — categorias
```json
{
  "itens": [{ "id": "i1", "label": "Texto", "categoria": "Cat A" }],
  "categorias": ["Cat A", "Cat B"]
}
```
`categoria` de cada item DEVE existir em `categorias`.

### arrastar — blocos
```json
{
  "blocos": [{ "id":"b1", "label":"...", "posicao":"centenas" }],
  "colunas": ["centenas","dezenas","unidades"]
}
```
`posicao` pode ser `"distrator"` — aparece mas nao tem coluna certa.

### escrever
```json
{
  "campos": [{ "id": "c1", "label": "Escreva:", "max": 150 }]
}
```
Campos opcionais: `"texto"` (contextualizacao) e `"palavras_obrigatorias"`.

### desenhar
```json
{ "prompt_desenho": "Desenhe...", "tema": "expressao livre" }
```
Apenas para Arte U2 N3.

### caca_palavras
```json
{
  "palavras": ["GATO", "BOLA"],
  "dicas": ["Animal que faz miau", "Objeto redondo"]
}
```
Palavras em MAIUSCULAS. Dicas em indice paralelo a palavras.

### cruzadas
```json
{
  "entradas": [
    { "palavra": "VAPOR", "dica": "Estado gasoso da agua" }
  ]
}
```

## Erros que quebram o motor

| Erro | Efeito |
|---|---|
| `resposta_correta` como string | Comparacao falha — nunca acerta |
| `ordem_correta` nao e permutacao valida | Validacao falha silenciosamente |
| `categoria` de item inexistente em `categorias` | Item sem destino — atividade trava |
| `pares` de arrastar com campo `correta` | Conflito com motor de marcar-pares |
| `componente` com valor errado | Filtros de ano/componente nao encontram atividade |
| `nivel` ou `ano` como string | Filtros falham (comparacao estrita) |
| ID duplicado em qualquer arquivo | Progresso do aluno conflita |

## Validacao

Script de auditoria disponivel em `docs/instrucao-geracao-atividades.md` (checklist completo).

Para validar todos os arquivos programaticamente:
```python
python3 -c "
import json, glob
erros = []
for path in sorted(glob.glob('data/atividades-*.json')):
    for a in json.load(open(path)):
        if not isinstance(a.get('ano'), int): erros.append(f\"{a['id']}: ano nao-int\")
        if not isinstance(a.get('nivel'), int): erros.append(f\"{a['id']}: nivel nao-int\")
        cb = a.get('conteudo_base', {})
        if a['tipo_evidencia'] == 'ordenar':
            itens = cb.get('itens', [])
            ordem = cb.get('ordem_correta', [])
            if sorted(ordem) != list(range(len(itens))):
                erros.append(f\"{a['id']}: ordem_correta invalida\")
print(f'{len(erros)} erros')
for e in erros: print(f'  {e}')
"
```
