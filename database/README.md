# Banco de dados

O arquivo `schema.sql` contém a estrutura inicial PostgreSQL para usuários, contratos e trilha de auditoria.

## Migrações

As migrações ficam em `database/migrations/` e são aplicadas automaticamente pelo backend antes de `npm run dev` e `npm start`. Para aplicá-las manualmente:

```bash
cd backend
npm run migrate
```

O runner registra cada arquivo aplicado na tabela `schema_migrations` e executa apenas os pendentes, em ordem alfabética, cada um em uma transação. Se o banco estiver vazio, ele aplica `schema.sql` antes.

Regras:

- Nomeie novos arquivos com prefixo numérico sequencial: `004_descricao.sql`.
- Nunca edite uma migração já aplicada; crie uma nova.
- Use `IF NOT EXISTS` / `IF EXISTS` sempre que possível, pois bancos criados pelo Docker já recebem `schema.sql` completo.
- Ao alterar a estrutura, atualize também `schema.sql` para que bancos novos fiquem iguais aos migrados.

A migração adiciona `manager_id` e `inspector_id` como referências a `users(id)`. Os campos ficam inicialmente nulos para preservar contratos já cadastrados; novos cadastros e edições pela API exigem a seleção de ambos os responsáveis.

Observações:

- `password_hash` armazena somente hash; nunca senha em texto puro.
- A API deve validar regras também no servidor.
- A situação operacional do contrato deve ser calculada pela aplicação a partir das datas e regras aprovadas.
- O histórico deve ser tratado como append-only pela aplicação; não disponibilizar edição/exclusão para usuários comuns.
