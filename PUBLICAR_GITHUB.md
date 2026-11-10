# Como publicar no GitHub quando o acesso de escrita estiver habilitado

O pacote deste projeto contém código-fonte e exemplos de configuração, **não** credenciais. Antes de publicar, revise `git status` e execute uma varredura de segredos; não inclua `backend/.env`, `.env`, `vendor`, `node_modules`, logs ou dados de usuários.

## Pelo GitHub Web + Git no Windows

1. Acesse https://github.com/new e crie um repositório chamado `biblioteca-folha`, marcando **Public**. Não inicialize com README, pois o projeto já inclui um.
2. Extraia o ZIP, abra o terminal PowerShell na pasta `biblioteca-segura` e execute:

```powershell
git init -b main
git add .
git status
git commit -m "feat: biblioteca Folha com Google Books, Laravel e Supabase"
git remote add origin https://github.com/SEU_USUARIO/biblioteca-folha.git
git push -u origin main
```

3. Confira no GitHub se **nenhum** `.env`, token, senha ou configuração de banco privada aparece no repositório.
4. Em `Settings > Security > Code security`, habilite as funcionalidades de proteção de código e alerta de segredos disponíveis no seu plano.

**Importante:** o projeto Supabase já foi inicializado pela conexão de desenvolvimento. O código não faz deploy do frontend ou backend automaticamente. Para hospedagem pública, configure servidor HTTPS, variáveis de ambiente seguras, domínio, OAuth, proxy, CI e validação pré-produção.

## Por que o assistente não publicou diretamente

A conexão GitHub consultada nesta sessão retornou **zero repositórios e zero instalações autorizadas**. Não havia repositório selecionável com permissão de escrita, e a ferramenta disponível não possuía operação de criação de repositório. Por isso, foi realizado somente um commit Git local, sem alegar publicação remota.
