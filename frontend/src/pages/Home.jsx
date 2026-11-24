import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  Settings,
} from 'lucide-react';
import { api } from '../lib/api';
import BookCard from '../components/BookCard';
import DragonIllustration from '../components/DragonIllustration';

const heroBooks = [
  { title: '1984', author: 'George Orwell', tone: 'terracotta' },
  { title: 'Dom Casmurro', author: 'Machado de Assis', tone: 'forest' },
  { title: 'O Pequeno Príncipe', author: 'Saint-Exupéry', tone: 'ochre' },
];

const recommendedShelf = [
  {
    title: '1984',
    author: 'George Orwell',
    tag: 'Distopia',
    description: 'Um clássico sobre vigilância, poder e memória que continua atual.',
  },
  {
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    tag: 'Literatura brasileira',
    description: 'Ironia, ciúme e dúvida na voz de um dos narradores mais famosos da nossa literatura.',
  },
  {
    title: 'O Pequeno Príncipe',
    author: 'Antoine de Saint-Exupéry',
    tag: 'Fábula',
    description: 'Leitura breve e poética sobre amizade, afeto e o que realmente importa.',
  },
  {
    title: 'Orgulho e Preconceito',
    author: 'Jane Austen',
    tag: 'Romance clássico',
    description: 'Diálogos afiados, crítica social e personagens inesquecíveis.',
  },
];

export default function Home() {
  const [collections, setCollections] = useState({ destaques: [], mais_procurados: [] });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api('/livros/destaques')
      .then(setCollections)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return <>
    <section className="hero">
      <div className="hero-dragon-bg" aria-hidden="true">
        <DragonIllustration variant="hero"/>
      </div>
      <div className="container hero-grid">
      <div className="hero-copy">
        <h1>Todo livro abre <em>um novo mundo.</em></h1>
        <p>Pesquise no acervo da biblioteca, reserve seu exemplar online e acompanhe prazos de devolução em um só lugar.</p>
        <form className="hero-search" onSubmit={e => { e.preventDefault(); navigate(`/catalogo?q=${encodeURIComponent(query)}`); }}>
          <Search size={20}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por título, autor ou tema..." aria-label="Pesquisar livros"/><button aria-label="Buscar livros" type="submit"><ArrowRight size={20}/></button>
        </form>
      </div>
      <div className="hero-shelf" aria-label="Livros em destaque">
        {heroBooks.map((book, idx) => (
          <Link key={book.title} to={`/catalogo?q=${encodeURIComponent(book.title)}`} className={`shelf-book shelf-${book.tone}`}>
            <div className="shelf-cover-inner">
              <span className="shelf-author">{book.author}</span>
              <strong className="shelf-title">{book.title}</strong>
              <span className="shelf-spine-mark">Edição {idx === 0 ? 'Clássica' : idx === 1 ? 'Ilustrada' : 'Especial'}</span>
            </div>
          </Link>
        ))}
      </div>
    </div></section>

    <section className="benefits"><div className="container pink-gears-strip" aria-label="Engrenagens em movimento">
      {Array.from({ length: 12 }).map((_, i) => (
        <Settings key={i} size={i % 3 === 0 ? 28 : i % 2 === 0 ? 22 : 18} className={`pink-gear gear-step-${i % 3}`}/>
      ))}
    </div></section>

    <div className="container collections">
      {!loading && collections.destaques.length > 0 && (
        <section className="collection-section"><div className="section-heading"><div><h2>Destaques do acervo</h2><p>Títulos selecionados pela equipe da biblioteca.</p></div><Link className="text-link" to="/catalogo">Ver catálogo <ArrowUpRight size={18}/></Link></div>
          <div className="book-grid">{collections.destaques.slice(0, 4).map(b => <BookCard key={b.id_livro} book={b}/>)}</div>
        </section>
      )}

      <section className="collection-section"><div className="section-heading"><div><h2>Clássicos para começar</h2><p>Sugestões para explorar no catálogo ou descobrir no Google Books.</p></div><Link className="text-link" to="/descobrir">Buscar no Google Books <ArrowUpRight size={18}/></Link></div>
        <div className="recommended-grid">{recommendedShelf.map(item => (
          <Link className="recommended-card" key={item.title} to={`/catalogo?q=${encodeURIComponent(item.title)}`}>
            <span className="recommended-tag">{item.tag}</span>
            <h3>{item.title}</h3>
            <strong>{item.author}</strong>
            <p>{item.description}</p>
          </Link>
        ))}</div>
      </section>

      <section className="collection-section">
        <div className="video-feature">
          <div className="video-feature-copy">
            <h2>Entrevista: Maggie O’Farrell</h2>
            <p>A autora fala sobre processo criativo e os bastidores do romance Hamnet.</p>
            <Link className="button button-dark" to="/descobrir">Descobrir livros <ArrowRight size={17}/></Link>
          </div>
          <div className="video-frame">
            <iframe
              src="https://www.youtube-nocookie.com/embed/l6T9H_idh8Y?mute=1&rel=0"
              title="Entrevista com Maggie O’Farrell sobre o romance Hamnet"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
            <a className="youtube-backup" href="https://www.youtube.com/watch?v=l6T9H_idh8Y" target="_blank" rel="noopener noreferrer">Abrir no YouTube</a>
          </div>
        </div>
      </section>

      {!loading && collections.mais_procurados.length > 0 && (
        <section className="collection-section"><div className="section-heading"><div><h2>Mais procurados</h2><p>Os títulos com mais solicitações pelos leitores.</p></div><Link className="text-link" to="/catalogo">Explorar catálogo <ArrowUpRight size={18}/></Link></div>
          <div className="book-grid">{collections.mais_procurados.slice(0, 4).map(b => <BookCard key={b.id_livro} book={b}/>)}</div>
        </section>
      )}

      <section className="feature-banner">
        <div>
          <h2>Crie sua conta na biblioteca</h2>
          <p>Acompanhe solicitações, prazos de devolução e mantenha sua estante organizada.</p>
        </div>
        <Link className="button button-cream" to="/login">Entrar ou cadastrar <ArrowRight size={18}/></Link>
      </section>

      <section className="dragon-stage" aria-label="Guardião da biblioteca">
        <DragonIllustration variant="stage"/>
      </section>
    </div>
  </>;
}
