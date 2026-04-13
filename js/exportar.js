/**
 * exportar.js
 * Exportação de documentos em DOCX e PDF (print).
 *
 * DOCX: gerado no browser com o bundle UMD do pacote 'docx'
 *       servido em assets/js/docx.umd.js (incluso no repositório).
 * PDF:  window.print() com @media print adequado em main.css.
 *
 * Uso:
 *   import { exportarDocx, exportarPDF } from './exportar.js';
 *   await exportarDocx(gerarDocumentoPlano(dados), 'plano-de-aula');
 *   exportarPDF();
 */

import { notificar } from './notificacoes.js';

/** @type {Promise<object>|null} */
let _docxPromise = null;

/**
 * Carrega o bundle UMD do docx lazily (uma vez por sessão).
 * @returns {Promise<object>} namespace docx
 */
async function _carregarDocx() {
  if (_docxPromise) return _docxPromise;

  _docxPromise = new Promise((resolve, reject) => {
    /* Evitar carregar duas vezes se o script já foi injetado */
    if (window.docx) { resolve(window.docx); return; }

    const script  = document.createElement('script');
    script.src    = './assets/js/docx.umd.js';
    script.onload = () => {
      if (window.docx) resolve(window.docx);
      else reject(new Error('docx UMD carregado mas window.docx não definido'));
    };
    script.onerror = () => reject(new Error('Falha ao carregar assets/js/docx.umd.js'));
    document.head.appendChild(script);
  });

  return _docxPromise;
}

/**
 * Gera e faz download de um arquivo DOCX.
 * @param {Uint8Array|ArrayBuffer} buffer — resultado de Packer.toBuffer()
 * @param {string} nomeArquivo — sem extensão
 */
async function _downloadBuffer(buffer, nomeArquivo) {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `${nomeArquivo}.docx`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Recebe uma função geradora que recebe o namespace docx e retorna um Document.
 * Carrega o bundle, executa a função, faz o Packer e dispara o download.
 *
 * @param {(docxNs: object) => object} gerarFn — função que recebe namespace docx e retorna Document
 * @param {string} nomeArquivo
 */
export async function exportarDocx(gerarFn, nomeArquivo) {
  const dismiss = notificar('Gerando documento DOCX…', 'info', 0);
  try {
    const docxNs = await _carregarDocx();
    const doc    = gerarFn(docxNs);
    const buffer = await docxNs.Packer.toBuffer(doc);
    await _downloadBuffer(buffer, nomeArquivo);
    dismiss();
    notificar('DOCX exportado com sucesso.', 'sucesso');
  } catch (err) {
    dismiss();
    notificar('Erro ao gerar DOCX. Tente exportar como PDF.', 'erro', 6000);
    console.error('[exportar] DOCX error:', err);
  }
}

/**
 * Abre o diálogo de impressão nativo (PDF via "Salvar como PDF").
 */
export function exportarPDF() {
  window.print();
}

/* --------------------------------------------------------------------------
   Construtor de Document para Plano de Aula
   -------------------------------------------------------------------------- */

/**
 * @param {object} dados — mesma estrutura que _gerar() lê em planos.js
 * @returns {(docxNs: object) => Document}
 */
export function gerarDocPlano(dados) {
  return (d) => {
    const {
      Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
      AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
      LevelFormat, PageNumber, Header, Footer, VerticalAlign,
    } = d;

    const PAGE_W    = 11906; /* A4 DXA */
    const MARGINS   = { top: 1134, right: 1134, bottom: 1134, left: 1134 }; /* ~2cm */
    const CONTENT_W = PAGE_W - MARGINS.left - MARGINS.right; /* ~9638 DXA */
    const BORDER    = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
    const BORDERS   = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
    const CELL_M    = { top: 80, bottom: 80, left: 120, right: 120 };

    const _h = (txt) => new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 80 },
      children: [new TextRun({ text: txt, bold: true, size: 24, font: 'Arial' })],
    });

    const _p = (txt) => new Paragraph({
      spacing: { before: 60, after: 60 },
      children: [new TextRun({ text: txt || '', font: 'Arial', size: 22 })],
    });

    const _li = (txt) => new Paragraph({
      numbering: { reference: 'bullets', level: 0 },
      spacing: { before: 40, after: 40 },
      children: [new TextRun({ text: txt, font: 'Arial', size: 22 })],
    });

    const _metaRow = (label, valor) => new TableRow({
      children: [
        new TableCell({
          borders: BORDERS, margins: CELL_M,
          width: { size: Math.floor(CONTENT_W * 0.32), type: WidthType.DXA },
          shading: { fill: 'F0F0F0', type: ShadingType.CLEAR },
          children: [new Paragraph({
            children: [new TextRun({ text: label, bold: true, font: 'Arial', size: 20 })],
          })],
        }),
        new TableCell({
          borders: BORDERS, margins: CELL_M,
          width: { size: Math.floor(CONTENT_W * 0.68), type: WidthType.DXA },
          children: [new Paragraph({
            children: [new TextRun({ text: valor || '—', font: 'Arial', size: 20 })],
          })],
        }),
      ],
    });

    /* Bloco de metadados */
    const metaRows = [
      ['Escola', dados.escola],
      ['Professor(a)', dados.professor],
      ['Componente', dados.componente],
      ['Ano / Série', dados.anoLabel],
      ['Turma', dados.turma],
      ['Bimestre', dados.bimestre],
      ['Data', dados.data],
      ['Nº de Aulas', dados.naulas],
      ['Duração por Aula', dados.durLabel],
      ['Carga Horária Total', dados.carga],
    ].filter(([, v]) => v);

    const metaTable = metaRows.length > 0 ? new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: [Math.floor(CONTENT_W * 0.32), Math.floor(CONTENT_W * 0.68)],
      rows: metaRows.map(([l, v]) => _metaRow(l, v)),
    }) : null;

    /* Seções dinâmicas */
    const secoes = [];
    const add = (titulo, items, tipo = 'lista') => {
      if (!items || items.length === 0) return;
      secoes.push(_h(titulo));
      if (tipo === 'lista') {
        items.forEach(t => secoes.push(_li(t)));
      } else {
        items.forEach(t => secoes.push(_p(t)));
      }
    };

    add('Objetos de Conhecimento', dados.obj);
    add('Habilidades BNCC', dados.bncc);
    add('Objetivos da Aula', dados.obt);
    add('Metodologia / Sequência Didática', dados.met, 'para');
    add('Recursos Didáticos', dados.rec);
    add('Avaliação', dados.ava, 'para');
    if (dados.ref) { secoes.push(_h('Referências Bibliográficas')); secoes.push(_p(dados.ref)); }
    if (dados.obs) { secoes.push(_h('Observações')); secoes.push(_p(dados.obs)); }

    const children = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({ text: 'LAPEE AM — Plano de Aula', bold: true, size: 32, font: 'Arial', color: '2d3a8c' }),
        ],
      }),
      ...(dados.tema ? [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [new TextRun({ text: dados.tema, bold: true, size: 26, font: 'Arial' })],
      })] : []),
      ...(metaTable ? [metaTable, new Paragraph({ spacing: { after: 160 }, children: [] })] : []),
      ...secoes,
      new Paragraph({ spacing: { before: 480 }, children: [] }),
      new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' } },
        spacing: { before: 80 },
        children: [new TextRun({ text: `${dados.professor || '_______________'}   |   ${dados.data || '__/__/____'}`, font: 'Arial', size: 18, color: '888888' })],
      }),
    ];

    return new Document({
      numbering: {
        config: [{
          reference: 'bullets',
          levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
        }],
      },
      styles: {
        default: { document: { run: { font: 'Arial', size: 22 } } },
        paragraphStyles: [
          { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
            run: { size: 24, bold: true, font: 'Arial', color: '2d3a8c' },
            paragraph: { spacing: { before: 240, after: 120 },
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '2d3a8c', space: 2 } } } },
        ],
      },
      sections: [{ properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: MARGINS } }, children }],
    });
  };
}

/* --------------------------------------------------------------------------
   Construtor de Document para Folha de Atividades
   -------------------------------------------------------------------------- */

/**
 * @param {object} dados
 * @param {string} dados.componente
 * @param {string} dados.ano
 * @param {string} dados.nivel
 * @param {string} dados.escola
 * @param {string} dados.professor
 * @param {Array<{numero: number, enunciado: string, alternativas?: string[], resposta?: string}>} dados.questoes
 * @returns {(docxNs: object) => Document}
 */
export function gerarDocAtividades(dados) {
  return (d) => {
    const {
      Document, Paragraph, TextRun, Table, TableRow, TableCell,
      AlignmentType, BorderStyle, WidthType, ShadingType, LevelFormat,
    } = d;

    const PAGE_W    = 11906;
    const MARGINS   = { top: 1134, right: 1134, bottom: 1134, left: 1134 };
    const CONTENT_W = PAGE_W - MARGINS.left - MARGINS.right;
    const BORDER_NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
    const BORDERS_NONE = { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE };

    const _p = (txt, opts = {}) => new Paragraph({
      spacing: { before: opts.before ?? 60, after: opts.after ?? 60 },
      alignment: opts.align ?? AlignmentType.LEFT,
      children: [new TextRun({ text: txt || '', font: 'Arial', size: opts.size ?? 22,
        bold: opts.bold ?? false, color: opts.color ?? '000000' })],
    });

    /* Cabeçalho com linha para nome/data */
    const cabecalho = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [
          new TextRun({ text: 'LAPEE AM', bold: true, size: 28, font: 'Arial', color: '2d3a8c' }),
          new TextRun({ text: `  —  Folha de Atividades`, size: 24, font: 'Arial', color: '555555' }),
        ],
      }),
      new Table({
        width: { size: CONTENT_W, type: WidthType.DXA },
        columnWidths: [Math.floor(CONTENT_W * 0.6), Math.floor(CONTENT_W * 0.2), Math.floor(CONTENT_W * 0.2)],
        rows: [new TableRow({
          children: [
            new TableCell({
              borders: BORDERS_NONE,
              children: [_p(`${dados.componente} — ${dados.ano}º Ano — ${dados.nivel}`, { bold: true, size: 24 })],
            }),
            new TableCell({
              borders: BORDERS_NONE,
              children: [_p('Nome: _____________________', { size: 20 })],
            }),
            new TableCell({
              borders: BORDERS_NONE,
              children: [_p('Data: ___/___/______', { size: 20 })],
            }),
          ],
        })],
      }),
      ...(dados.escola || dados.professor ? [_p(
        [dados.escola, dados.professor ? `Prof.: ${dados.professor}` : ''].filter(Boolean).join('   |   '),
        { size: 18, color: '888888', before: 40 },
      )] : []),
      new Paragraph({
        spacing: { before: 200, after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '2d3a8c', space: 1 } },
        children: [],
      }),
    ];

    /* Questões */
    const questoesPars = [];
    dados.questoes.forEach((q, i) => {
      /* Número + enunciado */
      questoesPars.push(new Paragraph({
        spacing: { before: i > 0 ? 200 : 80, after: 80 },
        children: [
          new TextRun({ text: `${q.numero}. `, bold: true, size: 24, font: 'Arial', color: '2d3a8c' }),
          new TextRun({ text: q.enunciado, size: 22, font: 'Arial' }),
        ],
      }));

      /* Alternativas A, B, C, D se existirem */
      if (q.alternativas && q.alternativas.length > 0) {
        const letras = ['A', 'B', 'C', 'D', 'E'];
        q.alternativas.forEach((alt, j) => {
          questoesPars.push(new Paragraph({
            spacing: { before: 40, after: 40 },
            indent: { left: 480 },
            children: [
              new TextRun({ text: `(${letras[j]}) `, bold: true, size: 22, font: 'Arial' }),
              new TextRun({ text: alt, size: 22, font: 'Arial' }),
            ],
          }));
        });
      } else {
        /* Linhas em branco para resposta dissertativa */
        for (let l = 0; l < 3; l++) {
          questoesPars.push(new Paragraph({
            spacing: { before: 40, after: 40 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC', space: 2 } },
            children: [new TextRun({ text: '', font: 'Arial', size: 22 })],
          }));
        }
      }
    });

    /* Gabarito em seção separada (se houver respostas) */
    const temGabarito = dados.questoes.some(q => q.resposta);
    const gabaritoSec = temGabarito ? [
      new Paragraph({
        spacing: { before: 480 },
        border: { top: { style: BorderStyle.DASHED, size: 4, color: 'AAAAAA', space: 4 } },
        children: [new TextRun({ text: 'GABARITO — Para uso do professor', bold: true, size: 20, font: 'Arial', color: '888888' })],
      }),
      new Paragraph({
        spacing: { before: 80, after: 60 },
        children: [new TextRun({
          text: dados.questoes.filter(q => q.resposta)
            .map(q => `${q.numero}. ${q.resposta}`).join('   '),
          size: 18, font: 'Arial', color: '666666',
        })],
      }),
    ] : [];

    return new Document({
      styles: {
        default: { document: { run: { font: 'Arial', size: 22 } } },
      },
      sections: [{
        properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: MARGINS } },
        children: [...cabecalho, ...questoesPars, ...gabaritoSec],
      }],
    });
  };
}
