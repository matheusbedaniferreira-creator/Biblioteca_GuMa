# Arquitetura atual (BFF)

React 19 + Vite 6 e servido em `http://localhost:5173`.

O proxy Vite encaminha `/api/*` ao Laravel 12 (`http://api:8000` no Docker, `http://localhost:8000` fora do Docker). Isso permite `fetch('/api/...', {credentials:'same-origin'})`, mantendo a sessao em cookies com CSRF sem expor JWT ao JavaScript.

O Laravel autentica e-mails/senhas junto ao Supabase Auth e guarda os tokens apenas na sua sessao criptografada do lado do servidor. Para Google, inicia o PKCE e faz a troca do codigo no callback `/api/auth/google/callback`.

O Laravel consulta o Postgres remoto pelo pooler SSL do Supabase. A tabela `bibliotecarios` e a unica fonte de autorizacao do painel, sempre avaliada no servidor. A migracao `database/04_api_somente_laravel.sql` revoga permissoes de acesso direto as tabelas para as roles `anon` e `authenticated`, porque o site nao utiliza a Data API.

No banco, triggers ajustam a quantidade disponivel atomicamente ao emprestar e devolver, mantendo relacao com clientes, bibliotecarios e solicitacoes.

Acesso publico: `/api/livros`, `/api/livros/destaques`, `/api/livros/{id}`. Acesso autenticado: `/api/auth/me`, `/api/me*`. Acesso bibliotecario: `/api/admin/*`.

Sem cache de usuario/senha no navegador. O servidor usa session files criptografados (tokens de sessao, nao senhas). API com `Cache-Control: no-store`.

Nao ha pagamento, multas, auditoria completa de producao, fila de espera real ou notificacoes automaticas. Consultas publicas de titulos nao representam reserva de exemplares.
