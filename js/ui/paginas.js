/**
 * ui/paginas.js
 * Páginas estáticas: Sobre e Acessibilidade.
 * A página "Sobre" mantém linguagem técnica (destinada a professores/pesquisadores).
 * A página "Acessibilidade" tem linguagem direta para qualquer usuário.
 */

import { $ } from './componentes.js';
import { clearProgress } from '../store.js';
import { notificar } from '../notificacoes.js';

/**
 * Renderiza a página Sobre.
 * @param {HTMLElement} main
 */
export function renderSobre(main) {
  main.innerHTML = `
    <section class="page-sobre" aria-labelledby="sobre-title">
      <h1 id="sobre-title" class="page-title">Sobre este Produto Educacional</h1>

      <div class="sobre-content">
        <section class="sobre-section">
          <h2>O que é esta plataforma</h2>
          <p>
            Produto educacional desenvolvido no âmbito do Laboratório de Práticas
            Educativas e Extensão Amos Comenius (LAPEE AM). Oferece um acervo de
            atividades estruturadas para o Ensino Fundamental I, organizadas por
            habilidade BNCC e acessíveis sem conexão à internet.
          </p>
        </section>

        <section class="sobre-section">
          <h2>Inclusão total: uma sala, todos aprendendo</h2>
          <p>
            O princípio que orienta cada atividade deste acervo é simples de enunciar
            e difícil de executar: <strong>nenhuma adaptação para um aluno deve
            prejudicar a experiência de outro</strong>. A inclusão real não acontece
            quando tiramos complexidade para alguns ou adicionamos dificuldade para
            outros — acontece quando o mesmo material, sem modificação, acolhe
            percursos diferentes.
          </p>
          <p>
            Na prática, isso significa que uma criança neurotípica e uma criança
            neurodivergente — seja com TDAH, TEA, dislexia, discalculia, ansiedade
            de desempenho ou qualquer outra condição — podem sentar lado a lado e
            trabalhar na mesma atividade, ao mesmo tempo, sem que nenhuma precise
            de uma versão "especial" separada. As diferenças de percurso são
            absorvidas pelo próprio design:
          </p>
          <ul>
            <li>
              <strong>Texto e áudio simultâneos.</strong> O botão "Ouvir" está sempre
              disponível, não como recurso de emergência para quem não consegue ler,
              mas como uma forma legítima e igualmente válida de acessar o enunciado.
              Quem prefere ouvir ouve. Quem prefere ler, lê. Quem quer os dois, usa os dois.
            </li>
            <li>
              <strong>Múltiplos modos de resposta.</strong> Marcar, arrastar, ordenar,
              escrever com texto ou gravar a voz — cada formato mobiliza habilidades
              distintas e reduz a barreira para crianças com dificuldades motoras finas,
              de processamento ortográfico ou de expressão escrita, sem retirar o desafio
              cognitivo da atividade.
            </li>
            <li>
              <strong>Feedback sem punição.</strong> Errar não trava o progresso nem
              exibe mensagens de fracasso. A resposta incorreta é tratada como tentativa —
              "Quase! Tenta de novo." — o que reduz a carga de ansiedade de desempenho
              em crianças com perfil ansioso ou com histórico de frustração escolar,
              enquanto mantém o desafio real para quem avança com facilidade.
            </li>
            <li>
              <strong>Dica que orienta, não entrega.</strong> A ajuda disponível no botão
              "Preciso de ajuda" nunca revela a resposta — faz uma pergunta que redireciona
              o raciocínio. Isso preserva a experiência de descoberta para o aluno que não
              precisa de apoio, e oferece andaime cognitivo para quem precisa sem criar
              dependência de resposta pronta.
            </li>
            <li>
              <strong>Três níveis por unidade.</strong> A mesma habilidade curricular é
              trabalhada em três graus de profundidade. O professor escolhe o ponto de
              entrada mais adequado a cada aluno sem precisar criar materiais distintos.
              Um aluno com mais facilidade pode avançar para o N3 enquanto outro consolida
              o N1 — ambos trabalhando a mesma habilidade BNCC, no mesmo momento de aula.
            </li>
            <li>
              <strong>Painel do professor visível, não intrusivo.</strong> O gabarito e as
              orientações pedagógicas ficam ocultos por padrão. O professor acessa quando
              necessário; o aluno nunca vê inadvertidamente, o que preserva a autonomia da
              experiência de aprendizagem.
            </li>
          </ul>
          <p>
            A premissa que nos guia vem do campo do Desenho Universal para Aprendizagem
            (DUA): o problema não está no aluno que não se adapta ao material — está no
            material que não foi projetado para a variabilidade humana. Quando o design
            é universal desde o início, a acessibilidade deixa de ser uma concessão e
            passa a ser a estrutura.
          </p>
        </section>

        <section class="sobre-section">
          <h2>Sobre o nome: Amos Comenius</h2>
          <p>
            Jan Amos Komenský — conhecido pelo nome latinizado <strong>Comenius</strong>
            — nasceu na Morávia (atual República Tcheca) em 1592 e morreu em Amsterdam
            em 1670. Teólogo, filósofo e pedagogo, é considerado o pai da didática
            moderna e um dos primeiros pensadores a tratar a educação como um campo
            sistemático de conhecimento.
          </p>
          <p>
            Em 1658, publicou a <em>Orbis Sensualium Pictus</em> ("O Mundo em Imagens"),
            o que muitos historiadores da educação reconhecem como o primeiro livro
            didático ilustrado da história. A obra foi concebida para tornar o aprendizado
            acessível a todas as crianças, combinando texto e imagem de modo que o
            conteúdo pudesse ser compreendido independentemente do domínio prévio
            da leitura. Uma ideia que, quatro séculos depois, ainda orienta boas práticas
            de design instrucional.
          </p>
          <p>
            Mas o que nos fez escolher o nome de Comenius não foi apenas sua longevidade
            histórica. Foi um princípio que ele enunciou com rara clareza em sua obra
            maior, a <em>Didactica Magna</em> (1638): <strong>"Ensinar tudo a todos"</strong>
            (<em>omnes omnia docere</em>). Em um século em que a instrução formal era
            privilégio de poucos — determinado por origem, gênero e condição social —
            Comenius defendeu que toda criança, sem exceção, era capaz de aprender,
            e que o fracasso em ensinar era sempre uma falha do método, nunca
            do aprendiz.
          </p>
          <p>
            Essa convicção ressoa diretamente com o que tentamos construir aqui.
            Quando projetamos uma atividade que funciona ao mesmo tempo para uma
            criança neurotípica e para uma criança neurodivergente, sem que uma
            exclua a outra, estamos praticando — com as ferramentas do século XXI —
            o mesmo projeto que Comenius esboçou no XVII: uma pedagogia que parte
            da crença irredutível de que <em>todos</em> podem aprender, e que cabe
            ao material — não ao aluno — ser suficientemente bom para isso.
          </p>
          <p>
            O Laboratório leva seu nome porque queremos lembrar, a cada atividade
            criada, de onde vem essa responsabilidade.
          </p>
        </section>

        <section class="sobre-section">
          <h2>BNCC como espinha dorsal</h2>
          <p>
            A Base Nacional Comum Curricular define as habilidades que organizam este acervo.
            Cada atividade é vinculada a um código de habilidade (ex.: EF03LP06), que funciona
            como metadado de classificação e não como prescrição rígida. O professor pode usar
            esses códigos para localizar atividades alinhadas ao planejamento de sala.
          </p>
        </section>

        <section class="sobre-section">
          <h2>CBTC-SC como referência territorial</h2>
          <p>
            O Currículo Base do Território Catarinense complementa a BNCC com especificidades
            regionais. O campo <code>referencia_cbtc</code> em cada atividade indica o código
            territorial correspondente, mantido como tag de referência sem determinar o conteúdo.
          </p>
        </section>

        <section class="sobre-section">
          <h2>Desenho Universal para Aprendizagem (DUA)</h2>
          <p>
            O DUA orienta o design de materiais acessíveis desde a concepção.
            Esta plataforma implementa três camadas em cada atividade:
          </p>
          <ul>
            <li><strong>Múltiplas formas de apresentar:</strong> texto claro, áudio via Web Speech API, opções de fonte e contraste.</li>
            <li><strong>Múltiplas formas de responder:</strong> clique, arrastar, ordenar, escrever ou gravar oralmente.</li>
            <li><strong>Múltiplas formas de engajar:</strong> missões curtas, feedback sem punição, dicas que orientam sem revelar a resposta.</li>
          </ul>
        </section>

        <section class="sobre-section">
          <h2>Licença e uso</h2>
          <p>
            Distribuído sob licença MIT. O conteúdo pode ser adaptado e redistribuído
            desde que mantida a atribuição ao LAPEE AM. Consulte o arquivo LICENSE no repositório.
          </p>
        </section>
      </div>
    </section>
  `;
}

/**
 * Renderiza a página de Acessibilidade.
 * @param {HTMLElement} main
 * @param {object} state
 */
export function renderAcessibilidade(main, state) {
  const { prefs } = state;

  main.innerHTML = `
    <section class="page-a11y" aria-labelledby="a11y-title">
      <h1 id="a11y-title" class="page-title">Configurações de Acessibilidade</h1>

      <div class="a11y-controls" role="group" aria-label="Opções de exibição">

        <div class="a11y-item">
          <div class="a11y-info">
            <h2>Letra maior</h2>
            <p>Deixa todo o texto do site maior e mais fácil de ler. Atalho: Alt + F</p>
          </div>
          <button id="btn-fonte"
                  class="btn btn-toggle ${prefs.fonteGrande ? 'active' : ''}"
                  type="button"
                  aria-pressed="${prefs.fonteGrande}"
                  aria-label="Ligar ou desligar letra maior">
            ${prefs.fonteGrande ? 'Ligada' : 'Desligada'}
          </button>
        </div>

        <div class="a11y-item">
          <div class="a11y-info">
            <h2>Alto contraste</h2>
            <p>Muda as cores para ficarem mais fáceis de ver. Atalho: Alt + C</p>
          </div>
          <button id="btn-contraste"
                  class="btn btn-toggle ${prefs.altoContraste ? 'active' : ''}"
                  type="button"
                  aria-pressed="${prefs.altoContraste}"
                  aria-label="Ligar ou desligar alto contraste">
            ${prefs.altoContraste ? 'Ligado' : 'Desligado'}
          </button>
        </div>

        <div class="a11y-item">
          <div class="a11y-info">
            <h2>Fundo escuro</h2>
            <p>Deixa o fundo da tela escuro para cansar menos os olhos. Atalho: Alt + D</p>
          </div>
          <button id="btn-tema"
                  class="btn btn-toggle ${prefs.temaEscuro ? 'active' : ''}"
                  type="button"
                  aria-pressed="${prefs.temaEscuro}"
                  aria-label="Ligar ou desligar fundo escuro">
            ${prefs.temaEscuro ? 'Ligado' : 'Desligado'}
          </button>
        </div>

        <div class="a11y-item">
          <div class="a11y-info">
            <h2>Sons das atividades</h2>
            <p>Liga ou desliga os efeitos sonoros de acerto, erro e conquista.</p>
          </div>
          <button id="btn-som"
                  class="btn btn-toggle ${prefs.somAtivado ? 'active' : ''}"
                  type="button"
                  aria-pressed="${prefs.somAtivado}"
                  aria-label="Ligar ou desligar sons das atividades">
            ${prefs.somAtivado ? 'Ligados' : 'Desligados'}
          </button>
        </div>

      </div>

      <section class="a11y-danger" aria-labelledby="a11y-danger-title">
        <h2 id="a11y-danger-title">Dados e progresso</h2>
        <div class="a11y-item">
          <div class="a11y-info">
            <h2>Apagar todo o progresso</h2>
            <p>Remove todas as atividades marcadas como concluídas. Útil para recomeçar do zero ou trocar de aluno.</p>
          </div>
          <button id="btn-reset-progress"
                  class="btn btn-danger"
                  type="button"
                  aria-label="Apagar todo o progresso do aluno">
            Apagar progresso
          </button>
        </div>
      </section>

      <section class="a11y-nav" aria-labelledby="a11y-nav-title">
        <h2 id="a11y-nav-title">Navegar pelo teclado</h2>
        <table class="atalhos-table">
          <thead>
            <tr><th>O que faz</th><th>Tecla</th></tr>
          </thead>
          <tbody>
            <tr><td>Ir para o próximo elemento</td><td>Tab</td></tr>
            <tr><td>Voltar para o elemento anterior</td><td>Shift + Tab</td></tr>
            <tr><td>Clicar num botão ou link</td><td>Enter ou Espaço</td></tr>
            <tr><td>Fechar o menu lateral</td><td>Esc</td></tr>
            <tr><td>Ligar/desligar letra maior</td><td>Alt + F</td></tr>
            <tr><td>Ligar/desligar alto contraste</td><td>Alt + C</td></tr>
            <tr><td>Ligar/desligar fundo escuro</td><td>Alt + D</td></tr>
          </tbody>
        </table>
      </section>
    </section>
  `;

  const { toggleFonteGrande, toggleAltoContraste, toggleTemaEscuro, toggleSom } = window._a11y;

  $('btn-fonte')?.addEventListener('click',    () => { toggleFonteGrande();   });
  $('btn-contraste')?.addEventListener('click', () => { toggleAltoContraste(); });
  $('btn-tema')?.addEventListener('click',     () => { toggleTemaEscuro();    });
  $('btn-som')?.addEventListener('click',      () => { toggleSom();           });

  $('btn-reset-progress')?.addEventListener('click', () => {
    const btn = $('btn-reset-progress');
    if (btn.dataset.confirming === 'true') {
      /* Segunda vez: executa o reset */
      clearProgress();
      notificar('Progresso apagado com sucesso.', 'sucesso');
      btn.textContent = 'Apagar progresso';
      btn.disabled = false;
      btn.dataset.confirming = 'false';
      btn.classList.remove('btn-danger-confirm');
    } else {
      /* Primeira vez: pede confirmação */
      btn.dataset.confirming = 'true';
      btn.textContent = 'Tem certeza? Clique de novo para confirmar';
      btn.classList.add('btn-danger-confirm');
      setTimeout(() => {
        if (btn.dataset.confirming === 'true') {
          btn.dataset.confirming = 'false';
          btn.textContent = 'Apagar progresso';
          btn.classList.remove('btn-danger-confirm');
        }
      }, 5000);
    }
  });
}
