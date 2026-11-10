import { Routes, Route, Link } from 'react-router-dom';
import NavBar from './components/NavBar';
import Guard from './components/Guard';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import BookDetail from './pages/BookDetail';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import MyAccount from './pages/MyAccount';
import Admin from './pages/Admin';
import Discover from './pages/Discover';

export default function App() {
  return <div className="app-shell"><NavBar/><main>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/catalogo" element={<Catalog/>}/>
      <Route path="/descobrir" element={<Discover/>}/>
      <Route path="/livro/:id" element={<BookDetail/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/auth/callback" element={<AuthCallback/>}/>
      <Route path="/minha-conta" element={<Guard><MyAccount/></Guard>}/>
      <Route path="/admin" element={<Guard staff><Admin/></Guard>}/>
      <Route path="*" element={<section className="container error-panel"><h1>Página não encontrada</h1><Link className="button button-dark" to="/">Voltar ao início</Link></section>}/>
    </Routes>
  </main><footer className="site-footer"><div className="container footer-inner"><span className="footer-brand">folha<span>.</span></span><p>Um mundo de histórias para descobrir. © {new Date().getFullYear()}</p><Link to="/catalogo">Explorar acervo</Link></div></footer></div>;
}
