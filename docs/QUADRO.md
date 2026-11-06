# Quadro de Acompanhamento — SGC SEPLAG

> Quadro visual de referência para acompanhamento do MVP. As atividades detalhadas e os critérios de aceite permanecem nas issues vinculadas.

## Fluxo de trabalho

| Backlog | A Fazer | Em andamento | Em revisão | Concluído |
|---|---|---|---|---|
| Itens priorizados, ainda não iniciados | Selecionados para a sprint | Execução pelo responsável | Revisão de código, testes ou validação | Critérios de aceite atendidos |

## Cartões por sprint

| Sprint | Cartão | Situação inicial | Acesso |
|---|---|---|---|
| Sprint 1 | Fundação, autenticação e consulta de contratos | Backlog | [Issue #1](../issues/1) |
| Sprint 2 | Cadastro, edição e validação de contratos | Backlog | [Issue #2](../issues/2) |
| Sprint 3 | Histórico e auditoria de alterações | Backlog | [Issue #3](../issues/3) |
| Sprint 4 | Situação automática e alertas de vencimento | Backlog | [Issue #4](../issues/4) |
| Sprint 5 | Integração, testes de regressão e homologação do MVP | Backlog | [Issue #5](../issues/5) |

## Responsáveis e pareamento

- **Front-end:** kjab2 (focal) + jvls3 (pareamento/substituto).
- **Back-end:** ensf1 (focal) + arlas1 (pareamento/substituto).
- **Design/UI/testes:** mcms12, com apoio de kjab2 e arlas1.
- **Banco de dados/testes:** José Henrique e Alex Rodrigo.

## Regras para movimentar os cartões

1. Mover para **A Fazer** somente quando a sprint estiver priorizada e houver capacidade.
2. Mover para **Em andamento** quando o responsável iniciar a execução.
3. Mover para **Em revisão** quando houver implementação pronta e evidências de teste.
4. Mover para **Concluído** somente após cumprir os critérios de aceite da issue.
5. Registrar bloqueios e decisões relevantes nos comentários da issue.

## Atenção ao planejamento

- Confirmar duração e datas das sprints conforme a disponibilidade real da equipe.
- Planejar a ausência de ensf1 entre 08 e 18 de novembro; garantir transferência de contexto para arlas1 antes desse período.
- Não iniciar funcionalidades dependentes de regras de negócio ainda não validadas com a SEPLAG.
- Executar testes e integração continuamente, não apenas na Sprint 5.

## Como transformar este roteiro em um quadro Kanban do GitHub

Este arquivo é o quadro de referência dentro do repositório. Para obter colunas arrastáveis no GitHub, crie um **Project** do tipo Board na aba Projects do repositório/conta e adicione as issues #1 a #5. Configure as colunas com os cinco estados do fluxo acima e use o campo Sprint para agrupar os cartões.
