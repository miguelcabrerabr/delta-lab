# Delta Lab — Escola de opções

Projeto aberto sob a [licença MIT](LICENSE). Veja [como contribuir](CONTRIBUTING.md) para conhecer o fluxo de branches, testes e pull requests.

Plataforma de estudo em português brasileiro, com conteúdo original e experimentos financeiros executados no próprio dispositivo. Sem backend, login, CDN, telemetria, APIs de mercado ou dependências pagas.

## Abrir e estudar

Abra **`ABRIR.html`** com um navegador moderno, ou abra diretamente **`dist/index.html`**. O arquivo em `dist` é autocontido: pode ser copiado para outro computador e aberto sem internet. Os links de referência são a única parte que precisa de conexão.

Se o aplicativo de arquivos apenas mostrar o código HTML, use “Abrir com” e selecione seu navegador. Extraia o ZIP antes de usar a versão com código-fonte.

Comece pelo diagnóstico, siga a aula recomendada e pratique no laboratório associado. A navegação é livre. Registre uma aula como lida separadamente de resolver seus exercícios. O domínio considera as últimas respostas para cada questão objetiva única, com critério de pelo menos 80%; questões abertas não recebem nota automática.

Em **Meu progresso**, exporte um backup JSON regularmente. A importação valida a estrutura e substitui o histórico local pelo backup. O armazenamento pertence ao navegador/origem; trocar de navegador, limpar os dados ou mudar o caminho do HTML pode criar um espaço de progresso diferente. Se o navegador bloquear o armazenamento, a interface avisa e permite exportar o estado em memória.

## Conteúdo e ferramentas

- 9 módulos e 27 aulas: fundamentos, não arbitragem, estratégias, precificação, gregas, volatilidade, hedge, exóticas e aplicação profissional.
- 135 questões originais: conceituais, numéricas e casos abertos com rubricas. Algumas questões numéricas variam parâmetros e recalculam respostas em novas tentativas.
- Diagnóstico, quizzes por aula, provas por módulo, avaliação final, histórico, revisão de erros e revisão espaçada.
- Busca de aulas e glossário; formulário de referência; modo de foco; navegação por teclado; layout responsivo.
- Construtor com ação/call/put, até 12 pernas, quantidades assinadas, multiplicadores explícitos e 22 templates. Curvas de P&L e valor bruto, breakevens e limites analíticos por trechos.
- BSM, CRR europeia/americana, IV por bisseção e Monte Carlo com erro padrão e intervalo de confiança.
- Gregas de primeira e segunda ordem; curvas por spot, prazo e volatilidade.
- Stress de carteira por spot × volatilidade, passagem do tempo e erro da aproximação por gregas.
- Hedge delta reproduzível por semente, rebalanceamento, juros, dividendos, custos e CSV dos fluxos.
- Barreiras: dois caminhos com o mesmo terminal, identificação do toque e payoff condicionado à ativação/extinção.

Consulte `docs/CURRICULUM.md` para o mapa curricular e as referências. Todos os preços, clientes e caminhos são fictícios.

## Convenções e limites concretos

1. **Bibliografia:** não foram encontrados PDFs do Hull ou do Natenberg no projeto. Os livros são referências temáticas, sem páginas/capítulos inventados ou alegação de consulta integral. Fontes públicas primárias complementam o material. O curso não substitui o texto completo dos livros.
2. **Tempo e taxas:** laboratórios usam dias corridos/365, taxas contínuas e dividend yield contínuo constante. Não há calendário de feriados B3, curva de juros, dividendos discretos nem ajuste automático de séries. A cotação/multiplicador deve ser conferida no contrato real.
3. **BSM:** europeu e lognormal, volatilidade constante. A árvore CRR permite exercício em cada nó, com yield contínuo. Para vol muito baixa, a probabilidade da árvore pode sair de [0,1]; o erro é exibido, sem truncar artificialmente a probabilidade.
4. **Unidades:** theta por dia corrido; vega e rho por 1 ponto percentual; vanna/volga por volatilidade em decimal e charm por ano de calendário. Gregas de fronteira no vencimento/vol zero são convenções de exibição, não derivadas suaves.
5. **Calendars e diagonais:** cenários vão até o primeiro vencimento e reprecificam as pernas vivas a BSM com as mesmas premissas. Não há um payoff final único em função de apenas um spot para uma carteira com datas distintas. Ganho máximo, perda máxima e breakevens globais não são anunciados nesse caso.
6. **Estratégias:** P&L é valor bruto menos desembolso inicial nominal. Exclui juros sobre prêmio, dividendos recebidos da ação, custos de execução, margem e exercício antecipado. Essas contas são explicitadas separadamente no hedge. Templates usam prêmios ilustrativos, que podem não ser consistentes entre si com uma superfície de mercado.
7. **Hedge:** um único caminho GBM, sem jumps, liquidez, borrow fee separado, margem, impacto de mercado nem spreads dinâmicos. Custo proporcional em bps aproxima comissão/slippage. Caixa recebe/paga a mesma taxa r. Dividendos são aproximados por yield a cada passo. O saldo final inclui financiamento dos custos.
8. **Barreiras:** simulador de payoff, sem preço ou probabilidades de mercado. Monitoramento discreto em 61 observações, incluindo início e fim; igualdade é toque. Rebate pago no vencimento se a opção estiver inativa. Não detecta toques entre observações nem modela monitoramento contínuo.
9. **Superfície/exóticas:** local vol, volatilidade estocástica, asiáticas, lookbacks e autocallables são ensinados com teoria, cálculos e casos; não há calibrador de superfície nem precificador de todos esses produtos.
10. **Avaliação:** gabarito oculto pela interface até a entrega; trata-se de estudo local, sem proteção contra inspeção do código. Casos abertos são autoavaliados. Não há IA conectada, certificação ou sincronização entre dispositivos. Uma prova ainda não entregue é mantida somente na sessão, sem sobreviver a recarga.

## Código e execução

Requer Node.js 20+ apenas para desenvolvimento/testes/servidor opcional. Para estudar, basta o HTML pronto.

```text
node scripts/build.js
node --test tests/*.test.js
node scripts/serve.js
```

O servidor opcional escuta apenas em `127.0.0.1:4173`. Use `PORT` para mudar a porta. Interrompa com Ctrl+C. O build não instala nada e não depende de npm.

```text
src/finance.js       motor financeiro puro, também importável por Node
src/progress.js      persistência, correção e variantes de questões
src/curriculum.js    conteúdo, questões, glossário, fórmulas e fontes
src/ui.js            gráficos SVG, campos e utilitários visuais
src/labs.js          seis laboratórios e templates de estratégias
src/app.js           rotas, trilha, avaliações e gestão de progresso
src/styles.css      identidade visual e regras responsivas
index.html          entrada de desenvolvimento
dist/index.html     versão autocontida pronta para uso
tests/              testes financeiros, progresso, conteúdo e build
docs/               mapa curricular e registro de validação
```

Depois de editar o código ou o conteúdo, execute o build para atualizar a versão autocontida. Não edite `dist/index.html` manualmente.

## Validação

O registro dos testes executados e da verificação de interface está em `docs/VALIDATION.md`. Os testes automatizados usam o runner nativo do Node. O relatório distingue testes de cálculo, integridade de conteúdo e interações verificadas no navegador.
