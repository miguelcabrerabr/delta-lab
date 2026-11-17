# Contribuindo com o Delta Lab

Correções nos cálculos, melhorias nas aulas, novos exercícios e ajustes de acessibilidade são bem-vindos. Para discutir uma mudança maior, abra uma issue com o comportamento atual e o resultado esperado.

## Branches

| Branch | Finalidade |
| --- | --- |
| `main` | Versão estável, com código, conteúdo, testes e HTML pronto para uso. |
| `feat/<tema>` | Nova funcionalidade ou laboratório. |
| `fix/<tema>` | Correção de cálculo, comportamento ou interface. |
| `docs/<tema>` | Mudança de aula, referência ou documentação. |

Apenas `main` é permanente. Use um fork e crie sua branch a partir dela. Abra um pull request para `main` com a motivação, um exemplo concreto e os testes executados.

## Verificação local

Use Node.js 20 ou superior. O projeto funciona sem instalar dependências.

```sh
node scripts/build.js
node --test tests/*.test.js
```

Quando mudar um cálculo, inclua um caso com resultado esperado e explique as unidades e as hipóteses. Ao mudar uma aula, preserve a distinção entre exemplos fictícios e regras operacionais, cite fontes primárias quando possível e escreva conteúdo original. Quando mudar a interface, abra o HTML em um navegador e confira a interação afetada. Inclua o HTML gerado atualizado se a mudança o afetar.

As contribuições são distribuídas sob a licença MIT. Os materiais externos vinculados nas referências mantêm seus próprios direitos e licenças.
