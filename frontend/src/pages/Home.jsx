import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BookOpenText, Heart, Search, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import BookCard from '../components/BookCard';

export default function Home() {
  const [collections, setCollections] = useState({ destaques: [], mais_procurados: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  useEffect(() => { api('/livros/destaques').then(setCollections).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  return <>
    <section className="hero"><div className="container hero-grid">
      <div className="hero-copy"><span className="eyebrow hero-eyebrow"><Sparkles size={15}/> SUA PRÓXIMA HISTÓRIA COMEÇA AQUI</span>
        <h1>Todo livro abre <em>um novo mundo.</em></h1>
        <p>Descubra histórias, explore novos autores e encontre sua próxima leitura favorita. Sua biblioteca, cada vez mais perto de você.</p>
        <form className="hero-search" onSubmit={e => { e.preventDefault(); navigate(`/catalogo?q=${encodeURIComponent(query)}`); }}>
          <Search size={20}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Qual história você procura?" aria-label="Pesquisar livros"/><button aria-label="Buscar livros" type="submit"><ArrowRight size={21}/></button>
        </form>
        <div className="hero-mini"><span className="hero-dot"/> Explore nosso acervo sem sair de casa</div>
      </div>
      <div className="hero-art" aria-hidden="true"><div className="art-orbit art-orbit-one"/><div className="art-orbit art-orbit-two"/><div className="decor-spark decor-one">✧</div><div className="decor-spark decor-two">✳</div><div className="hero-book hero-book-back"><span>A WORLD<br/>OF WORDS</span></div><div className="hero-book hero-book-front"><span className="tiny">THE ART OF</span><span className="large">living<br/>slowly.</span><span className="tiny bottom">STORIES FOR THE SOUL</span></div><div className="art-quote"><BookOpenText size={18}/> Uma página de cada vez.</div></div>
    </div></section>
    <div className="container" style={{paddingTop: 24}}><Link className="text-link" to="/descobrir">Explorar livros e capas no Google Books <ArrowUpRight size={18}/></Link></div><section className="benefits"><div className="container benefit-grid"><div><BookOpenText size={24}/><span><strong>Descubra novos livros</strong><small>Encontre seu próximo favorito</small></span></div><div><Heart size={24}/><span><strong>Solicite online</strong><small>Reserve a retirada com facilidade</small></span></div><div><Sparkles size={24}/><span><strong>Para todos os leitores</strong><small>Seu espaço para explorar</small></span></div></div></section>
    <div className="container collections">
      {error && <div className="notice notice-error">{error}</div>}
      <section className="collection-section"><div className="section-heading"><div><span className="eyebrow accent">CURADORIA DA BIBLIOTECA</span><h2>Escolhas especiais <em>para você</em></h2><p>Livros selecionados pela nossa equipe.</p></div><Link className="text-link" to="/catalogo">Ver todo o acervo <ArrowUpRight size={18}/></Link></div>
        {loading ? <p className="subtle">Carregando recomendações…</p> : collections.destaques.length ? <div className="book-grid">{collections.destaques.slice(0, 4).map(b => <BookCard key={b.id_livro} book={b}/>)}</div> : <div className="empty-panel"><BookOpenText size={30}/><h3>As recomendações estão a caminho</h3><p>A equipe pode marcar livros como destaque no painel administrativo.</p></div>}
      </section>
      <section className="feature-banner"><div><span className="eyebrow light">PARA QUEM AMA LER</span><h2>Seu próximo capítulo<br/>está esperando.</h2><p>Crie uma conta gratuita e solicite exemplares do nosso acervo.</p><Link className="button button-cream" to="/login">Criar minha conta <ArrowRight size={18}/></Link></div><div className="banner-illustration" aria-hidden="true"><span>READ<br/>MORE.</span></div></section>
      <section className="collection-section"><div className="section-heading"><div><span className="eyebrow accent">LEITURAS EM ALTA</span><h2>Mais <em>procurados</em></h2><p>Classificados pelo número de solicitações realizadas.</p></div><Link className="text-link" to="/catalogo">Explorar catálogo <ArrowUpRight size={18}/></Link></div>
        {!loading && collections.mais_procurados.length ? <div className="book-grid">{collections.mais_procurados.slice(0, 4).map(b => <BookCard key={b.id_livro} book={b}/>)}</div> : !loading && <p className="subtle">Ainda não há solicitações para calcular os mais procurados.</p>}
      </section>
    </div>
  </>;
}
