# Revisão técnica e segurança — 09/11/2026

## Escopo

Analisado o projeto React + Vite + Laravel PHP + Supabase Auth/PostgreSQL e integração Google Books. Revisão estática não substitui auditoria independente ou testes dinâmicos de aplicação.

## Achados e mudanças

| Prioridade | Observação | Situação |
| --- | --- | --- |
| Alta | Tokens no navegador | A arquitetura atual já usa sessão Laravel cifrada no servidor; mantida. Sem `localStorage` / `sessionStorage` de credenciais. |
| Alta | Dados administrativos | Laravel valida `auth/v1/user` e consulta `bibliotecarios.auth_user_id`, não aceita `role` enviado pelo usuário. |
| Alta | Data API diretamente exposta | O SQL `04_api_somente_laravel.sql` revoga acesso `anon` / `authenticated` e mantém RLS. Confirmação no banco em execução necessária. |
| Alta | PostgreSQL privilegiado | O backend usa credencial de banco com acesso amplo; configurar usuário próprio mínimo é recomendado para produção. |
| Média | Contenção no estoque | Triggers PostgreSQL, transações e locks no PHP para empréstimos/devoluções, com verificação pós-deploy necessária. |
| Média | Google Books SSRF | Consulta a hostname HTTPS fixo no PHP, input limitado e resposta normalizada; nenhuma URL de consulta fornecida pelo usuário é acessada. |
| Média | Chave Google Books | Backend `.env` apenas. Não usar prefixo `VITE_`; Git ignora arquivos `.env`. |
| Média | OAuth PKCE | Verificador salvo em sessão Laravel e prazo máximo de dez minutos, além da verificação de código. |
| Média | CSRF | API mutável usa middleware `web` e token CSRF, cookie SameSite=Lax. |
| Média | Cache | Respostas da API marcadas no-cache. Navegador não recebe senhas em respostas. |
| Média | Portas Docker | Bind ao `127.0.0.1` em vez de abrir serviços de desenvolvimento para toda a rede. |
| Média | Dependências | Versões sem lockfiles auditados e sem build concluído neste ambiente. Exige instalação, build e scanner de dependências. |
| Média | API externa indisponível | Interface informa falha sem revelar credenciais nem stack trace; controle de timeout e rate limit. |

## Riscos residuais e checklist de produção

1. Configurar HTTPS e `SESSION_SECURE_COOKIE=true`, reverse proxy confiável e proteção de headers (incluindo CSP adaptada às imagens externas).
2. Usar segredos em gerenciador de segredos, jamais em GitHub; se alguma chave tiver sido exposta, revogar/rotacionar.
3. Migrar de superusuário/Postgres de privilégio amplo para uma role de banco específica com grants mínimos, sem conceder acesso a schemas de autenticação.
4. Rodar `composer audit`, `npm audit`, scanners de segredos e análise estática; adicionar CI e lockfiles válidos com versões verificadas.
5. Rodar advisories Supabase de RLS, permissões de função e desempenho após migração; provar isolamento entre dois clientes reais.
6. Validar fluxo completo: login Google, criação de perfil, permissão de bibliotecário, concorrência do último exemplar, devolução duplicada, perda de conexão e expiração de sessão.
7. Configurar proteção contra bots/rate limits em CDN/reverse proxy; o rate limiting de desenvolvimento por IP não protege sozinho contra ataques distribuídos.
8. Fazer backup, testar restauração, monitoramento de falhas e política de retenção de dados pessoais em conformidade com LGPD.

## Limites de validação

- `php -l` verifica sintaxe, não autenticação nem lógica.
- A compilação React depende de instalar módulos.
- Conexão Supabase e recursos GitHub devem ser confirmados por operações remotas reais antes de declarar deployment/commit.

## Verificações remotas efetuadas

- Migração `biblioteca_folha_schema_inicial_seguro` aplicada no projeto Supabase `diugqrslyiijkithaycy`.
- `list_tables`: sete tabelas presentes e com RLS habilitado.
- Consulta a `has_table_privilege`: tanto `anon` quanto `authenticated` retornaram `false` para SELECT em todas as sete tabelas.
- Advisor de segurança: sete observações INFO `rls_enabled_no_policy` esperadas na arquitetura sem acesso pela Data API; não é autorização concedida.
- Advisor de performance: índices sem uso porque a base está inicialmente vazia.
- PHP: inspeção de sintaxe com `php -l` concluída sem erros.
- React: build não executado; a instalação offline do npm não encontrou `@vitejs/plugin-react` no cache.
- GitHub: conexão sem repositórios/instalações autorizadas, impedindo commit remoto/publicação.
