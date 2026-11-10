import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Guard({ children, staff = false }) {
  const { loading, user, profile, profileError } = useAuth();
  const location = useLocation();
  if (loading) return <div className="centered-state">Carregando sua sessão…</div>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace/>;
  if (profileError) return <div className="container error-panel"><h2>Não foi possível carregar seu perfil</h2><p>{profileError}</p><p>Verifique a conexão da API, a chave do Supabase e o trigger de clientes.</p></div>;
  if (staff && profile?.role !== 'bibliotecario') return <Navigate to="/minha-conta" replace/>;
  return children;
}
