# Checklist e modelo de segurança — Biblioteca Folha

## Credenciais e armazenamento

- ✅ Senha **nunca** é gravada nas tabelas `clientes` e `bibliotecarios` (Supabase Auth armazena hashes em seu próprio schema protegido).
- ✅ O frontend **não** possui `supabase-js`, `localStorage`, `sessionStorage`, IndexedDB nem service worker para credenciais.
- ✅ React só mantém valores dos campos enquanto o formulário está montado; limpa a senha depois de enviar.
- ✅ `Cookie HttpOnly; SameSite=Lax` de sessão Laravel. Tokens Supabase ficam **criptografados no backend** em armazenamento de sessão (60 minutos de inatividade configurados); navegador contém apenas cookie de sessão.
- ✅ `Cache-Control: no-store` para rotas API, `APP_DEBUG=false`, validação no servidor e política de cookies que expira ao fechar o navegador.
- ✅ Login/cadastro submetidos via POST, com CSRF e limitação de tentativas. Rate limits precisam de cache compartilhado/file (somente contadores, nunca credenciais).
- ✅ Autorização de admin verificada a cada requisição no PHP via banco; nenhuma rota permite promoção pública.
- ✅ SQL `04_api_somente_laravel.sql` revoga acesso direto de Data API, mantendo RLS ativado. As credenciais de banco são mantidas no container do servidor e não no navegador.
- ✅ OAuth Google inicia no Laravel e armazena verificador PKCE na sessão, não no navegador.
- ✅ Trigger PostgreSQL garante integridade de estoque mesmo que duas retiradas concorram pelo último exemplar.

## Atenção antes de produção

- ⚠️ Exigir HTTPS e `SESSION_SECURE_COOKIE=true`. Sem HTTPS, cookies são vulneráveis a interceptação na rede.
- ⚠️ Implementar e executar testes de integração reais para cadastro/login/Google, alteração de papéis, CSRF, trocas de sessão, último exemplar, idempotência e estoque.
- ⚠️ Preferir um usuário PostgreSQL **dedicado, com privilégios mínimos**, em vez das credenciais administrativas do pooler. O exemplo usa o usuário fornecido pelo Supabase apenas para facilitar a instalação acadêmica.
- ⚠️ Configurar logs seguros, política de retenção, backup, monitoramento, proxies confiáveis, limitação no proxy reverso, versionamento de dependências, HTTPS e auditoria de terceiros.
- ⚠️ O arquivo `backend/.env` contém senha do banco: nunca comitar, imprimir em logs ou enviar em suporte. Se vazar, rotacione.
- ⚠️ Cookies e gerenciadores de senhas pertencem ao navegador e às configurações do usuário; o site não consegue impedir que um gerenciador ofereça salvar a senha.
- ⚠️ A autenticação do Google exige configuração real de credenciais e redirect URLs; nenhuma integração OAuth real foi exercitada neste ambiente.
- ⚠️ Dados pessoais de usuários cadastrados ficam **persistidos no banco** (necessários ao sistema); a regra “não guardar em cache” refere-se a não persistir identidades/senhas em cache do navegador.

## Como inspecionar no navegador

1. DevTools (F12) → Application → Local Storage / Session Storage: a aplicação não cria chaves de usuário ou senha.
2. Application → Cookies: deve existir apenas cookie opaco de sessão (e cookie de CSRF controlado pelo Laravel), marcado `HttpOnly` no caso da sessão.
3. Network → `/api/auth/me`: deve retornar apenas dados permitidos e `Cache-Control: no-store`, **sem JWT ou refresh token**.
4. Network → `/api/auth/login`: corpo da requisição contém e-mail/senha enviados intencionalmente via HTTPS em produção. Não registre esse corpo e não compartilhe captura de tela de credenciais.
5. Network → POST de empréstimo sem CSRF deve receber falha; sem login 401; sem papel staff 403.
