# Delta Lab — Mapa curricular e referências

27 aulas, 135 questões originais, seis laboratórios. Cada aula tem teoria, fórmula, exemplo resolvido e aplicação na mesa.

Os PDFs do Hull e do Natenberg não estavam no projeto. As referências aos livros são temáticas.

## Trilha

### 01 · Fundamentos

Contratos, direitos, fluxos e a mecânica que vem antes do modelo.

- **Contratos: da ação à opção** (30 min) — Distinguir propriedade, obrigação e direito. Identificar os fluxos de forwards, futuros, swaps, calls e puts. Separar payoff de resultado financeiro. Pré-requisitos: nenhum. Laboratório: strategy.
- **Exercício, moneyness e valor temporal** (35 min) — Classificar ITM, ATM e OTM. Entender por que uma opção ITM pode dar prejuízo. Distinguir estilo de exercício e valor de continuação. Pré-requisitos: Contratos: da ação à opção. Laboratório: calculator.
- **Liquidação, multiplicador e risco operacional** (30 min) — Converter cotação em exposição monetária. Diferenciar prêmio, margem e garantia. Separar convenções brasileiras e conceitos universais. Pré-requisitos: Contratos: da ação à opção, Exercício, moneyness e valor temporal. Laboratório: strategy.

### 02 · Não arbitragem

Carregamento, replicação, paridade e a distância entre teoria e execução.

- **Taxas, dividendos e custo de carregamento** (40 min) — Converter convenções de taxa. Calcular forward com yield ou dividendos discretos. Distinguir preço de entrega e valor de contrato. Pré-requisitos: Liquidação, multiplicador e risco operacional. Laboratório: calculator.
- **Paridade put–call, limites e sintéticos** (40 min) — Derivar paridade por fluxos terminais. Testar limites de preços europeus. Construir ação e forward sintéticos. Pré-requisitos: Taxas, dividendos e custo de carregamento, Exercício, moneyness e valor temporal. Laboratório: calculator.
- **Boxes, conversões e a arbitragem executável** (40 min) — Decompor box, conversão e reversão. Calcular taxa implícita. Reconhecer restrições de funding e exercício. Pré-requisitos: Paridade put–call, limites e sintéticos. Laboratório: strategy.

### 03 · Estratégias

Transforme uma tese de mercado em uma distribuição de resultados.

- **Proteção e exposição direcional** (45 min) — Comparar calls/puts compradas e vendidas. Montar covered call, protective put e collar. Escolher uma vertical para uma tese limitada. Pré-requisitos: Paridade put–call, limites e sintéticos. Laboratório: strategy.
- **Convexidade: straddles, strangles e asas** (45 min) — Interpretar estruturas de volatilidade. Calcular breakevens de straddle e strangle. Distinguir butterfly, condor e iron condor. Pré-requisitos: Proteção e exposição direcional. Laboratório: strategy.
- **Calendars, diagonals, ratios e backspreads** (45 min) — Ler uma carteira com vencimentos distintos. Identificar riscos ilimitados em ratios. Separar payoff conhecido de valor residual modelado. Pré-requisitos: Convexidade: straddles, strangles e asas, Boxes, conversões e a arbitragem executável. Laboratório: strategy.

### 04 · Precificação

Da árvore de replicação à volatilidade implícita e ao Monte Carlo.

- **Replicação, árvore binomial e exercício antecipado** (50 min) — Construir uma carteira replicante de um passo. Interpretar probabilidade neutra ao risco. Aplicar indução para trás e decisão americana. Pré-requisitos: Paridade put–call, limites e sintéticos. Laboratório: calculator.
- **Processos estocásticos, Itô e Black–Scholes–Merton** (60 min) — Relacionar GBM, log-retorno e variância. Entender a correção de Itô e a eliminação do drift. Aplicar BSM e reconhecer suas hipóteses. Pré-requisitos: Replicação, árvore binomial e exercício antecipado. Laboratório: calculator.
- **Volatilidade implícita, métodos numéricos e Monte Carlo** (55 min) — Inverter BSM com limites e tolerâncias. Comparar bisseção e Newton. Estimar erro amostral de Monte Carlo. Pré-requisitos: Processos estocásticos, Itô e Black–Scholes–Merton. Laboratório: calculator.

### 05 · Gregas e risco

Unidades, não linearidade e cenários de uma carteira.

- **Delta, gamma, theta, vega e rho: unidades primeiro** (45 min) — Interpretar derivadas como sensibilidades locais. Converter vega/rho em pontos percentuais. Usar theta por dia com convenção explícita. Pré-requisitos: Processos estocásticos, Itô e Black–Scholes–Merton. Laboratório: greeks.
- **Carteiras, vanna, volga e charm** (50 min) — Agregar gregas por posição e vencimento. Interpretar sensibilidades cruzadas. Entender por que hedge estático envelhece. Pré-requisitos: Delta, gamma, theta, vega e rho: unidades primeiro, Calendars, diagonals, ratios e backspreads. Laboratório: greeks.
- **Atribuição de P&L e matriz de stress** (50 min) — Construir aproximação delta–gamma–vega–theta. Comparar com reprecificação completa. Explicar residual e cenários de liquidez. Pré-requisitos: Carteiras, vanna, volga e charm. Laboratório: stress.

### 06 · Volatilidade

Mensuração, superfície, eventos e prêmio pelo risco de cauda.

- **Histórica, realizada e implícita: três perguntas** (45 min) — Calcular volatilidade de log-retornos. Anualizar variância de forma consistente. Comparar IV com realizada sem confundir medidas. Pré-requisitos: Volatilidade implícita, métodos numéricos e Monte Carlo. Laboratório: greeks.
- **Smile, skew, curva a termo e eventos** (50 min) — Ler IV por strike e vencimento. Decompor variância de evento. Distinguir sticky strike e sticky delta. Pré-requisitos: Histórica, realizada e implícita: três perguntas, Carteiras, vanna, volga e charm. Laboratório: stress.
- **Superfície sem arbitragem e modelos além de BSM** (55 min) — Testar monotonicidade e convexidade em strike. Entender volatilidade local e estocástica. Interpretar prêmio de risco de volatilidade. Pré-requisitos: Smile, skew, curva a termo e eventos, Volatilidade implícita, métodos numéricos e Monte Carlo. Laboratório: stress.

### 07 · Hedge e negociação

A conta financeira por trás do delta hedge e do gamma scalping.

- **Delta hedge e a conta de caixa autofinanciada** (50 min) — Montar hedge de uma opção vendida. Contabilizar prêmio, ações, juros e custos. Comparar posição hedgeada e descoberta. Pré-requisitos: Atribuição de P&L e matriz de stress. Laboratório: hedge.
- **Gamma scalping: movimento comprado, tempo vendido** (50 min) — Relacionar gamma, theta e variância realizada. Entender o sentido dos rebalanceamentos. Calcular o impacto de custos sobre scalping. Pré-requisitos: Delta hedge e a conta de caixa autofinanciada, Histórica, realizada e implícita: três perguntas. Laboratório: hedge.
- **Gaps, liquidez e controle da mesa** (45 min) — Separar neutralidade local e sobrevivência em stress. Reconhecer risco de execução e basis hedge. Construir limites e atribuição de P&L. Pré-requisitos: Gamma scalping: movimento comprado, tempo vendido, Atribuição de P&L e matriz de stress. Laboratório: stress.

### 08 · Exóticas e estruturados

Dependência do caminho, barreiras e decomposição de fluxos.

- **Digitais, barreiras e o valor do caminho** (50 min) — Distinguir digital, knock-in e knock-out. Interpretar toque, rebate e monitoramento. Separar simulador de payoff e modelo de preço. Pré-requisitos: Volatilidade implícita, métodos numéricos e Monte Carlo, Atribuição de P&L e matriz de stress. Laboratório: barrier.
- **Asiáticas, lookbacks e risco de monitoramento** (50 min) — Calcular payoffs por média e extremos. Distinguir média aritmética e geométrica. Identificar viés de discretização e path dependence. Pré-requisitos: Digitais, barreiras e o valor do caminho. Laboratório: barrier.
- **Autocallables e cupons condicionais** (55 min) — Ler a ordem dos eventos de um term sheet. Decompor nota, cupons e exposição de queda. Explicar reinvestimento, crédito e barreiras. Pré-requisitos: Asiáticas, lookbacks e risco de monitoramento, Calendars, diagonals, ratios e backspreads. Laboratório: barrier.

### 09 · Aplicação profissional

Casos de cliente, comunicação de risco e defesa de uma estrutura.

- **Caso de cliente: proteger sem perder a tese** (55 min) — Traduzir necessidade em restrições de payoff. Comparar alternativas com a mesma base econômica. Comunicar custo, cenário e limitação. Pré-requisitos: Calendars, diagonals, ratios e backspreads, Atribuição de P&L e matriz de stress. Laboratório: strategy.
- **Caso de mesa: resultado corporativo e risco escondido** (55 min) — Confrontar tese de evento com preço implícito. Comparar estruturas com risco delimitado. Construir uma defesa com cenários adversos. Pré-requisitos: Superfície sem arbitragem e modelos além de BSM, Gaps, liquidez e controle da mesa. Laboratório: stress.
- **Caso integrador: do term sheet à decisão defendida** (65 min) — Auditar premissas e comparar alternativas. Escrever uma recomendação defensável no exercício. Separar cálculo, julgamento e incerteza. Pré-requisitos: Caso de cliente: proteger sem perder a tese, Caso de mesa: resultado corporativo e risco escondido, Autocallables e cupons condicionais. Laboratório: strategy.

## Referências

- [John C. Hull · Options, Futures, and Other Derivatives](https://www-2.rotman.utoronto.ca/~hull/) — Referência temática: fundamentos, não arbitragem, árvores, BSM, gregas, volatilidade e exóticas. Não havia PDF no projeto; edição, capítulos e páginas não foram verificados. Não se afirma consulta integral.
- [Sheldon Natenberg · Option Volatility and Pricing](https://www.mheducation.com/highered/mhp/product/option-volatility-pricing-advanced-trading-strategies-techniques-2nd-edition.html) — Referência temática para volatilidade, estratégias, gregas e hedge. Não havia PDF no projeto; não se atribuem números de capítulos/páginas nem consulta integral. Conteúdo da plataforma é original.
- [B3 · Opções sobre Ações](https://www.b3.com.br/pt_br/produtos-e-servicos/negociacao/renda-variavel/opcoes-sobre-acoes.htm) — Página oficial consultada em 16/11/2026 para estilo, unidade de cotação, vencimento mensal e exercício. Confirmar sempre série e regras vigentes; a plataforma não replica o sistema operacional da B3.
- [B3 · Opções Semanais sobre Ações](https://www.b3.com.br/pt_br/produtos-e-servicos/negociacao/renda-variavel/opcoes-semanais-sobre-acoes.htm) — Fonte oficial consultada em 16/11/2026: vencimentos semanais nas sextas-feiras, exceto a terceira sexta-feira destinada ao mensal, sujeitos ao calendário e às séries.
- [B3 · Calendário de vencimentos de opções](https://www.b3.com.br/main.jsp?lumA=1&lumII=8A80CB81633FBF0B016340EBEC880DCF&lumPageId=8A6882694E91F2D4014E92D6BA5C158F) — Fonte oficial de consulta de datas; nenhum calendário fixo de negociação foi embutido nos simuladores. Consultada em 16/11/2026.
- [B3 · Manual de Operações — Opções Flexíveis](https://www.b3.com.br/data/files/EB/E1/7D/6C/CF3D4810F534EB48AC094EA8/OPCOES%20FLEXIVEIS.pdf) — Referência operacional pública temática. O contrato real, sua versão vigente e suas condições específicas prevalecem sobre os exemplos fictícios da plataforma.
- [OIC/OCC · Options Pricing](https://www.optionseducation.org/optionsoverview/options-pricing) — Aprofundamento público sobre componentes de preço. Convenções operacionais americanas não devem ser importadas automaticamente para a B3.
- [OIC/OCC · Put/Call Parity](https://www.optionseducation.org/advancedconcepts/put-call-parity) — Fonte pública consultada para relação de preços e sintéticos. As derivações e exemplos numéricos aqui são originais e especificam suas hipóteses.
- [OIC/OCC · All Strategies](https://www.optionseducation.org/strategies/all-strategies-en) — Catálogo público de estratégias para aprofundamento; o curso constrói seus próprios exemplos e demonstrações de payoff.
- [OIC/OCC · Choosing the Right Strategy](https://www.optionseducation.org/strategies/choosing-the-right-strategy) — Aprofundamento sobre alinhamento entre estratégia, risco e plano de negociação. Casos da plataforma são fictícios.
- [OIC/OCC · Volatility & the Greeks](https://www.optionseducation.org/advancedconcepts/volatility-the-greeks) — Aprofundamento conceitual; as convenções de unidade da plataforma são declaradas explicitamente em cada laboratório.
- [OIC/OCC · Technical Information](https://www.optionseducation.org/referencelibrary/faq/technical-information) — FAQ público sobre questões técnicas e skew. Usado como referência complementar, não como substituto das hipóteses matemáticas.
- [MIT OpenCourseWare · Lecture 19: Itô applications](https://ocw.mit.edu/courses/15-070j-advanced-stochastic-processes-fall-2013/e6475916fcc87c2850db29b3a1dd27e2_MIT15_070JF13_Lec19.pdf) — Notas universitárias públicas, curso Advanced Stochastic Processes (2013), para aprofundar a conexão entre Itô, replicação e BSM.
- [MIT OpenCourseWare · Analytics of Finance — Lecture Notes](https://ocw.mit.edu/courses/15-450-analytics-of-finance-fall-2010/pages/lecture-notes/) — Índice público com notas de cálculo estocástico, métodos de simulação e modelos. Referência temática para estudo adicional.
- [Karl Sigman, Columbia · Binomial Lattice Model](https://www.columbia.edu/~ks20/6712-14/6712-14-Notes-BLM.pdf) — Notas originais de ensino (2014) para aprofundamento em árvores, replicação e precificação.
- [Martin Haugh, Columbia · Monte Carlo Simulation and Variance Reduction](https://www.columbia.edu/~mh2078/MonteCarlo/MCS_Basic_VarRed_MasterSlides.pdf) — Material universitário público sobre simulação, redução de variância e opções de barreira; exemplos desta plataforma são originais.
- [Cboe · Volatility Insights — VIX Decomposition (01/08/2025)](https://cdn.cboe.com/resources/vix/VIX-Decomposition-2025-08-01.pdf) — Referência pública de aplicação de fatores de superfície, incluindo sticky strike. Não é fonte de cotação atual nem descrição universal de dinâmica.
- [Cboe · Embracing and Harnessing Volatility](https://www.cboe.com/insights/posts/embracing-and-harnessing-volatility-feeling-confident-in-your-strategy/) — Discussão pública de prêmio de risco de volatilidade. Resultados históricos citados pela fonte não foram reproduzidos como promessa de desempenho.
