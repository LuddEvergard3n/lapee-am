# Pendencias e Roadmap

Documento de estado atual e proximos passos para a proxima sessao.

Ultima atualizacao: v1.17.1

---

## Implementado e funcionando

### Plataforma
- SPA estatica, ES Modules, zero bundler, zero framework
- Hash routing, 9 rotas
- Store pub/sub com localStorage
- Acessibilidade: tema escuro, alto contraste, fonte grande, TTS, atalhos de teclado
- Mascote Lua, trilha de estrelas, emblemas de conquista
- Exportacao DOCX (assets/js/docx.umd.js — bundle UMD incluido no repositorio)

### Paginas
- `/home` — inicio com cards de materia e emblemas
- `/navegador` — seletor de ano/materia + trilha de estrelas
- `/atividade/:id` — motor de atividade + painel do professor
- `/guia` — Guia do Professor com sidebar sticky
- `/jogos` — Jogos de Palavras: caca-palavras e cruzadas procedurais sorteados do banco
- `/planos` — gerador de planos de aula client-side (445 habilidades BNCC reais)
- `/gerador` — gerador de folhas de atividades para impressao (sorteia do cache)
- `/sobre`, `/acessibilidade`

### Motores de atividade
- `marcar` — escolha unica, multipla, pares
- `ordenar` — drag + botoes cima/baixo
- `arrastar` — pares, categorias, blocos
- `escrever` — campos livres + gravacao oral (MediaRecorder)
- `desenhar` — canvas Paint (24 cores, 6 pinceis, undo, PNG)
- `caca_palavras` — grid interativo, clique primeira+ultima letra (wordfind.js)
- `cruzadas` — inputs por celula, verificacao, pistas clicaveis (crossword.js)

### Dados
- 183 atividades em 30 arquivos JSON (extras-3.json removido em v1.17.1)
- `data/banco-palavras.json` — 462 palavras curadas, 30 pares (6 componentes x 5 anos)
- 1o e 2o ano: gerados com cuidado (qualidade alta)
- 3o ano: recebidos via ZIP do usuario, validados (qualidade alta)
- 4o e 5o ano: gerados automaticamente (qualidade aceitavel, nao revisados)
- IDs auditados: 180/180 no formato correto (nenhum ID legado)

### Gerador de folhas
- Tipos suportados no _converter(): marcar, ordenar, arrastar, escrever, desenhar,
  caca_palavras, cruzadas (adicionados em v1.17.1)
- caca_palavras na folha: lista de palavras+dicas + area em grade para o aluno resolver
- cruzadas na folha: pistas numeradas + area em grade para o aluno resolver

---

## Pendente — proxima sessao

### Alta prioridade

**1. Revisao e melhoria dos dados do 4o e 5o ano**

Os arquivos auto-gerados tem qualidade razoavel mas alguns problemas:
- Enunciados genericos demais para o nivel
- Alguns ordenar com ordem trivial (ja em sequencia obvia)
- Perguntas orientadoras repetitivas

Recomendacao: gerar novos arquivos seguindo o mesmo padrao do 1o e 2o ano
(ver sessao atual como referencia de qualidade). Usar instrucao-geracao-atividades.md.

### Media prioridade

**2. Diagonal no caca-palavras para 4o e 5o ano**

O motor tem suporte a diagonal (`diagonais: true`) mas esta desabilitado para EF I.
Para alunos do 4o e 5o ano pode fazer sentido habilitar. Requer:
- Campo opcional `diagonais: true` no conteudo_base do JSON
- Motor cacapalavras.js ler esse campo e repassar para wf.gerar()
- Jogos.js: para 4o e 5o ano passar `diagonais: true` ao montar a atividade sintetica

**3. Sincronia de progresso**

Atualmente o progresso fica apenas no localStorage do dispositivo. Em laboratorios de
informatica com usuarios compartilhados, o progresso de uma turma fica misturado.
Uma solucao simples: botao de exportar/importar progresso como JSON na pagina de Acessibilidade.

---

## Instrucoes para gerar mais conteudo

Ver `docs/instrucao-geracao-atividades.md` — documento completo para passar a
outra LLM gerar JSONs de atividades. Inclui schema, exemplos completos de cada
tipo e checklist de validacao.

Para gerar atividades de qualidade alta (padrao do 1o e 2o ano):
- Enunciados curtos, linguagem infantil, imperativo direto
- N3 de escrever: campos de 80-150 chars maximos (nao pedir redacoes)
- N1: conceito direto, distratores claramente distintos
- N2: exige reflexao ou relacao entre conceitos
- Dicas: orientam sem entregar a resposta
- Perguntas orientadoras: especificas para o conteudo, nao genericas
