# Banco de dados

O arquivo `schema.sql` contém a estrutura inicial PostgreSQL para usuários, contratos e trilha de auditoria.

Observações:
- `password_hash` armazena somente hash; nunca senha em texto puro.
- A API deve validar regras também no servidor.
- A situação operacional do contrato deve ser calculada pela aplicação a partir das datas e regras aprovadas.
- O histórico deve ser tratado como append-only pela aplicação; não disponibilizar edição/exclusão para usuários comuns.
