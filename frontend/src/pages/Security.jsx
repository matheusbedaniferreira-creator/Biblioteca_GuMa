import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, LockKeyhole, ShieldCheck, Server, Database, Fingerprint } from 'lucide-react';

const safeguards = [
  { icon: Fingerprint, heading: 'Hash e salt', text: 'O Supabase Auth é responsável por armazenar verificadores seguros de senha. Um hash não é uma criptografia reversível; o salt exclusivo reduz riscos de tabelas pré-computadas.' },
  { icon: KeyRound, heading: 'Pepper opcional', text: 'Um pepper é um segredo compartilhado que só faz sentido se utilizado em uma rotina criptográfica específica. No login atual da GuMa, não implementamos pepper próprio: o Supabase Auth gerencia a verificação de senhas.' },
  { icon: LockKeyhole, heading: 'Variáveis de ambiente', text: 'O arquivo backend/.env guarda credenciais de banco, chaves de serviços e a APP_KEY, usada pelo Laravel para criptografar a sessão. O arquivo real jamais deve ser publicado.' },
  { icon: Server, heading: 'Sessões no servidor', text: 'O Laravel guarda os tokens de autenticação na sessão criptografada no servidor. O navegador recebe apenas um cookie com HttpOnly, sem tokens em localStorage ou sessionStorage.' },
  { icon: Database, heading: 'Permissões e banco', text: 'As operações passam pela API Laravel, que valida a sessão e separa permissões de clientes e bibliotecários. No PostgreSQL há restrições de integridade e RLS habilitado.' },
  { icon: ShieldCheck, heading: 'Proteção em camadas', text: 'CSRF, validação de entradas, limites de requisições e TLS fazem parte da arquitetura. A publicação em produção ainda exige HTTPS, testes e revisão de segurança.' },
];

export default function Security() {
  return <div className="container security-page">
    <Link className="back-link" to="/"><ArrowLeft size={17}/> Voltar ao início</Link>
    <div className="page-top"><span className="eyebrow accent">SEGURANÇA NA GUMA</span><h1>Proteção que acontece <em>nos bastidores.</em></h1><p>Entenda os mecanismos usados pela plataforma, o que fica reservado ao backend e o que ainda deve ser testado antes de um lançamento público.</p></div>
    <div className="security-grid">{safeguards.map(({icon: Icon,heading,text}) => <article key={heading} className="security-card"><div className="security-icon"><Icon size={24}/></div><h3>{heading}</h3><p>{text}</p></article>)}</div>
    <div className="security-note"><strong>Importante:</strong> a GuMa não armazena senhas próprias no banco da biblioteca. O Supabase Auth realiza a autenticação e o Laravel aplica a sessão e as permissões. Exibir informações de segurança no site não substitui uma auditoria real.</div>
  </div>;
}
