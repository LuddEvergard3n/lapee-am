/**
 * ui/guia.js
 * Guia do Professor — LAPEE AM.
 *
 * Layout: sidebar sticky de 220px + área de conteúdo flex:1.
 * Navegação por âncoras internas com scroll-margin-top.
 * Cards de atividade com meta-tags, avisos e notas de dois níveis.
 * Linguagem imperativa e direta — o professor usa isso em tempo real de aula.
 */

/**
 * @param {HTMLElement} main
 */
export function renderGuia(main) {
  main.innerHTML = `
    <div class="guia-wrapper" aria-label="Guia do Professor">

      <!-- ===== SIDEBAR ===== -->
      <aside class="guia-sidebar" aria-label="Índice do guia">
        <div class="guia-sidebar-panel">

          <div class="guia-sec-group">Começando</div>
          <a class="guia-nav-link" href="#o-que-e">O que é o LAPEE AM</a>
          <a class="guia-nav-link" href="#para-quem">Para quem é</a>
          <a class="guia-nav-link" href="#estrutura">Como está organizado</a>

          <div class="guia-sec-group">Usando em sala</div>
          <a class="guia-nav-link" href="#modos-uso">Modos de uso</a>
          <a class="guia-nav-link" href="#selecionar">Selecionar uma atividade</a>
          <a class="guia-nav-link" href="#inclusao">Inclusão na prática</a>
          <a class="guia-nav-link" href="#painel-prof">Painel do professor</a>

          <div class="guia-sec-group">Atividades sugeridas</div>
          <a class="guia-nav-link" href="#ativ-1">1 — Exploração livre</a>
          <a class="guia-nav-link" href="#ativ-2">2 — Rotação por estações</a>
          <a class="guia-nav-link" href="#ativ-3">3 — Revisão com trilha</a>
          <a class="guia-nav-link" href="#ativ-4">4 — Avaliação diagnóstica</a>
          <a class="guia-nav-link" href="#ativ-5">5 — Pares mediadores</a>

          <div class="guia-sec-group">Referências</div>
          <a class="guia-nav-link" href="#bncc">BNCC e planejamento</a>
          <a class="guia-nav-link" href="#limitacoes">Limitações conhecidas</a>

        </div>
      </aside>

      <!-- ===== CONTEÚDO ===== -->
      <div class="guia-content">

        <!-- O que é -->
        <h2 id="o-que-e" class="guia-h2">O que é o LAPEE AM</h2>
        <p>O LAPEE AM é uma plataforma de atividades interativas para o Ensino Fundamental I, desenvolvida pelo Laboratório de Práticas Educativas e Extensão Amos Comenius. Funciona no navegador, sem instalação, sem conta, sem internet após o carregamento inicial.</p>
        <p>O acervo tem 180 atividades distribuídas em seis componentes curriculares — Língua Portuguesa, Matemática, Ciências, História, Geografia e Arte — cobrindo do 1º ao 5º ano. Cada habilidade é trabalhada em três níveis de profundidade, dentro de unidades temáticas alinhadas à BNCC.</p>
        <p>Cada atividade pode ser lida em voz alta pelo computador, respondida de formas diferentes (clicar, arrastar, escrever, gravar a voz, desenhar) e acompanhada por uma dica pedagógica. O professor tem acesso ao gabarito e às orientações de mediação sem que o aluno veja.</p>

        <!-- Para quem é -->
        <h2 id="para-quem" class="guia-h2">Para quem é</h2>
        <p>O LAPEE AM foi desenhado para ser usado por <strong>professores polivalentes do EF I</strong> com qualquer nível de familiaridade com tecnologia. A interface usa linguagem de criança — "Quero fazer atividades", "Ouvir", "Preciso de ajuda" — porque foi projetada para ser operada pelo aluno com autonomia.</p>
        <p>O professor não precisa criar conta, configurar nada ou aprender um sistema novo. Abre o site, escolhe o ano e a matéria, escolhe a atividade.</p>

        <div class="guia-nota">
          <strong>Para escolas sem internet estável:</strong> o site pode ser aberto uma vez enquanto há conexão e depois funciona na mesma aba sem precisar recarregar. Fechar e reabrir a aba requer conexão novamente.
        </div>

        <!-- Estrutura -->
        <h2 id="estrutura" class="guia-h2">Como está organizado</h2>
        <p>Cada componente curricular tem duas unidades temáticas por ano. Cada unidade tem três atividades, uma por nível:</p>

        <table class="guia-table">
          <thead>
            <tr><th>Nível</th><th>Nome</th><th>Quando usar</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="guia-badge guia-badge-n1">N1</span></td>
              <td><strong>Mais fácil</strong></td>
              <td>Introdução ao tema, alunos que precisam de mais apoio, revisão de conteúdo anterior</td>
            </tr>
            <tr>
              <td><span class="guia-badge guia-badge-n2">N2</span></td>
              <td><strong>Normal</strong></td>
              <td>Consolidação da habilidade, maioria da turma, uso padrão em aula</td>
            </tr>
            <tr>
              <td><span class="guia-badge guia-badge-n3">N3</span></td>
              <td><strong>Desafio</strong></td>
              <td>Ampliação para alunos adiantados, aprofundamento, atividade extra</td>
            </tr>
          </tbody>
        </table>

        <p>O progresso de cada aluno é salvo automaticamente no dispositivo. A trilha de estrelas na tela de atividades mostra o que já foi tentado (âmbar) e o que foi concluído (dourado). Os emblemas por matéria aparecem na página inicial quando todas as atividades do componente naquele ano são concluídas.</p>

        <!-- Modos de uso -->
        <h2 id="modos-uso" class="guia-h2">Modos de uso</h2>
        <p>A plataforma funciona bem em três configurações distintas:</p>

        <div class="guia-modos-grid">
          <div class="guia-modo-card">
            <div class="guia-modo-titulo">Projetor coletivo</div>
            <p>O professor projeta a atividade para a turma inteira. Os alunos respondem oralmente ou por votação de mãos. O professor clica a resposta. Funciona bem para introdução de tema e correção coletiva.</p>
          </div>
          <div class="guia-modo-card">
            <div class="guia-modo-titulo">Estação individual</div>
            <p>Um ou mais dispositivos disponíveis como estação de atividade. O aluno acessa sozinho enquanto outros fazem atividades impressas. Requer que o aluno saiba ler o enunciado, ou que o professor ative o botão "Ouvir".</p>
          </div>
          <div class="guia-modo-card">
            <div class="guia-modo-titulo">Rotação por duplas</div>
            <p>Dois alunos por dispositivo. Um responde, o outro observa e comenta. Inverte os papéis na próxima atividade. Gera conversa pedagógica e reduz o tempo de espera por dispositivo.</p>
          </div>
        </div>

        <!-- Selecionar atividade -->
        <h2 id="selecionar" class="guia-h2">Selecionar uma atividade</h2>
        <p>Acesse <strong>Atividades</strong> no menu lateral. Escolha o ano e a matéria nos dois menus. As unidades aparecem com a trilha de estrelas indicando o progresso. Clique no nível desejado para abrir a atividade.</p>
        <p>O código BNCC da habilidade aparece como uma etiqueta cinza no topo da tela de atividade — útil para alinhar com o seu planejamento sem precisar consultar a BNCC separadamente.</p>

        <div class="guia-aviso">
          <strong>Atenção:</strong> o progresso fica salvo no navegador do dispositivo. Se o aluno trocar de computador ou de navegador, o progresso não acompanha. Para recomeçar do zero num mesmo dispositivo, acesse <strong>Acessibilidade → Apagar progresso</strong>.
        </div>

        <!-- Inclusão na prática -->
        <h2 id="inclusao" class="guia-h2">Inclusão na prática</h2>
        <p>O LAPEE AM foi projetado para que a mesma atividade sirva a alunos neurotípicos e neurodivergentes sem que nenhum precise de uma versão separada. Isso funciona assim na prática:</p>

        <table class="guia-table">
          <thead>
            <tr><th>Situação</th><th>O que usar</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Aluno com dificuldade de leitura</td>
              <td>Botão <strong>"Ouvir"</strong> — lê o enunciado em voz alta. Disponível em todas as atividades.</td>
            </tr>
            <tr>
              <td>Aluno com dificuldade motora</td>
              <td>Atividades de marcar e ordenar funcionam com clique simples. Atividade de arrastar tem alternativa por clique sequencial (sem arrastar).</td>
            </tr>
            <tr>
              <td>Aluno com baixo aproveitamento</td>
              <td>Comece pelo N1. O feedback de erro diz "Quase! Tenta de novo." — sem mensagem punitiva. A dica orienta sem entregar a resposta.</td>
            </tr>
            <tr>
              <td>Aluno adiantado</td>
              <td>Direto para o N3. Se terminar, pode fazer o N3 de outra unidade ou componente.</td>
            </tr>
            <tr>
              <td>Aluno com ansiedade de desempenho</td>
              <td>Não há timer, não há placar público, não há consequência pelo erro. O aluno pode tentar quantas vezes quiser.</td>
            </tr>
            <tr>
              <td>Aluno com baixa visão</td>
              <td>Em <strong>Acessibilidade</strong>: Letra maior, Alto contraste ou Fundo escuro — salvos automaticamente.</td>
            </tr>
          </tbody>
        </table>

        <!-- Painel do professor -->
        <h2 id="painel-prof" class="guia-h2">Painel do professor</h2>
        <p>Em qualquer atividade, o botão <strong>"Para o professor"</strong> (canto superior direito) abre um painel com:</p>
        <ul class="guia-lista">
          <li><strong>Objetivo pedagógico</strong> — o que o aluno vai aprender nesta atividade específica.</li>
          <li><strong>Gabarito</strong> — a resposta correta, com explicação.</li>
          <li><strong>Perguntas orientadoras</strong> — perguntas que o professor pode fazer para mediar sem entregar a resposta.</li>
          <li><strong>Tempo estimado</strong> — quanto tempo a atividade leva em média.</li>
          <li><strong>Adaptação do nível</strong> — o que muda neste nível em relação aos outros.</li>
        </ul>
        <p>O painel não aparece para o aluno. Clicar no botão novamente fecha o painel sem interromper o andamento da atividade.</p>

        <!-- Atividade 1 -->
        <div class="guia-atividade" id="ativ-1">
          <div class="guia-atv-header">
            <span class="guia-atv-num">Ativ. 1</span>
            <span class="guia-atv-titulo">Exploração livre com mediação</span>
          </div>
          <div class="guia-atv-body">
            <div class="guia-atv-meta">
              <span class="guia-meta-tag"><strong>Ano:</strong> 1º ao 5º</span>
              <span class="guia-meta-tag"><strong>Duração:</strong> 15–25 min</span>
              <span class="guia-meta-tag"><strong>Modo:</strong> Individual ou duplas</span>
            </div>
            <p>O aluno escolhe a matéria e o nível. Faz a atividade sozinho enquanto o professor circula e observa. A cada 3–4 minutos, o professor para junto de uma dupla e pergunta: "Como você pensou nisso?" ou "O que a dica disse?"</p>
            <p>Ao final, reúna a turma e pergunte: "Qual atividade foi mais difícil? Por quê?" Anote as habilidades que geraram mais erros — isso guia a aula seguinte.</p>
            <p><strong>Variante:</strong> peça que o aluno leia o enunciado em voz alta antes de responder. Útil para avaliar fluência de leitura e compreensão ao mesmo tempo.</p>
          </div>
        </div>

        <!-- Atividade 2 -->
        <div class="guia-atividade" id="ativ-2">
          <div class="guia-atv-header">
            <span class="guia-atv-num">Ativ. 2</span>
            <span class="guia-atv-titulo">Rotação por estações</span>
          </div>
          <div class="guia-atv-body">
            <div class="guia-atv-meta">
              <span class="guia-meta-tag"><strong>Ano:</strong> 2º ao 5º</span>
              <span class="guia-meta-tag"><strong>Duração:</strong> 30–40 min</span>
              <span class="guia-meta-tag"><strong>Modo:</strong> Grupos rotativas</span>
            </div>
            <p>Monte três estações: (1) LAPEE AM com uma atividade pré-selecionada aberta no dispositivo, (2) atividade impressa, (3) leitura ou manipulação de material concreto. Grupos de 4–5 alunos rodam pelas estações a cada 10–12 minutos com sinal sonoro.</p>
            <p>Pré-selecione a atividade e o nível antes da aula: abra a página da atividade e deixe ela na tela. Na troca de grupos, o professor reset a atividade (basta recarregar a aba ou navegar de volta pelo menu).</p>
            <p><strong>Dica:</strong> na estação do LAPEE AM, cole um post-it na tela com a instrução: "Faça a atividade que está na tela. Se errar, tente de novo antes de pedir ajuda." Reduz interrupções.</p>
            <p><strong>Variante:</strong> em vez de rotação por tempo, rotação por conclusão — o grupo passa para a próxima estação quando termina a atividade do LAPEE AM. Requer um nível mais curto (N1 ou N2).</p>
          </div>
        </div>

        <!-- Atividade 3 -->
        <div class="guia-atividade" id="ativ-3">
          <div class="guia-atv-header">
            <span class="guia-atv-num">Ativ. 3</span>
            <span class="guia-atv-titulo">Revisão com trilha de estrelas</span>
          </div>
          <div class="guia-atv-body">
            <div class="guia-atv-meta">
              <span class="guia-meta-tag"><strong>Ano:</strong> 3º ao 5º</span>
              <span class="guia-meta-tag"><strong>Duração:</strong> 20–30 min</span>
              <span class="guia-meta-tag"><strong>Modo:</strong> Individual ou duplas</span>
            </div>
            <p>Use antes de uma avaliação formal. Proponha uma meta: "Hoje vamos tentar acender pelo menos duas estrelas douradas na matéria de Matemática." Mostre na tela projetada como a trilha de estrelas funciona.</p>
            <p>O aluno escolhe por onde começa. Quem já tem estrelas douradas em tudo pode tentar outro componente ou ajudar um colega como "tutor". Ao final, pergunte: "Em qual atividade você acha que precisa estudar mais antes da prova?"</p>
            <p><strong>Variante:</strong> o professor define a unidade (ex.: "hoje todo mundo faz a unidade 2 de Ciências"). Remove a escolha para focar no conteúdo específico da avaliação que se aproxima.</p>
          </div>
        </div>

        <!-- Atividade 4 -->
        <div class="guia-atividade" id="ativ-4">
          <div class="guia-atv-header">
            <span class="guia-atv-num">Ativ. 4</span>
            <span class="guia-atv-titulo">Avaliação diagnóstica de entrada</span>
          </div>
          <div class="guia-atv-body">
            <div class="guia-atv-meta">
              <span class="guia-meta-tag"><strong>Ano:</strong> 1º ao 5º</span>
              <span class="guia-meta-tag"><strong>Duração:</strong> 15–20 min</span>
              <span class="guia-meta-tag"><strong>Modo:</strong> Individual silencioso</span>
            </div>
            <p>No início de uma unidade, peça que todos façam o N2 de uma habilidade específica sem ajuda e sem usar o botão "Preciso de ajuda". O professor circula e anota quem consegue responder corretamente na primeira tentativa e quem erra repetidamente.</p>
            <p>Essa observação — não a estrela na tela — é a avaliação diagnóstica. Quem acerta de primeira provavelmente já tem a habilidade e pode ir direto para o N3. Quem erra indica onde concentrar a instrução direta.</p>
            <p><strong>Importante:</strong> não use o progresso salvo na plataforma como nota formal. O aluno pode tentar várias vezes — a estrela dourada indica conclusão, não domínio na primeira tentativa.</p>
          </div>
        </div>

        <!-- Atividade 5 -->
        <div class="guia-atividade" id="ativ-5">
          <div class="guia-atv-header">
            <span class="guia-atv-num">Ativ. 5</span>
            <span class="guia-atv-titulo">Pares mediadores</span>
          </div>
          <div class="guia-atv-body">
            <div class="guia-atv-meta">
              <span class="guia-meta-tag"><strong>Ano:</strong> 2º ao 5º</span>
              <span class="guia-meta-tag"><strong>Duração:</strong> 25–35 min</span>
              <span class="guia-meta-tag"><strong>Modo:</strong> Duplas heterogêneas</span>
            </div>
            <p>Forme duplas com níveis diferentes. O aluno mais avançado atua como "mediador" — não pode responder pela dupla, só pode fazer perguntas. Instrua explicitamente: "Você não pode falar a resposta. Pode perguntar: 'O que você leu? O que a dica diz?'"</p>
            <p>Abra o painel do professor e mostre as perguntas orientadoras ao mediador antes de começar. Ele usa essas perguntas como roteiro de mediação.</p>
            <p><strong>Variante:</strong> o mediador faz a atividade de N3 enquanto o colega faz o N1 da mesma habilidade. Depois trocam: o mediador explica como pensou no N3, o outro explica como fez o N1. A diferença entre os níveis se torna objeto de conversa.</p>
            <div class="guia-nota">
              Esta atividade exige que os alunos tenham alguma familiaridade prévia com a plataforma. Não use na primeira semana.
            </div>
          </div>
        </div>

        <!-- BNCC -->
        <h2 id="bncc" class="guia-h2">BNCC e planejamento</h2>
        <p>Cada atividade está vinculada a um código de habilidade BNCC exibido na tela como etiqueta cinza. O código é um metadado de classificação — não uma prescrição. Você não precisa fazer as atividades na ordem dos códigos nem cobrir todas as habilidades.</p>
        <p>Para usar no planejamento: identifique as habilidades da sua sequência didática, localize os códigos correspondentes na BNCC, e busque esses códigos nas atividades. A plataforma não tem busca por código — use o navegador (Ctrl+F na tela de navegação) ou acesse pelo menu de componente e ano.</p>
        <p>O campo <strong>"Para o professor"</strong> mostra o objetivo pedagógico em linguagem simples, sem o código BNCC. Use esse texto para comunicar a proposta da atividade ao aluno ou registrar no diário de classe.</p>
        <p>O gerador de <strong>Planos de Aula</strong> (menu lateral) permite criar planos completos selecionando habilidades BNCC reais por componente e ano, com presets pedagógicos para objetivos, metodologia, recursos e avaliação.</p>

        <!-- Limitações -->
        <h2 id="limitacoes" class="guia-h2">Limitações conhecidas</h2>

        <div class="guia-aviso">
          Comunique as limitações abaixo aos alunos antes de começar. Saber o que a ferramenta não faz é parte do letramento digital.
        </div>

        <ul class="guia-lista">
          <li><strong>Progresso por dispositivo.</strong> O progresso fica no navegador do computador usado. Trocar de máquina apaga o histórico. Em laboratórios de informática com usuários compartilhados, isso é um problema — apague o progresso após cada turma em Acessibilidade → Apagar progresso.</li>
          <li><strong>Sem conta, sem sincronia.</strong> Não há perfil de aluno. Não é possível acompanhar o progresso de uma turma inteira de forma centralizada. Use a observação direta durante as atividades como instrumento de acompanhamento.</li>
          <li><strong>Voz depende do navegador.</strong> O botão "Ouvir" usa a voz do sistema operacional. Em computadores antigos ou Linux sem voz instalada, pode não funcionar. Verifique antes da aula.</li>
          <li><strong>Sem acesso offline completo.</strong> O site precisa de internet para carregar. Depois de carregado, funciona sem conexão até a aba ser fechada ou a página recarregada.</li>
          <li><strong>Arte no N3 é desenho livre.</strong> Atividades de Arte no nível 3 de cada unidade usam um canvas de pintura. Não há avaliação automática — o professor avalia visualmente e clica em "Terminei meu desenho" quando o aluno concluir.</li>
        </ul>

      </div><!-- /guia-content -->
    </div><!-- /guia-wrapper -->
  `;

  /* Scroll suave para âncoras internas */
  main.querySelectorAll('.guia-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      const target = main.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* Marcar link ativo ao scrollar */
  const headings = main.querySelectorAll('h2[id], .guia-atividade[id]');
  const links    = main.querySelectorAll('.guia-nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
      });
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  headings.forEach(h => observer.observe(h));

  /* Desconectar observer ao navegar para outra página */
  window.addEventListener('hashchange', () => observer.disconnect(), { once: true });
}
