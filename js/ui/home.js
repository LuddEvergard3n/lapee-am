/**
 * ui/home.js
 * Página inicial (Home).
 * Linguagem ajustada para ser clara e acessível ao público do Ensino Fundamental I
 * e aos professores que mediam o uso da plataforma.
 */

import { setState, getState } from '../store.js';
import { getAnos }            from '../dataLoader/index.js';
import { navigate }           from '../router.js';
import { COMPONENTE_LABEL }   from './componentes.js';
import { renderMascote, setEstado as mascoteEstado } from '../mascote.js';
import { getConquistasDoAno, getEmblemaSVG }         from '../conquistas.js';

/**
 * Renderiza a página inicial dentro do container fornecido.
 * @param {HTMLElement} main
 */
export function renderHome(main) {
  main.innerHTML = `
    <section class="page-home" aria-labelledby="home-title">

      <header class="hero" id="hero-home">
        <div class="hero-inner">
          <span class="hero-eyebrow">LAPEE AM — Laboratório de Práticas Educativas e Extensão Amos Comenius</span>
          <div id="hero-conquistas-badge"></div>
          <h1 id="home-title">Atividades para aprender</h1>
          <p class="hero-desc">
            Escolha o ano e a matéria. Depois é só começar!
            Você pode ouvir as perguntas em voz alta e responder de vários jeitos.
          </p>
          <a href="#/navegador" class="btn btn-primary btn-lg">Quero fazer atividades</a>
        </div>
        <div class="hero-mascote" id="hero-mascote-area" aria-hidden="true"></div>
      </header>

      <section class="home-cards" aria-label="Matérias disponíveis">
        <h2 class="section-title">Qual matéria?</h2>
        <div class="cards-grid">
          ${Object.entries(COMPONENTE_LABEL).map(([k, v]) => `
            <a href="#/navegador"
               class="card card-componente"
               data-componente="${k}"
               aria-label="Atividades de ${v}">
              <span class="card-label">${v}</span>
            </a>
          `).join('')}
        </div>
      </section>

      <div id="home-conquistas-section"></div>

      <section class="home-info" aria-label="Como funciona">
        <h2 class="section-title">Como funciona</h2>
        <div class="info-grid">
          <div class="info-item">
            <h3>Escolha o ano e a matéria</h3>
            <p>Clica em "Quero fazer atividades", escolhe o ano e a matéria. Pronto!</p>
          </div>
          <div class="info-item">
            <h3>Três versões de cada atividade</h3>
            <p>Tem a versão mais fácil, a normal e o desafio. Começa pela que fizer mais sentido.</p>
          </div>
          <div class="info-item">
            <h3>Você pode ouvir a pergunta</h3>
            <p>Clica em "Ouvir" e o computador lê a pergunta em voz alta para você.</p>
          </div>
          <div class="info-item">
            <h3>Para o professor</h3>
            <p>Clica em "Para o professor" para ver as respostas certas e como ajudar o aluno.</p>
          </div>
        </div>
      </section>

    </section>
  `;

  /* Mascote no hero */
  const heroMascoteArea = main.querySelector('#hero-mascote-area');
  if (heroMascoteArea) {
    renderMascote(heroMascoteArea);
    /* Anima após breve delay para dar boas-vindas */
    /* Animação de boas-vindas adaptada ao progresso */
    setTimeout(() => {
      const anos_ = getAnos();
      const anoAtual_ = getState().ano ?? anos_[0] ?? 1;
      const temConquista = getConquistasDoAno(anoAtual_).some(c => c.desbloqueada);
      mascoteEstado(temConquista ? 'conquista' : 'acerto', 1800);
    }, 500);
  }

  /* Conquistas: usar o ano selecionado ou o primeiro disponível */
  const anos = getAnos();
  const anoAtual = getState().ano ?? anos[0] ?? 1;
  const conquistas = getConquistasDoAno(anoAtual);
  const qtdDesbloqueadas = conquistas.filter(c => c.desbloqueada).length;

  /* Badge de conquistas no hero */
  const badge = main.querySelector('#hero-conquistas-badge');
  if (badge && qtdDesbloqueadas > 0) {
    badge.innerHTML = `
      <div class="hero-conquistas">
        <span>★</span>
        <span>${qtdDesbloqueadas} ${qtdDesbloqueadas === 1 ? 'conquista' : 'conquistas'} desbloqueada${qtdDesbloqueadas === 1 ? '' : 's'}</span>
      </div>
    `;
  }

  /* Seção de emblemas */
  const conquistasSection = main.querySelector('#home-conquistas-section');
  if (conquistasSection && conquistas.length > 0) {
    conquistasSection.innerHTML = `
      <section class="home-conquistas" aria-label="Suas conquistas">
        <h2 class="section-title">Suas conquistas — ${anoAtual}º ano</h2>
        <div class="conquistas-grid">
          ${conquistas.map((c, i) => {
            const pct = c.total ? Math.round((c.concluidas / c.total) * 100) : 0;
            const titulo = c.desbloqueada
              ? 'Parabéns! ' + c.componente + ' completo!'
              : c.concluidas + ' de ' + c.total + ' atividades — ' + pct + '%';
            return `
            <div class="emblema ${c.desbloqueada ? 'desbloqueado' : 'bloqueado'}"
                 style="animation-delay: ${i * 0.06}s"
                 title="${titulo}">
              <div class="emblema-icone">${getEmblemaSVG(c.componente)}</div>
              <span class="emblema-nome">${c.componente}</span>
            </div>
          `;}).join('')}
        </div>
      </section>
    `;
  }

  /* Clique nos cards de matéria: navega direto para o navegador com o componente pré-selecionado */
  main.querySelectorAll('.card-componente').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const comp = card.dataset.componente;
      const anosDisponiveis = getAnos();
      setState({ componente: comp, ano: anosDisponiveis[0] ?? 3 });
      /* navigate() atualiza o hash e dispara hashchange → router → setState({pagina:'navegador'}).
         navKey garante que não haja render duplicado. */
      navigate('/navegador');
    });
  });
}
