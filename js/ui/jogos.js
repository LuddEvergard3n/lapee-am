/**
 * ui/jogos.js
 * Página de Jogos de Palavras — caça-palavras e palavras cruzadas procedurais.
 *
 * Sem progresso salvo, sem BNCC, sem painel do professor.
 * Reutiliza renderCacaPalavras e renderCruzadas diretamente com atividades
 * sintéticas construídas a partir do banco de palavras.
 */

import { renderCacaPalavras } from '../activities/cacapalavras.js';
import { renderCruzadas }     from '../activities/cruzadas.js';
import { COMPONENTE_LABEL, esc } from './componentes.js';
import { play }               from '../sound.js';

/* Cache do banco de palavras: carregado uma vez, reutilizado. */
let _bancoCache = null;

/**
 * Carrega banco-palavras.json e armazena em cache de módulo.
 * @returns {Promise<object>}
 */
async function _carregarBanco() {
  if (_bancoCache) return _bancoCache;
  const resp = await fetch('./data/banco-palavras.json');
  if (!resp.ok) throw new Error(`Banco de palavras não encontrado (HTTP ${resp.status}).`);
  _bancoCache = await resp.json();
  return _bancoCache;
}

/**
 * Embaralha uma cópia do array e retorna os primeiros N elementos.
 * Não modifica o array original.
 * @param {any[]} arr
 * @param {number} n
 * @returns {any[]}
 */
function _sortear(arr, n) {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, Math.min(n, copia.length));
}

/* Ordem canônica dos componentes — espelha componentes.js */
const COMPONENTES = ['LP', 'Matemática', 'Ciências', 'História', 'Geografia', 'Arte'];
const ANOS        = [1, 2, 3, 4, 5];

/* Quantidade de palavras sorteadas por tipo de jogo */
const N_CACA     = 12;
const N_CRUZADAS =  8;

/**
 * Renderiza a página de Jogos de Palavras.
 * @param {HTMLElement} container
 */
export async function renderJogos(container) {
  /* Estado local da seleção — não vai para o store, não persiste. */
  let componente = 'LP';
  let ano        = 1;
  let tipo       = 'cacapalavras'; /* 'cacapalavras' | 'cruzadas' */

  /* ---- Estrutura inicial da página ---- */
  container.innerHTML = `
    <div class="jogos-page">
      <header class="jogos-cabecalho">
        <h1 class="jogos-titulo">Jogos de Palavras</h1>
        <p class="jogos-subtitulo">
          Escolha o componente, o ano e o tipo de jogo. As palavras são
          sorteadas a cada partida — clique em "Novo jogo" para embaralhar de novo.
        </p>
      </header>

      <section class="jogos-selecao" aria-label="Configurações do jogo">

        <div class="jogos-grupo">
          <span class="jogos-grupo-rotulo" id="lbl-comp">Componente</span>
          <div class="jogos-opcoes" id="jogos-componentes"
               role="group" aria-labelledby="lbl-comp">
            ${COMPONENTES.map(c => `
              <button class="jogos-opcao${c === componente ? ' ativa' : ''}"
                      data-val="${esc(c)}"
                      aria-pressed="${c === componente}">
                ${esc(COMPONENTE_LABEL[c] ?? c)}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="jogos-grupo">
          <span class="jogos-grupo-rotulo" id="lbl-ano">Ano</span>
          <div class="jogos-opcoes" id="jogos-anos"
               role="group" aria-labelledby="lbl-ano">
            ${ANOS.map(a => `
              <button class="jogos-opcao${a === ano ? ' ativa' : ''}"
                      data-val="${a}"
                      aria-pressed="${a === ano}">
                ${a}º ano
              </button>
            `).join('')}
          </div>
        </div>

        <div class="jogos-grupo">
          <span class="jogos-grupo-rotulo" id="lbl-tipo">Tipo de jogo</span>
          <div class="jogos-opcoes" id="jogos-tipos"
               role="group" aria-labelledby="lbl-tipo">
            <button class="jogos-opcao ativa"
                    data-val="cacapalavras" aria-pressed="true">Caça-palavras</button>
            <button class="jogos-opcao"
                    data-val="cruzadas"    aria-pressed="false">Palavras cruzadas</button>
          </div>
        </div>

        <div class="jogos-acao">
          <button class="btn btn-primary" id="jogos-jogar">Jogar</button>
        </div>

      </section>

      <div id="jogos-arena" class="jogos-arena" aria-live="polite"></div>
    </div>
  `;

  /* ---- Helpers de seleção ---- */

  /**
   * Marca o botão com data-val === String(valor) como ativo no grupo.
   * @param {string} grupoId
   * @param {string|number} valor
   */
  function _ativarOpcao(grupoId, valor) {
    container.querySelectorAll(`#${grupoId} .jogos-opcao`).forEach(btn => {
      const ativa = btn.dataset.val === String(valor);
      btn.classList.toggle('ativa', ativa);
      btn.setAttribute('aria-pressed', String(ativa));
    });
  }

  /* ---- Handlers dos grupos ---- */

  container.querySelector('#jogos-componentes').addEventListener('click', e => {
    const btn = e.target.closest('.jogos-opcao');
    if (!btn) return;
    componente = btn.dataset.val;
    _ativarOpcao('jogos-componentes', componente);
    play('clique');
  });

  container.querySelector('#jogos-anos').addEventListener('click', e => {
    const btn = e.target.closest('.jogos-opcao');
    if (!btn) return;
    ano = parseInt(btn.dataset.val, 10);
    _ativarOpcao('jogos-anos', ano);
    play('clique');
  });

  container.querySelector('#jogos-tipos').addEventListener('click', e => {
    const btn = e.target.closest('.jogos-opcao');
    if (!btn) return;
    tipo = btn.dataset.val;
    _ativarOpcao('jogos-tipos', tipo);
    play('clique');
  });

  /* ---- Iniciar / reiniciar jogo ---- */

  async function _iniciarJogo() {
    const arena = container.querySelector('#jogos-arena');
    arena.innerHTML = '<p class="atv-carregando">Carregando banco de palavras…</p>';

    let banco;
    try {
      banco = await _carregarBanco();
    } catch (err) {
      arena.innerHTML = `<p class="atv-erro">${esc(err.message)}</p>`;
      return;
    }

    const pool = banco?.[componente]?.[String(ano)] ?? [];
    if (pool.length < 4) {
      arena.innerHTML =
        '<p class="atv-erro">Palavras insuficientes para essa combinação. Tente outro componente ou ano.</p>';
      return;
    }

    const labelComp = esc(COMPONENTE_LABEL[componente] ?? componente);
    const labelTipo = tipo === 'cacapalavras' ? 'Caça-palavras' : 'Palavras cruzadas';

    arena.innerHTML = `
      <div class="jogos-arena-cabecalho">
        <span class="jogos-arena-info">${esc(labelTipo)} — ${labelComp}, ${ano}º ano</span>
        <button class="btn btn-ghost btn-sm" id="jogos-novo">Novo jogo</button>
      </div>
      <div id="jogos-motor"></div>
    `;

    arena.querySelector('#jogos-novo').addEventListener('click', () => {
      play('clique');
      _iniciarJogo();
    });

    const motor = arena.querySelector('#jogos-motor');

    if (tipo === 'cacapalavras') {
      const selecionadas = _sortear(pool, N_CACA);
      await renderCacaPalavras(
        motor,
        {
          conteudo_base: {
            palavras: selecionadas.map(e => e.palavra),
            dicas:    selecionadas.map(e => e.dica),
          },
        },
        { onAcerto: () => {}, onErro: () => {}, onConcluida: () => {} }
      );
    } else {
      const selecionadas = _sortear(pool, N_CRUZADAS);
      await renderCruzadas(
        motor,
        {
          conteudo_base: { entradas: selecionadas },
        },
        { onAcerto: () => {}, onErro: () => {}, onConcluida: () => {} }
      );
    }
  }

  container.querySelector('#jogos-jogar').addEventListener('click', () => {
    play('clique');
    _iniciarJogo();
  });
}
