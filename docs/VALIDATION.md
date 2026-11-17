# Validação

`node scripts/build.js` gerou o HTML autocontido. `node --test tests/*.test.js` executou 25 testes com sucesso, incluindo preços de referência, paridade, limites, gregas, IV, árvore, estratégias, hedge, barreiras, progresso e integridade curricular.

No navegador integrado, verifiquei cálculos e controles dos seis laboratórios, calendar com valor residual, validação de horizonte, busca, leitura, entrega e correção de quiz, persistência após recarga, exportação e restauração JSON e ajuste do layout em viewport móvel. As provas por módulo e final usam o mesmo fluxo de avaliação, mas não foram respondidas integralmente no navegador. Não houve teste em telefone físico.
