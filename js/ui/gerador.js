/**
 * ui/gerador.js
 * Gerador de Folhas de Atividades — LAPEE AM.
 *
 * Usa o cache de atividades já carregado pelo dataLoader.
 * Zero chamadas externas. Funciona offline.
 *
 * Fluxo:
 *   1. Professor escolhe componente, ano, nível, quantidade
 *   2. Sistema sorteia atividades do cache (sem repetir)
 *   3. Converte cada atividade para formato de questão imprimível
 *   4. Exporta PDF (print) ou DOCX (exportar.js)
 */

import { COMPONENTE_LABEL, esc, $ } from './componentes.js';
import { notificar }                from '../notificacoes.js';
import { exportarDocx, exportarPDF, gerarDocAtividades } from '../exportar.js';
import { getAllAtividades }          from '../dataLoader/index.js';

/* --------------------------------------------------------------------------
   Conversor: atividade JSON → questão de folha normalizada
   -------------------------------------------------------------------------- */

const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F'];

function _converter(atv, num) {
  const cb  = atv.conteudo_base ?? {};
  const gab = atv.modo_professor?.gabarito ?? '';

  switch (atv.tipo_evidencia) {

    case 'marcar': {
      if (cb.pares) {
        return {
          numero: num,
          enunciado: atv.enunciado,
          instrucao: 'Para cada situação, marque a opção correta.',
          alternativas: cb.pares.map((p, i) =>
            `${LETRAS[i]}) ${p.situacao ?? p.descricao ?? ''} — [${p.opcoes.join(' | ')}]`
          ),
          resposta: gab || cb.pares.map((p, i) =>
            `${LETRAS[i]}: ${p.opcoes[p.correta] ?? ''}`
          ).join('  '),
        };
      }
      if ('respostas_corretas' in cb) {
        return {
          numero: num,
          enunciado: atv.enunciado,
          instrucao: `Marque ${cb.respostas_corretas.length} resposta(s).`,
          alternativas: cb.opcoes ?? [],
          resposta: gab || (cb.respostas_corretas ?? []).map(i => cb.opcoes?.[i]).filter(Boolean).join(', '),
        };
      }
      return {
        numero: num,
        enunciado: atv.enunciado,
        instrucao: null,
        alternativas: cb.opcoes ?? [],
        resposta: gab || (cb.opcoes?.[cb.resposta_correta] ?? ''),
      };
    }

    case 'ordenar': {
      const itens = cb.itens ?? [];
      return {
        numero: num,
        enunciado: atv.enunciado,
        instrucao: 'Numere os itens abaixo na ordem correta (1 = primeiro).',
        alternativas: _shuffle([...itens]).map(it => `(   ) ${it}`),
        resposta: gab || (cb.ordem_correta ?? []).map(i => itens[i]).join(' → '),
      };
    }

    case 'arrastar': {
      if (cb.pares && !cb.categorias) {
        /* Na folha: duas colunas — aluno traça uma linha ligando */
        const pares = cb.pares ?? [];
        const destinos = _shuffle(pares.map(p => p.nome));
        return {
          numero: num,
          enunciado: atv.enunciado,
          instrucao: 'Ligue cada item da Coluna A com o item correto da Coluna B, traçando uma linha.',
          tipoPares: true,
          colunaA: pares.map(p => p.elemento),
          colunaB: destinos,
          resposta: gab || pares.map(p => `${p.elemento} → ${p.nome}`).join('  |  '),
        };
      }
      if (cb.categorias) {
        /* Na folha: escrever o nome da categoria ao lado de cada item */
        const cats = (cb.categorias ?? []).join(' / ');
        return {
          numero: num,
          enunciado: atv.enunciado,
          instrucao: `Escreva ao lado de cada item a categoria correta: ${cats}`,
          alternativas: _shuffle([...(cb.itens ?? [])]).map(it => `${it.label}: _______________`),
          resposta: gab || (cb.itens ?? []).map(it => `${it.label} → ${it.categoria}`).join('  |  '),
        };
      }
      /* blocos: escrever a coluna ao lado */
      const cols = (cb.colunas ?? []).join(' / ');
      return {
        numero: num,
        enunciado: atv.enunciado,
        instrucao: `Escreva ao lado de cada item onde ele se encaixa: ${cols}`,
        alternativas: (cb.blocos ?? []).filter(b => b.posicao !== 'distrator')
          .map(b => `${b.label}: _______________`),
        resposta: gab || (cb.blocos ?? []).filter(b => b.posicao !== 'distrator')
          .map(b => `${b.label} → ${b.posicao}`).join('  |  '),
      };
    }

    case 'escrever': {
      return {
        numero: num,
        enunciado: atv.enunciado,
        instrucao: null,
        alternativas: [],
        linhasEscrever: (cb.campos ?? []).map(c => c.label),
        resposta: gab,
      };
    }

    case 'desenhar': {
      return {
        numero: num,
        enunciado: atv.enunciado,
        instrucao: 'Faça seu desenho no espaço abaixo.',
        alternativas: [],
        caixaDesenho: true,
        resposta: gab,
      };
    }

    default:
      return { numero: num, enunciado: atv.enunciado, alternativas: [], resposta: gab };
  }
}

function _shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* --------------------------------------------------------------------------
   Render principal
   -------------------------------------------------------------------------- */

export function renderGerador(main) {
  main.innerHTML = `
    <div class="gerador-wrapper">

      <div class="gerador-form-panel">
        <h1 class="planos-form-titulo">Gerar Folha de Atividades</h1>
        <p class="planos-form-desc">Sorteia atividades do acervo e gera uma folha pronta para imprimir ou exportar.</p>

        <form id="form-gerador" novalidate autocomplete="off">
          <fieldset class="plano-fieldset">
            <legend class="plano-legend">Configuração</legend>

            <div class="plano-grid-3">
              <div class="plano-field">
                <label class="plano-label" for="g-comp">Componente</label>
                <select id="g-comp" class="plano-select" required>
                  <option value="">Escolha</option>
                  ${Object.entries(COMPONENTE_LABEL).map(([k,v]) =>
                    `<option value="${esc(k)}">${esc(v)}</option>`
                  ).join('')}
                </select>
              </div>
              <div class="plano-field">
                <label class="plano-label" for="g-ano">Ano / Série</label>
                <select id="g-ano" class="plano-select" required>
                  <option value="">Escolha</option>
                  <option value="1">1º Ano</option>
                  <option value="2">2º Ano</option>
                  <option value="3">3º Ano</option>
                  <option value="4">4º Ano</option>
                  <option value="5">5º Ano</option>
                </select>
              </div>
              <div class="plano-field">
                <label class="plano-label" for="g-nivel">Dificuldade</label>
                <select id="g-nivel" class="plano-select">
                  <option value="1">N1 — Mais fácil</option>
                  <option value="2" selected>N2 — Normal</option>
                  <option value="3">N3 — Desafio</option>
                  <option value="todos">Todos os níveis</option>
                </select>
              </div>
            </div>

            <div class="plano-grid-3">
              <div class="plano-field">
                <label class="plano-label" for="g-qtd">Quantidade</label>
                <select id="g-qtd" class="plano-select">
                  <option value="5">5 questões</option>
                  <option value="10" selected>10 questões</option>
                  <option value="15">15 questões</option>
                </select>
              </div>
              <div class="plano-field plano-field-wide2">
                <label class="plano-label" for="g-titulo">
                  Título da folha
                  <span class="plano-hint">Opcional — gerado automaticamente se vazio</span>
                </label>
                <input id="g-titulo" class="plano-input" type="text" maxlength="100"
                       placeholder="Ex.: Revisão — Frações" />
              </div>
            </div>

            <div class="plano-grid-3">
              <div class="plano-field plano-field-wide2">
                <label class="plano-label" for="g-escola">Escola (opcional)</label>
                <input id="g-escola" class="plano-input" type="text" />
              </div>
              <div class="plano-field">
                <label class="plano-label" for="g-prof">Professor(a)</label>
                <input id="g-prof" class="plano-input" type="text" />
              </div>
            </div>
          </fieldset>

          <div id="gerador-aviso-vazio" class="gerador-aviso-vazio hidden">
            Nenhuma atividade encontrada para essa seleção. Tente outro nível ou componente.
          </div>

          <div class="planos-form-actions">
            <button type="submit" id="btn-gerar-atv" class="btn btn-primary btn-lg">Gerar folha</button>
          </div>
        </form>
      </div>

      <div class="gerador-preview-panel" id="gerador-preview-panel">
        <div id="gerador-doc" class="gerador-doc">
          <p class="plano-doc-vazio">Escolha componente e ano e clique em "Gerar folha".</p>
        </div>
        <div id="gerador-acoes" class="gerador-acoes hidden">
          <button id="btn-gerar-pdf"  type="button" class="btn btn-secondary">Exportar PDF</button>
          <button id="btn-gerar-docx" type="button" class="btn btn-secondary">Exportar DOCX</button>
          <button id="btn-gerar-novo" type="button" class="btn btn-primary">Sortear novamente</button>
        </div>
      </div>

    </div>
  `;

  let _questoesAtuais = null;
  let _dadosMeta      = null;

  $('form-gerador')?.addEventListener('submit', (e) => { e.preventDefault(); _gerar(); });

  function _gerar() {
    const comp   = $('g-comp')?.value;
    const ano    = parseInt($('g-ano')?.value  || '0');
    const nivel  = $('g-nivel')?.value;
    const qtd    = parseInt($('g-qtd')?.value  || '10');
    const titulo = $('g-titulo')?.value.trim();
    const escola = $('g-escola')?.value.trim();
    const prof   = $('g-prof')?.value.trim();

    if (!comp) { notificar('Escolha o componente curricular.', 'aviso'); $('g-comp')?.focus(); return; }
    if (!ano)  { notificar('Escolha o ano escolar.', 'aviso');           $('g-ano')?.focus(); return; }

    const todas = getAllAtividades().filter(a => {
      if (a.componente !== comp || a.ano !== ano) return false;
      return nivel === 'todos' || a.nivel === parseInt(nivel);
    });

    const semVazio = todas.length === 0;
    $('gerador-aviso-vazio')?.classList.toggle('hidden', !semVazio);
    if (semVazio) { notificar('Sem atividades para essa seleção.', 'aviso'); return; }

    const disponiveis = todas.length;
    const sorteadas = _shuffle([...todas]).slice(0, Math.min(qtd, disponiveis));

    if (disponiveis < qtd) {
      notificar(`Apenas ${disponiveis} atividade${disponiveis > 1 ? 's' : ''} disponível${disponiveis > 1 ? 'is' : ''} para essa seleção. Experimente incluir "Todos os níveis".`, 'aviso', 6000);
    }
    _questoesAtuais = sorteadas.map((atv, i) => _converter(atv, i + 1));

    const compLabel  = COMPONENTE_LABEL[comp] ?? comp;
    const nivelLabel = { '1': 'N1 — Mais fácil', '2': 'N2 — Normal', '3': 'N3 — Desafio', 'todos': 'Todos os Níveis' }[nivel] ?? '';

    _dadosMeta = {
      titulo:     titulo || `${compLabel} — ${ano}º Ano — ${nivelLabel}`,
      compLabel, ano, nivel, nivelLabel, escola, prof, comp,
    };

    _renderPreview(_questoesAtuais, _dadosMeta);
  }

  function _renderPreview(questoes, meta) {
    const doc = $('gerador-doc');
    if (!doc) return;

    const questoesHtml = questoes.map(q => {
      let corpo = '';
      if (q.instrucao) corpo += `<p class="gatv-instrucao-q">${esc(q.instrucao)}</p>`;

      /* Duas colunas para ligar com traço (arrastar-pares impresso) */
      if (q.tipoPares) {
        const rows = Math.max(q.colunaA.length, q.colunaB.length);
        let tabela = '<table class="gatv-pares-table">';
        tabela += '<thead><tr><th>Coluna A</th><th></th><th>Coluna B</th></tr></thead><tbody>';
        for (let i = 0; i < rows; i++) {
          tabela += `<tr>
            <td class="gatv-par-a">${esc(q.colunaA[i] ?? '')}</td>
            <td class="gatv-par-linha"></td>
            <td class="gatv-par-b">${esc(q.colunaB[i] ?? '')}</td>
          </tr>`;
        }
        tabela += '</tbody></table>';
        corpo += tabela;
      } else if (q.alternativas?.length > 0) {
        corpo += q.alternativas.map((alt, i) =>
          `<div class="gatv-alt"><span class="gatv-alt-letra">${LETRAS[i] ?? (i+1)})</span><span>${esc(alt)}</span></div>`
        ).join('');
      }

      if (q.linhasEscrever?.length > 0) {
        corpo += q.linhasEscrever.map(lbl =>
          `<div class="gatv-campo-escrever"><span class="gatv-campo-label">${esc(lbl)}</span><div class="gatv-linha"></div><div class="gatv-linha"></div></div>`
        ).join('');
      } else if (!q.tipoPares && !q.alternativas?.length && !q.caixaDesenho) {
        corpo += `<div class="gatv-linha"></div><div class="gatv-linha"></div><div class="gatv-linha"></div>`;
      }

      if (q.caixaDesenho) corpo += `<div class="gatv-caixa-desenho"></div>`;

      return `<div class="gatv-questao"><p class="gatv-enunciado"><strong>${q.numero}.</strong> ${esc(q.enunciado)}</p>${corpo}</div>`;
    }).join('');

    doc.innerHTML = `
      <div class="gatv-folha" id="gatv-folha-print">
        <header class="gatv-header">
          <div class="gatv-header-top">
            <span class="gatv-logo">LAPEE AM</span>
            <span class="gatv-subtitulo">Folha de Atividades</span>
          </div>
          <div class="gatv-meta-linha">
            <strong>${esc(meta.titulo)}</strong>
            ${meta.escola ? ` | ${esc(meta.escola)}` : ''}
            ${meta.prof   ? ` | Prof.: ${esc(meta.prof)}` : ''}
          </div>
          <div class="gatv-ident">
            <span>Nome: _________________________________</span>
            <span>Data: ___/___/______</span>
          </div>
        </header>
        <div class="gatv-corpo">${questoesHtml}</div>
        <div class="gatv-gabarito">
          <span class="gatv-gabarito-label">Gabarito (professor):</span>
          ${questoes.filter(q => q.resposta).map(q =>
            `<span class="gatv-resp">${q.numero}. ${esc(q.resposta.slice(0,60))}${q.resposta.length > 60 ? '…' : ''}</span>`
          ).join('')}
        </div>
      </div>`;

    $('gerador-acoes')?.classList.remove('hidden');
    doc.scrollIntoView({ behavior: 'smooth', block: 'start' });

    /* Re-registrar listeners — clonar para remover os antigos */
    ['btn-gerar-pdf','btn-gerar-docx','btn-gerar-novo'].forEach(id => {
      const btn = $(id); if (!btn) return;
      const c = btn.cloneNode(true); btn.parentNode.replaceChild(c, btn);
    });

    $('btn-gerar-pdf')?.addEventListener('click', () => exportarPDF());
    $('btn-gerar-docx')?.addEventListener('click', async () => {
      if (!_questoesAtuais || !_dadosMeta) return;
      await exportarDocx(gerarDocAtividades({
        componente: _dadosMeta.compLabel, ano: _dadosMeta.ano,
        nivel: _dadosMeta.nivelLabel, escola: _dadosMeta.escola,
        professor: _dadosMeta.prof, titulo: _dadosMeta.titulo,
        questoes: _questoesAtuais,
      }), `atividades-${_dadosMeta.comp}-${_dadosMeta.ano}ano`);
    });
    $('btn-gerar-novo')?.addEventListener('click', () => _gerar());
  }
}
