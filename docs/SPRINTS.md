# Planejamento de Sprints — SGC SEPLAG

Este documento organiza o roadmap inicial do MVP em cinco sprints. As sprints estão cadastradas como GitHub Issues para acompanhamento; as datas devem ser definidas no Sprint Planning conforme a disponibilidade real da equipe.

## Arquitetura de referência
- Front-end: React + Vite
- Back-end: Node.js + Express
- Banco de dados: PostgreSQL
- Execução local: npm para aplicações e Docker Compose opcional para PostgreSQL

## Equipe
- Front-end: kjab2 (focal) + jvls3 (pareamento); mcms12 em UI/design e testes.
- Back-end: ensf1 (focal) + arlas1 (pareamento).
- Banco de Dados/Testes: José Henrique + Alex Rodrigo.

## Roadmap

| Sprint | Objetivo | Entrega principal |
|---|---|---|
| 1 | Fundação, autenticação e consulta | Aplicação executável, login, listagem, busca e detalhes |
| 2 | Cadastro, edição e validação | CRUD inicial com validações e integridade |
| 3 | Histórico e auditoria | Registro e consulta das alterações |
| 4 | Situação automática e alertas | Situação calculada e alertas de 5, 4 e 3 meses |
| 5 | Integração e homologação | Regressão, correções, documentação e demonstração do MVP |

## Regras de execução
1. Cada issue de sprint deve ser decomposta em tarefas menores, com responsável, estimativa e critérios de aceite.
2. Back-end deve trabalhar em pareamento ensf1 + arlas1.
3. Front-end deve trabalhar em pareamento kjab2 + jvls3.
4. Banco de dados e testes devem validar cada funcionalidade durante sua implementação; não deixar toda a validação para a Sprint 5.
5. Confirmar com a SEPLAG as regras pendentes de situação, fim de mês e destinatários dos alertas antes de homologar.
6. Não versionar credenciais, arquivos .env ou dados reais/sigilosos de contratos.
7. A arquitetura do MVP permanece simples: não introduzir Kubernetes, microsserviços ou serviços em nuvem sem necessidade aprovada.

## Definição de concluído (DoD)
- Código revisado por outro integrante.
- Testes relevantes executados e resultado registrado.
- Critérios de aceite atendidos.
- Integração com as demais áreas validada quando aplicável.
- Documentação atualizada.
- Sem credenciais ou dados sensíveis no repositório.

## Observação de planejamento
As cinco sprints representam a sequência funcional proposta no backlog. Não são datas nem compromisso automático de capacidade. A equipe deve confirmar duração, início/fim e volume de trabalho em cada Sprint Planning, considerando especialmente a disponibilidade limitada de ensf1 e sua ausência prevista de 8 a 18 de novembro.
