import { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, UserRound } from 'lucide-react';
import NavBar from './components/NavBar';
import Guard from './components/Guard';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import BookDetail from './pages/BookDetail';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import MyAccount from './pages/MyAccount';
import Admin from './pages/Admin';
import Discover from './pages/Discover';
import Security from './pages/Security';

function TopBar() {
  const { user, profile } = useAuth();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const displayName =
    profile?.bibliotecario?.nome ||
    profile?.cliente?.nome ||
    user?.email?.split('@')[0] ||
    '';
  const initials = displayName
    ? displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0].toUpperCase())
        .join('')
    : '';

  return (
    <header className="editorial-topbar">
      <form
        className="topbar-search"
        onSubmit={(e) => {
          e.preventDefault();
          navigate(`/catalogo?q=${encodeURIComponent(query.trim())}`);
        }}
      >
        <Search size={17} strokeWidth={1.9}/>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar livro, autor ou edição..."
          aria-label="Pesquisar no acervo"
        />
      </form>

      <div className="topbar-right">
        {user ? (
          <Link
            to={profile?.role === 'bibliotecario' ? '/admin' : '/minha-conta'}
            className="topbar-profile"
          >
            <span className="topbar-avatar">{initials || <UserRound size={15}/>}</span>
            <span className="topbar-name">{displayName}</span>
          </Link>
        ) : (
          <Link to="/login" className="topbar-login">
            <span className="topbar-avatar"><UserRound size={15}/></span>
            <span className="topbar-name">Entrar</span>
          </Link>
        )}
        <Link
          to={user ? '/minha-conta' : '/login'}
          className="topbar-bell"
          title="Minhas solicitações"
          aria-label="Minhas solicitações"
        >
          <Bell size={18} strokeWidth={1.8}/>
        </Link>
      </div>
    </header>
  );
}

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="desk-backdrop">
      <div className={`book-shell ${isHome ? 'is-spread' : 'is-inner'}`}>
        <NavBar/>
        <div className="book-workspace">
          <TopBar/>
          <main className="book-content">
            <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/catalogo" element={<Catalog/>}/>
              <Route path="/descobrir" element={<Discover/>}/>
              <Route path="/seguranca" element={<Security/>}/>
              <Route path="/livro/:id" element={<BookDetail/>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/auth/callback" element={<AuthCallback/>}/>
              <Route path="/minha-conta" element={<Guard><MyAccount/></Guard>}/>
              <Route path="/admin" element={<Guard staff><Admin/></Guard>}/>
              <Route
                path="*"
                element={
                  <section className="container error-panel">
                    <h1>Página não encontrada</h1>
                    <Link className="button button-dark" to="/">Voltar ao início</Link>
                  </section>
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}
