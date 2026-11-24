import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  BookOpenText,
  Bookmark,
  Compass,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const item = (to, label, Icon, end = false) => (
    <NavLink
      to={to}
      end={end}
      title={label}
      aria-label={label}
      className={({ isActive }) => (isActive ? 'rail-btn active' : 'rail-btn')}
    >
      <Icon size={19} strokeWidth={1.9}/>
    </NavLink>
  );

  return (
    <aside className="icon-rail" aria-label="Navegação principal">
      <Link to="/" className="rail-brand" title="GuMa | Biblioteca Digital" aria-label="GuMa Início">
        <BookOpenText size={24} strokeWidth={2.1}/>
      </Link>

      <nav className="rail-nav">
        {item('/', 'Início', Home, true)}
        {item('/catalogo', 'Catálogo', BookOpen)}
        {item('/descobrir', 'Google Books', Compass)}
        {item('/minha-conta', 'Minha estante', Bookmark)}
        {profile?.role === 'bibliotecario' && item('/admin', 'Painel administrativo', LayoutDashboard)}
        {item('/seguranca', 'Segurança', ShieldCheck)}
      </nav>

      <div className="rail-bottom">
        {user ? (
          <button
            type="button"
            className="rail-btn rail-foot-btn"
            title="Sair da conta"
            aria-label="Sair da conta"
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
          >
            <LogOut size={18} strokeWidth={1.9}/>
          </button>
        ) : (
          <Link to="/login" className="rail-btn rail-foot-btn" title="Entrar" aria-label="Entrar">
            <LogIn size={18} strokeWidth={1.9}/>
          </Link>
        )}
      </div>
    </aside>
  );
}
