import { Link } from 'react-router-dom';
export default function AuthCallback() {
  // Fluxos de retorno de Google e confirmacao de e-mail terminam no Laravel.
  return <div className="container centered-state"><h2>Verifique seu e-mail</h2><p>Se confirmou o cadastro, entre novamente na sua conta.</p><Link to="/login">Ir para o login</Link></div>;
}
