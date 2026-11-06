# Decisões técnicas do MVP

## Escopo
Construir primeiro um sistema web mínimo para autenticação, cadastro, edição, listagem, filtros e detalhes de contratos.

## Stack
- React + Vite no frontend.
- Node.js + Express na API.
- PostgreSQL no banco.

## Fora do escopo inicial
- Kubernetes e microsserviços.
- Aplicativo mobile.
- Infraestrutura cloud complexa.
- Integrações externas não essenciais.

## Regras de negócio já mapeadas
- Número do processo único.
- Data final posterior à data inicial.
- Situação calculada a partir das datas.
- Campos obrigatórios: empresa, processo, modalidade, situação, objeto, datas de início/fim, valor global e unidade.
- Alertas previstos nos marcos de 5, 4 e 3 meses antes do encerramento, a implementar após o fluxo principal.

## Pontos pendentes de validação
- Matriz final de perfis e permissões.
- Definição da regra exata de situação (vigente, encerrado, suspenso etc.).
- Canal e responsável operacional pelos alertas.
- Formato e qualidade da planilha para importação.
- Disponibilização e requisitos da VM da SEPLAG.

## Operação
Não utilizar dados reais de contratos ou credenciais nos commits. A implantação oficial depende da liberação e validação da infraestrutura pela TI da SEPLAG.
