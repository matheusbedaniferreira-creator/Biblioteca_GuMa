import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BookOpenText, LibraryBig, LayoutDashboard, LogIn, LogOut, UserRound, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function NavBar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const nav = (path, label) => <NavLink to={path} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'navlink active' : 'navlink'}>{label}</NavLink>;
  return <header className="site-header">
    <div className="container topbar">
      <Link to="/" className="brand"><span className="brand-icon"><BookOpenText size={25}/></span><span>folha<span className="brand-dot">.</span></span></Link>
      <button className="mobile-menu icon-button" aria-label="Abrir menu" onClick={() => setOpen(!open)}><Menu size={22}/></button>
      <nav className={`main-nav ${open ? 'open' : ''}`}>
        {nav('/', 'Início')}{nav('/catalogo', 'Explorar livros')}
        {user && nav('/minha-conta', 'Minha estante')}
        {profile?.role === 'bibliotecario' && nav('/admin', 'Painel da biblioteca')}
      </nav>
      <div className="nav-actions">
        {user ? <>
          <Link className="user-pill" to={profile?.role === 'bibliotecario' ? '/admin' : '/minha-conta'}><UserRound size={16}/><span>{profile?.cliente?.nome?.split(' ')[0] || user.email?.split('@')[0]}</span></Link>
          <button title="Sair" aria-label="Sair" className="icon-button logout" onClick={async () => { await signOut(); navigate('/'); }}><LogOut size={19}/></button>
        </> : <Link to="/login" className="button button-dark button-small"><LogIn size={16}/> Entrar</Link>}
      </div>
    </div>
  </header>;
}
