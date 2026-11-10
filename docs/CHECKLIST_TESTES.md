# Checklist para testar antes de entregar

- [ ] `docker compose up --build` inicia os serviços sem erros.
- [ ] `http://localhost:5173` abre com React e estilos.
- [ ] `http://localhost:5173/api/health` retorna JSON com `ok:true`.
- [ ] Catálogo mostra registros do Supabase ou estado vazio sem travar.
- [ ] Cadastro exige senha mínima e confirma e-mail quando necessário.
- [ ] Login com senha válida retorna sessão HttpOnly (sem tokens em localStorage).
- [ ] Senha inválida não autentica e retorna erro genérico.
- [ ] Logout invalida sessão e impede GET `/api/auth/me`.
- [ ] Google OAuth funciona após configurar o projeto e Redirect URLs.
- [ ] Usuário comum recebe 403 nas rotas `/api/admin/*`.
- [ ] Bibliotecário cadastra autor/unidade e livro com quantidade >= 0.
- [ ] Livro com estoque 0 não pode ser emprestado.
- [ ] Dois usuários solicitam o último exemplar; apenas uma retirada é aprovada.
- [ ] Retirada reduz disponibilidade; devolução aumenta.
- [ ] Atualização de quantidade não pode ficar abaixo dos exemplares emprestados.
- [ ] Rotas de escrita sem token CSRF falham (419).
- [ ] Respostas autenticadas incluem `Cache-Control: no-store`.
- [ ] `backend/.env` não aparece no Git e não foi enviado a terceiros.
