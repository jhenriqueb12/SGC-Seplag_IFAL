# Banco de dados

O arquivo `schema.sql` contém a estrutura inicial PostgreSQL para usuários, contratos e trilha de auditoria.

## Atualização de bancos existentes

Execute as migrações em ordem. Para habilitar gestores, fiscais e histórico de notificações:

```bash
psql "$DATABASE_URL" -f database/migrations/002_contract_responsibles_and_notifications.sql
```

A migração adiciona `manager_id` e `inspector_id` como referências a `users(id)`. Os campos ficam inicialmente nulos para preservar contratos já cadastrados; novos cadastros e edições pela API exigem a seleção de ambos os responsáveis.

Observações:

- `password_hash` armazena somente hash; nunca senha em texto puro.
- A API deve validar regras também no servidor.
- A situação operacional do contrato deve ser calculada pela aplicação a partir das datas e regras aprovadas.
- O histórico deve ser tratado como append-only pela aplicação; não disponibilizar edição/exclusão para usuários comuns.
