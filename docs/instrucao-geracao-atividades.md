# Instrução para Geração de Atividades — LAPEE AM

Este documento instrui um modelo de linguagem a gerar arquivos JSON de atividades para a plataforma LAPEE AM. Leia tudo antes de produzir qualquer saída.

---

## 1. O que é a plataforma

LAPEE AM é uma plataforma web de atividades pedagógicas para o Ensino Fundamental I (1º ao 5º ano), cobrindo 6 componentes: **LP** (Língua Portuguesa), **Matemática**, **Ciências**, **História**, **Geografia** e **Arte**. Todas as atividades seguem a BNCC 2018.

---

## 2. Estrutura de arquivos

Cada arquivo corresponde a um par **componente + ano**. Nome do arquivo:

```
atividades-{slug}-{ano}.json
```

| Componente | Slug |
|---|---|
| LP | `lp` |
| Matemática | `matematica` |
| Ciências | `ciencias` |
| História | `historia` |
| Geografia | `geografia` |
| Arte | `arte` |

Exemplos: `atividades-lp-3.json`, `atividades-matematica-5.json`

Cada arquivo é um **array JSON** de exatamente **6 objetos** de atividade (2 unidades × 3 níveis).

---

## 3. Estrutura de unidades

Cada arquivo tem **2 unidades temáticas**. Cada unidade tem **3 atividades** (N1, N2, N3):

```
Arquivo: atividades-lp-3.json
  Unidade 1 (lp-3-u1) — "Ideia Principal e Evidências"
    N1 — marcar      → id: lp-3-u1-n1
    N2 — ordenar     → id: lp-3-u1-n2
    N3 — escrever    → id: lp-3-u1-n3
  Unidade 2 (lp-3-u2) — "Produção de Texto"
    N1 — marcar      → id: lp-3-u2-n1
    N2 — arrastar    → id: lp-3-u2-n2
    N3 — escrever    → id: lp-3-u2-n3
```

**Regra de tipos por nível:**
- **N1**: sempre `marcar` (escolha simples ou múltipla)
- **N2**: `ordenar`, `arrastar`, ou `marcar` (com pares ou múltipla)
- **N3**: sempre `escrever` — **exceto** no N3 da Unidade 2 de Arte, que é sempre `desenhar`

---

## 4. Convenção de IDs

```
{slug}-{ano}-u{unidade}-n{nivel}

Exemplos:
  lp-3-u1-n1
  matematica → mat-3-u2-n3
  ciencias   → cie-4-u1-n2
  historia   → his-2-u2-n1
  geografia  → geo-5-u1-n3
  arte       → art-1-u2-n3
```

| Componente | Prefixo de ID |
|---|---|
| LP | `lp` |
| Matemática | `mat` |
| Ciências | `cie` |
| História | `his` |
| Geografia | `geo` |
| Arte | `art` |

O `unidade_id` segue o mesmo padrão sem o nível: `lp-3-u1`, `mat-4-u2`, etc.

---

## 5. Schema completo de um objeto de atividade

Todos os campos são **obrigatórios** exceto onde indicado.

```json
{
  "id": "string — ver convenção acima",
  "ano": 1,
  "componente": "LP",
  "unidade_id": "lp-1-u1",
  "unidade_titulo": "string — título pedagógico da unidade",
  "habilidade_bncc_codigo": "EF01LP01",
  "referencia_cbtc": "CBTC-SC: LP.EF1.L.01 — Descrição resumida",
  "objetivo": "string — uma frase: o que o aluno vai aprender",
  "nivel": 1,
  "tipo_evidencia": "marcar",
  "tempo_medio_min": 5,
  "enunciado": "string — instrução direta para o aluno, linguagem infantil",
  "conteudo_base": { ... },
  "criterios_sucesso": ["string", "string"],
  "adaptacoes_dua": {
    "apresentacao": "string — como o conteúdo é apresentado",
    "resposta": "string — como o aluno responde",
    "engajamento": "string — texto da dica que aparece ao aluno (NÃO entrega a resposta)"
  },
  "modo_professor": {
    "gabarito": "string — resposta correta por extenso",
    "objetivo_pedagogico": "string — para que serve esta atividade",
    "perguntas_orientadoras": ["Pergunta 1?", "Pergunta 2?", "Pergunta 3?"],
    "tempo_estimado": "5 a 7 minutos",
    "adaptacao_nivel": "string — o que muda neste nível"
  }
}
```

**Campos `componente`:** use exatamente: `"LP"`, `"Matemática"`, `"Ciências"`, `"História"`, `"Geografia"`, `"Arte"`.

**Nível:** inteiro `1`, `2` ou `3`. Nunca string.

**`tempo_medio_min`:** inteiro, tipicamente 4–10.

---

## 6. Tipos de atividade e formato do `conteudo_base`

### 6A. `marcar` — Escolha única

```json
"conteudo_base": {
  "opcoes": ["Opção A", "Opção B", "Opção C", "Opção D"],
  "resposta_correta": 1
}
```

- `resposta_correta`: índice **base zero** (número inteiro). 1 = segunda opção.
- Mínimo 3, máximo 5 opções.
- Apenas **uma** resposta correta.

**Pode incluir `"texto"` ou `"contexto"` opcionais** antes das opções:

```json
"conteudo_base": {
  "texto": "Leia o trecho abaixo:",
  "opcoes": ["..."],
  "resposta_correta": 0
}
```

---

### 6B. `marcar` — Múltipla escolha

```json
"conteudo_base": {
  "opcoes": ["Vermelho", "Verde", "Azul", "Amarelo", "Laranja", "Roxo"],
  "respostas_corretas": [0, 2, 3]
}
```

- `respostas_corretas`: array de índices base zero. Mínimo 2 respostas corretas.
- O enunciado **deve mencionar quantas** respostas marcar.

---

### 6C. `marcar` — Pares (associação)

```json
"conteudo_base": {
  "pares": [
    {
      "descricao": "O traço que define o contorno de um desenho",
      "opcoes": ["Linha", "Forma", "Cor"],
      "correta": 0
    },
    {
      "descricao": "O azul do céu numa pintura",
      "opcoes": ["Linha", "Forma", "Cor"],
      "correta": 2
    }
  ]
}
```

- Cada par tem `"descricao"` **ou** `"situacao"` (ambos funcionam).
- `correta`: índice base zero dentro de `opcoes`.
- Use o mesmo conjunto de opções para todos os pares (facilita o entendimento).
- Mínimo 2 pares, máximo 5.

---

### 6D. `ordenar` — Sequência

```json
"conteudo_base": {
  "itens": [
    "Primeiro passo",
    "Segundo passo",
    "Terceiro passo",
    "Quarto passo"
  ],
  "ordem_correta": [0, 1, 2, 3]
}
```

- `ordem_correta`: permutação dos índices base zero na ordem correta.
- Exemplo com ordem não-trivial: itens = ["C", "A", "B", "D"], ordem_correta = [1, 2, 0, 3] significa A→B→C→D.
- Mínimo 3 itens, máximo 6.
- A plataforma **embaralha** os itens antes de exibir. Não crie ordens já em sequência lógica óbvia.

---

### 6E. `arrastar` — Pares (chip para destino)

```json
"conteudo_base": {
  "pares": [
    { "elemento": "Vermelho + Azul", "nome": "Roxo" },
    { "elemento": "Vermelho + Amarelo", "nome": "Laranja" },
    { "elemento": "Azul + Amarelo", "nome": "Verde" }
  ]
}
```

- Cada chip (`elemento`) deve ir para exatamente um destino (`nome`).
- Mínimo 3 pares, máximo 5.
- Destinos são embaralhados antes de exibir.

---

### 6F. `arrastar` — Categorias

```json
"conteudo_base": {
  "itens": [
    { "id": "i1", "label": "O horizonte numa paisagem", "categoria": "Linha Reta" },
    { "id": "i2", "label": "O arco de um arco-íris", "categoria": "Linha Curva" },
    { "id": "i3", "label": "Uma janela quadrada", "categoria": "Forma Geométrica" },
    { "id": "i4", "label": "O contorno de uma folha", "categoria": "Forma Orgânica" },
    { "id": "i5", "label": "Uma estrada reta", "categoria": "Linha Reta" },
    { "id": "i6", "label": "Uma pedra arredondada", "categoria": "Forma Orgânica" }
  ],
  "categorias": ["Linha Reta", "Linha Curva", "Forma Geométrica", "Forma Orgânica"]
}
```

- IDs: `"i1"`, `"i2"`, etc.
- `categoria` de cada item **deve existir** em `categorias`.
- Mínimo 2 categorias, máximo 4. Mínimo 4 itens.
- Distribua os itens entre as categorias (nunca coloque todos na mesma).

---

### 6G. `arrastar` — Blocos numéricos (com distratores)

```json
"conteudo_base": {
  "blocos": [
    { "id": "b1", "valor": 200, "label": "2 blocos de 100", "posicao": "centenas" },
    { "id": "b2", "valor": 50,  "label": "5 blocos de 10",  "posicao": "dezenas" },
    { "id": "b3", "valor": 3,   "label": "3 blocos de 1",   "posicao": "unidades" },
    { "id": "b4", "valor": 20,  "label": "2 blocos de 10",  "posicao": "distrator" }
  ],
  "colunas": ["centenas", "dezenas", "unidades"]
}
```

- Blocos com `"posicao": "distrator"` aparecem nas fontes mas não têm coluna certa — o aluno não deve colocá-los em lugar nenhum.
- `colunas`: os destinos válidos.
- Use principalmente em Matemática (sistema decimal).

---

### 6H. `escrever` — Texto livre

```json
"conteudo_base": {
  "campos": [
    { "id": "campo1", "label": "O que você observou?", "max": 150 },
    { "id": "campo2", "label": "Por que isso acontece?", "max": 200 }
  ]
}
```

- Mínimo 1, máximo 5 campos.
- `max`: número máximo de caracteres. Use 100–300.
- `id`: string simples sem espaços.
- Campos opcionais: `"texto"` (contextualização antes dos campos) e `"palavras_obrigatorias"` (array de strings que o aluno deve usar).

```json
"conteudo_base": {
  "texto": "Leia o trecho abaixo antes de responder: ...",
  "palavras_obrigatorias": ["ciclo", "evaporação"],
  "campos": [
    { "id": "resposta", "label": "Explique o ciclo da água:", "max": 250 }
  ]
}
```

---

### 6I. `desenhar` — Canvas livre

**Usar apenas no N3 da Unidade 2 de Arte.**

```json
"conteudo_base": {
  "prompt_desenho": "Desenhe o que a música faz você sentir ou imaginar.",
  "tema": "música e sentimentos"
}
```

- `prompt_desenho`: instrução curta para o aluno.
- `tema`: uma expressão de 2–4 palavras.

---

## 7. Regras de qualidade

### Linguagem
- O **enunciado** deve ser escrito para a criança: vocabulário simples, frases curtas, imperativo direto ("Leia...", "Marca...", "Coloca...").
- O **gabarito** e **perguntas_orientadoras** são para o professor: podem ser mais técnicos.
- A **dica** (`adaptacoes_dua.engajamento`) orienta sem revelar a resposta. Nunca diga "a resposta é X".

### Níveis de dificuldade
| Nível | Características |
|---|---|
| N1 | Reconhecimento direto. Enunciado curto. Opções claramente distintas. Vocabulário introdutório. |
| N2 | Exige alguma reflexão ou relação entre conceitos. Distratores plausíveis. |
| N3 | Análise, produção, justificativa ou síntese. Resposta aberta, criativa ou argumentativa. |

### Índices de resposta
- **Sempre números inteiros, base zero.**
- `resposta_correta: 0` = primeira opção, `resposta_correta: 1` = segunda, etc.
- **Nunca use strings como resposta.** ❌ `"resposta_correta": "Linha"` — isso quebra o motor.

### IDs
- Únicos dentro de um arquivo e entre todos os arquivos.
- Seguir rigorosamente a convenção da seção 4.
- IDs de itens dentro de `conteudo_base` (ex: `"i1"`, `"b1"`) devem ser simples e sem espaços.

### Habilidades BNCC
- Use apenas códigos reais. Para EF I: `EF01LP01`, `EF03MA05`, `EF15AR02`, etc.
- Arte usa habilidades de faixa `EF15AR__` (válidas para 1º ao 5º ano).
- Se não souber o código exato, use o mais próximo razoável — prefira acertar a omitir.

---

## 8. O que entregar

Para **um arquivo** (ex.: `atividades-lp-3.json`):
- Um array JSON com **exatamente 6 objetos**.
- Objetos na ordem: u1-n1, u1-n2, u1-n3, u2-n1, u2-n2, u2-n3.
- JSON válido, sem comentários, sem texto antes ou depois.

Para **múltiplos arquivos**:
- Um arquivo por componente/ano.
- Nomes exatos conforme seção 2.
- Entregue em ZIP.

---

## 9. Exemplos completos por tipo

### Exemplo: `marcar` escolha única (N1, LP, 3º ano)

```json
{
  "id": "lp-3-u1-n1",
  "ano": 3,
  "componente": "LP",
  "unidade_id": "lp-3-u1",
  "unidade_titulo": "Ideia Principal e Evidências",
  "habilidade_bncc_codigo": "EF35LP06",
  "referencia_cbtc": "CBTC-SC: LP.EF3.L.02 — Localização de informações explícitas em textos",
  "objetivo": "Identificar a ideia principal de um parágrafo curto.",
  "nivel": 1,
  "tipo_evidencia": "marcar",
  "tempo_medio_min": 5,
  "enunciado": "Leia o parágrafo e marque a frase que melhor diz o assunto principal.",
  "conteudo_base": {
    "texto": "As abelhas vivem em colmeias. Cada abelha tem uma função: a rainha põe ovos, as operárias coletam néctar e as zangões ajudam na reprodução. Juntas, elas produzem o mel.",
    "opcoes": [
      "As abelhas produzem mel usando flores.",
      "Cada abelha tem uma função dentro da colmeia.",
      "A rainha é a mais importante da colmeia.",
      "As operárias trabalham mais do que as outras."
    ],
    "resposta_correta": 1
  },
  "criterios_sucesso": [
    "Identifica a frase que resume o tema do parágrafo inteiro.",
    "Distingue ideia principal de detalhe."
  ],
  "adaptacoes_dua": {
    "apresentacao": "Texto curto; professor pode ler em voz alta. Botão Ouvir disponível.",
    "resposta": "Clique na opção correta e depois em Pronto!.",
    "engajamento": "Dica: a ideia principal fala sobre o parágrafo todo, não só uma parte dele. Qual frase faz isso?"
  },
  "modo_professor": {
    "gabarito": "Opção B: 'Cada abelha tem uma função dentro da colmeia.'",
    "objetivo_pedagogico": "Desenvolver a habilidade de localizar e formular a ideia principal de um texto informativo.",
    "perguntas_orientadoras": [
      "O parágrafo fala só sobre mel ou sobre como as abelhas se organizam?",
      "A frase A é um detalhe ou um resumo?",
      "Qual frase poderia ser o título desse parágrafo?"
    ],
    "tempo_estimado": "4 a 6 minutos",
    "adaptacao_nivel": "Nível 1 (Apoio): parágrafo curto, distratores baseados em detalhes explícitos do texto."
  }
}
```

---

### Exemplo: `ordenar` (N2, Ciências, 2º ano)

```json
{
  "id": "cie-2-u2-n2",
  "ano": 2,
  "componente": "Ciências",
  "unidade_id": "cie-2-u2",
  "unidade_titulo": "Água e Saúde",
  "habilidade_bncc_codigo": "EF02CI04",
  "referencia_cbtc": "CBTC-SC: CIE.EF2.V.01 — Ciclo da água e estados físicos",
  "objetivo": "Ordenar as etapas do ciclo da água.",
  "nivel": 2,
  "tipo_evidencia": "ordenar",
  "tempo_medio_min": 7,
  "enunciado": "Coloca as etapas do ciclo da água na ordem certa, do começo ao fim.",
  "conteudo_base": {
    "itens": [
      "A chuva cai e a água chega ao solo e aos rios",
      "O sol aquece a água dos rios e do mar",
      "O vapor d'água sobe e forma nuvens",
      "A água evapora e vira vapor"
    ],
    "ordem_correta": [1, 3, 2, 0]
  },
  "criterios_sucesso": [
    "Coloca as etapas na sequência correta: aquecimento → evaporação → condensação → precipitação.",
    "Compreende o ciclo como um processo contínuo."
  ],
  "adaptacoes_dua": {
    "apresentacao": "Professor pode desenhar o ciclo no quadro antes da atividade.",
    "resposta": "Arrasta os itens ou usa os botões cima/baixo para ordenar.",
    "engajamento": "Dica: pensa no que acontece primeiro com a água do rio quando o sol bate forte nela."
  },
  "modo_professor": {
    "gabarito": "Sol aquece → água evapora → vapor forma nuvens → chuva cai.",
    "objetivo_pedagogico": "Construir compreensão do ciclo da água como processo cíclico e contínuo.",
    "perguntas_orientadoras": [
      "De onde vem o vapor que forma as nuvens?",
      "O que precisa acontecer antes de chover?",
      "Depois da chuva, o ciclo para ou recomeça?"
    ],
    "tempo_estimado": "6 a 8 minutos",
    "adaptacao_nivel": "Nível 2: 4 etapas com ordem não óbvia, exige compreensão da sequência causal."
  }
}
```

---

### Exemplo: `escrever` (N3, Matemática, 4º ano)

```json
{
  "id": "mat-4-u1-n3",
  "ano": 4,
  "componente": "Matemática",
  "unidade_id": "mat-4-u1",
  "unidade_titulo": "Multiplicação e Divisão",
  "habilidade_bncc_codigo": "EF04MA07",
  "referencia_cbtc": "CBTC-SC: MAT.EF4.N.03 — Resolução de problemas com as quatro operações",
  "objetivo": "Criar e resolver situações-problema envolvendo multiplicação e divisão.",
  "nivel": 3,
  "tipo_evidencia": "escrever",
  "tempo_medio_min": 10,
  "enunciado": "Uma escola tem 6 turmas. Cada turma tem 28 alunos. Quantos alunos tem a escola no total? Resolve e explica como você pensou.",
  "conteudo_base": {
    "campos": [
      { "id": "operacao", "label": "Qual operação você usou e por quê?", "max": 150 },
      { "id": "conta", "label": "Escreva a conta:", "max": 80 },
      { "id": "resultado", "label": "Resultado:", "max": 50 },
      { "id": "verificacao", "label": "Como você verifica se está certo?", "max": 150 }
    ]
  },
  "criterios_sucesso": [
    "Identifica a multiplicação como operação adequada.",
    "Calcula 6 × 28 = 168 corretamente.",
    "Explica o raciocínio com palavras."
  ],
  "adaptacoes_dua": {
    "apresentacao": "Problema com contexto escolar próximo da realidade do aluno.",
    "resposta": "Resposta em texto livre por campos específicos.",
    "engajamento": "Dica: se cada turma tem 28, e tem 6 turmas, o que você pode fazer para descobrir o total?"
  },
  "modo_professor": {
    "gabarito": "6 × 28 = 168 alunos. A verificação pode ser por divisão: 168 ÷ 6 = 28.",
    "objetivo_pedagogico": "Desenvolver interpretação de problemas e comunicação matemática.",
    "perguntas_orientadoras": [
      "Como você sabe que precisa multiplicar e não somar?",
      "28 + 28 + 28 + 28 + 28 + 28 dá o mesmo resultado? Por quê?",
      "Como você verificaria sua resposta sem refazer a conta?"
    ],
    "tempo_estimado": "8 a 12 minutos",
    "adaptacao_nivel": "Nível 3: exige escolha da operação, cálculo e justificativa escrita."
  }
}
```

---

## 10. Erros que quebram a plataforma

| Erro | Por quê quebra |
|---|---|
| `resposta_correta` como string | O motor compara `selectedIdx === resposta_correta` — com string, nunca é igual ao índice numérico |
| `respostas_corretas` com strings | Mesmo motivo |
| `correta` em pares de marcar como string | Mesmo motivo |
| `ordem_correta` não é permutação válida | O motor verifica `sorted(ordem) === [0,1,...,n-1]` |
| `categoria` de um item que não está em `categorias` | O item não encontra destino — validação falha silenciosamente |
| `id` duplicado no mesmo arquivo | Progresso do aluno conflita |
| Campo `componente` com valor diferente de `"LP"`, `"Matemática"`, `"Ciências"`, `"História"`, `"Geografia"`, `"Arte"` | Navegador não encontra as atividades |
| `nivel` como string `"1"` em vez de inteiro `1` | Filtro de nível falha |
| `ano` como string `"3"` em vez de inteiro `3` | Filtro de ano falha |
| `pares` de `arrastar` com campo `correta` | Pares de arrastar NÃO têm campo `correta` — só pares de `marcar` têm |

---

## 11. Checklist antes de entregar

Para cada atividade gerada, verifique:

- [ ] `id` segue a convenção e é único
- [ ] `ano` e `nivel` são inteiros (não strings)
- [ ] `componente` é exatamente um dos 6 valores válidos
- [ ] `tipo_evidencia` corresponde ao nível e à unidade (ver seção 3)
- [ ] `resposta_correta` / `respostas_corretas` / `correta` são índices inteiros base zero
- [ ] Índices de resposta estão dentro do range do array de opções
- [ ] `ordem_correta` é uma permutação de `[0, 1, ..., n-1]`
- [ ] Categorias referenciadas em itens existem no array `categorias`
- [ ] `conteudo_base` tem os campos corretos para o tipo (não misturar campos de tipos diferentes)
- [ ] `adaptacoes_dua.engajamento` não entrega a resposta
- [ ] `modo_professor.perguntas_orientadoras` é um array com ao menos 2 perguntas
- [ ] JSON é válido (sem vírgulas extras, sem comentários)
