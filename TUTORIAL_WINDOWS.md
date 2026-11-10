# Tutorial: executar a Biblioteca Folha no Windows (passo a passo)

> Este projeto não é uma página HTML estática. É um programa **React + Vite** que faz chamadas a uma **API Laravel**. Duplo clique em `index.html` não funciona porque o navegador não compila `JSX`, não instala dependências e não inicia a API.

## Parte A — O que instalar (uma única vez)

1. Instale o [Docker Desktop para Windows](https://www.docker.com/products/docker-desktop/) e reinicie o computador se o instalador solicitar.
2. Abra o Docker Desktop e aguarde o indicador de motor ativo. Se pedir WSL 2, siga a instrução do próprio programa. Teste no **PowerShell**:
   ```powershell
   docker --version
   docker compose version
   ```
3. Instale o [VS Code](https://code.visualstudio.com/) para editar arquivos. Você não precisa instalar Node.js, PHP, Composer nem PostgreSQL separadamente se usar Docker.

## Parte B — Preparar as pastas

1. Extraia `biblioteca-segura.zip` (botão direito → **Extrair tudo**).
2. Abra a pasta extraída que contém **`docker-compose.yml`**, `backend`, `frontend` e `database`.
3. Abra essa pasta no VS Code (Arquivo → Abrir Pasta).
4. No VS Code, Terminal → Novo Terminal. Confira que o terminal está na pasta que contém `docker-compose.yml`.
5. Execute:
   ```powershell
   .\scripts\setup.ps1
   ```
6. O comando criará `backend/.env` e `frontend/.env`. Se já existirem, não os sobrescreverá.

## Parte C — Criar o banco Supabase

1. Entre no [Supabase Dashboard](https://supabase.com/dashboard), escolha um projeto novo sem dados.
2. Vá em **SQL Editor → New query**.
3. Copie o conteúdo de `database/01_base_supabase.sql`, clique em **Run** e confirme ausência de erros.
4. Repita com `database/02_extensoes_catalogo.sql`.
5. Repita com `database/04_api_somente_laravel.sql` (fechamento do acesso direto à Data API).
6. Opcional: execute `03_dados_demonstracao_OPCIONAL.sql` para mostrar títulos ilustrativos, **sem exemplares disponíveis**.
7. No **Table Editor**, verifique as sete tabelas: `autores`, `bibliotecas`, `bibliotecarios`, `clientes`, `livros`, `emprestimos` e `solicitacoes`.

**Se já possui dados:** faça backup e avalie as alterações antes de executar os scripts. Não apague tabelas existentes para seguir o tutorial.

## Parte D — Configurar backend/.env

No VS Code, abra `backend/.env`. Copie os campos corretos do painel Supabase:

| Variável | Onde encontrar |
|---|---|
| `DB_HOST` | Supabase → Connect → Session pooler → Host (exato) |
| `DB_PORT` | Supabase → Connect → Session pooler → Port (frequentemente 5432) |
| `DB_USERNAME` | Supabase → Connect → Session pooler → User |
| `DB_PASSWORD` | Senha do banco definida no Supabase |
| `DB_DATABASE` | Nome do banco, normalmente `postgres` |
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Project Settings → API Keys → publishable (ou anon legada) |

Outras variáveis importantes:

```dotenv
APP_DEBUG=false
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
SESSION_DRIVER=file
SESSION_LIFETIME=60
SESSION_SECURE_COOKIE=false
DB_SSLMODE=require
```

O programa gera `APP_KEY` automaticamente no primeiro start, **não preencha um texto qualquer**. `frontend/.env` não precisa de credenciais. Não envie `.env` para colegas nem GitHub.

## Parte E — Ligar o site

No terminal aberto na raiz do projeto:

```powershell
docker compose up --build
```

Ou dê duplo clique no arquivo **`iniciar-windows.bat`** na raiz.

1. Na primeira inicialização o Docker instala pacotes Laravel e React. Mantenha o terminal aberto.
2. Abra **http://localhost:5173** (não use `file:///...`).
3. Abra uma segunda aba em **http://localhost:5173/api/health**. Resposta esperada (aproximada):
   ```json
   {"ok": true, "service": "biblioteca-api", "auth": "server-session"}
   ```
4. Entre em **Catálogo**; se rodou os dados de exemplo, aparecerão livros com estoque 0. Caso contrário, catálogo vazio é normal.
5. Para encerrar, `Ctrl+C` e então `docker compose down`.

## Parte F — Testar cadastro e empréstimos

1. No site → **Criar conta** → nome, e-mail, senha. Confirme o e-mail se o Supabase exigir.
2. Entre com essa conta, abra um livro com **quantidade disponível maior que zero** (administrador deve cadastrar/ajustar exemplares).
3. Clique em **Solicitar empréstimo**. O pedido ficará **PENDENTE**.
4. Provisione uma conta de bibliotecário em Supabase SQL Editor (comando no README), usando **seu e-mail real** e ID real da biblioteca. Saia e entre novamente.
5. Em **Painel administrativo → Solicitações**, confirme retirada. A quantidade disponível diminui.
6. Em **Empréstimos**, registre devolução. A quantidade disponível aumenta.

## Parte G — Google login (opcional)

1. Google Cloud Console → Credenciais OAuth → Aplicação web. Em **Authorized redirect URIs** cadastre **`https://SEU_PROJECT_REF.supabase.co/auth/v1/callback`** (não `localhost`).
2. Supabase → Authentication → Providers → Google → habilite e informe as credenciais do Google.
3. Supabase → Authentication → URL Configuration → Site URL: **`http://localhost:5173`**.
4. Em **Redirect URLs**, adicione **`http://localhost:5173/api/auth/google/callback`** e **`http://localhost:5173/login`**.
5. Reinicie a sessão no navegador e clique em **Continuar com Google**.

Google e Supabase podem alterar menus e requisitos de OAuth. Compare sempre com a documentação oficial linkada no README.

## Parte H — Quando algo der errado

Abra um segundo terminal PowerShell na mesma pasta e execute:

```powershell
docker compose ps
docker compose logs --tail=100 web
docker compose logs --tail=100 api
```

**Site não aparece:** verificar Docker ativo e `http://localhost:5173`.

**Erro no código React:** copie o texto do terminal do container `web`, especialmente mensagens Vite.

**Site carrega, mas nenhum livro aparece:** API pode estar sem banco; confira `http://localhost:5173/api/health`, SQL, variáveis `DB_*` e logs do container `api`.

**HTTP 401:** faça login. **HTTP 403:** perfil/administrador não autorizado. **HTTP 419:** atualização da sessão/CSRF; recarregue a página.

**Problema de portas:** outro programa pode usar 5173 ou 8000. Feche-o antes de iniciar o Docker.

**Depois de alterar `backend/.env`:** execute `docker compose restart api`. Depois de alterar `vite.config.js` ou `docker-compose.yml`, execute `docker compose down` e `docker compose up --build`.

## Parte I — Sem Docker (alternativa avançada)

Requer **PHP 8.3+** com `pdo_pgsql`, Composer, Node.js 22+ e configuração correta do PostgreSQL:

Terminal 1:
```powershell
cd backend
composer install
php artisan key:generate
php artisan serve --host=127.0.0.1 --port=8000
```

Terminal 2:
```powershell
cd frontend
npm install
npm run dev
```

O proxy Vite usa `http://localhost:8000` fora do Docker. Use **http://localhost:5173** também nesse modo.

**Aviso sobre segurança:** este ambiente usa HTTP somente para localhost. Para publicar na internet, configure HTTPS, cookies `Secure`, servidor web de produção, logs, backup, testes de invasão e revisão do modelo de ameaças.
