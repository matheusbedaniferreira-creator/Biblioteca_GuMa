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
    <section className="hero"><div className="container hero-grid">
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
        <svg className="dragon-svg" viewBox="0 0 720 260" role="img" aria-label="Dragão soprando fogo">
          <defs>
            <linearGradient id="dragonBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2f6b5a"/>
              <stop offset="55%" stopColor="#1b473b"/>
              <stop offset="100%" stopColor="#102c24"/>
            </linearGradient>
            <linearGradient id="dragonWing" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#26594b"/>
              <stop offset="100%" stopColor="#0e261f"/>
            </linearGradient>
            <linearGradient id="dragonBelly" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d6ad78"/>
              <stop offset="100%" stopColor="#8c673b"/>
            </linearGradient>
            <radialGradient id="fireOuter" cx="15%" cy="50%" r="85%">
              <stop offset="0%" stopColor="#fef08a"/>
              <stop offset="35%" stopColor="#fb923c"/>
              <stop offset="75%" stopColor="#ea580c" stopOpacity=".85"/>
              <stop offset="100%" stopColor="#9a3412" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="fireCore" cx="10%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#ffffff"/>
              <stop offset="45%" stopColor="#fde047"/>
              <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
            </radialGradient>
          </defs>

          <ellipse cx="260" cy="238" rx="195" ry="12" fill="rgba(0,0,0,0.32)"/>

          <g className="dragon-tail">
            <path d="M195 186 C135 205, 85 210, 44 176 C28 163, 25 142, 42 132 C38 148, 52 165, 76 172 C115 182, 152 172, 195 162 Z" fill="url(#dragonBody)"/>
            <polygon points="42,132 24,120 35,142" fill="#d6ad78"/>
            <polygon points="88,186 80,174 96,178" fill="#d6ad78"/>
            <polygon points="122,190 116,177 132,181" fill="#d6ad78"/>
          </g>

          <g className="dragon-wing-group">
            <path d="M235 128 C190 54, 125 22, 68 38 C98 56, 114 82, 110 108 C138 96, 160 102, 174 124 C194 114, 214 118, 235 128 Z" fill="url(#dragonWing)" stroke="#3e7f6c" strokeWidth="1.5"/>
            <path d="M235 128 L120 55 M235 128 L158 92 M235 128 L192 114" stroke="#133329" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M250 124 C226 38, 178 14, 128 18 C162 42, 174 72, 172 102 C196 92, 218 100, 234 122 Z" fill="url(#dragonWing)" stroke="#4c967f" strokeWidth="1.5"/>
            <path d="M250 124 L170 36 M250 124 L204 76" stroke="#133329" strokeWidth="2.5" strokeLinecap="round"/>
          </g>

          <path d="M188 164 C205 125, 258 112, 304 126 C332 135, 350 158, 342 184 C334 206, 294 214, 246 210 C206 206, 180 188, 188 164 Z" fill="url(#dragonBody)"/>
          <path d="M214 188 C246 204, 296 204, 326 184 C318 198, 286 210, 248 208 C226 206, 216 198, 214 188 Z" fill="url(#dragonBelly)" opacity=".9"/>

          <path d="M222 186 C206 196, 198 214, 210 228 L234 232 L242 224 L224 220 C222 208, 230 198, 240 194 Z" fill="url(#dragonBody)"/>
          <path d="M312 182 C322 198, 326 216, 316 230 L342 232 L348 224 L332 222 C336 208, 332 192, 324 180 Z" fill="url(#dragonBody)"/>

          <g className="dragon-head-group">
            <path d="M318 136 C336 106, 350 82, 376 74 C394 68, 412 72, 422 86 C408 98, 386 112, 368 148 C356 168, 336 162, 318 136 Z" fill="url(#dragonBody)"/>
            <path d="M376 76 C394 62, 424 62, 444 74 C456 80, 464 88, 460 95 C444 98, 422 96, 404 98 L384 106 Z" fill="url(#dragonBody)"/>
            <path d="M398 104 L448 106 C452 112, 442 118, 424 118 C406 118, 392 114, 398 104 Z" fill="#173a30"/>
            <path d="M388 70 L360 36 L382 62 Z" fill="#d6ad78"/>
            <path d="M402 68 L386 32 L398 62 Z" fill="#e6c79a"/>
            <polygon points="346,104 334,90 354,96" fill="#d6ad78"/>
            <polygon points="334,124 320,112 340,116" fill="#d6ad78"/>
            <circle cx="414" cy="82" r="4" fill="#facc15"/>
            <circle cx="415" cy="82" r="1.8" fill="#1a120b"/>
            <polygon points="444,96 447,102 450,96" fill="#f8f6ee"/>
            <polygon points="432,97 435,103 438,97" fill="#f8f6ee"/>
          </g>

          <g className="dragon-fire">
            <path d="M454 100 C505 84, 575 68, 668 82 C622 98, 654 112, 694 114 C638 128, 594 142, 535 130 C495 122, 472 114, 454 106 Z" fill="url(#fireOuter)"/>
            <path d="M454 102 C495 92, 545 86, 612 98 C574 108, 596 118, 628 118 C578 124, 524 122, 454 106 Z" fill="url(#fireCore)"/>
            <circle cx="590" cy="84" r="3" fill="#fde047" className="ember e1"/>
            <circle cx="640" cy="96" r="2.5" fill="#fb923c" className="ember e2"/>
            <circle cx="615" cy="126" r="3" fill="#fde047" className="ember e3"/>
            <circle cx="670" cy="108" r="2" fill="#fef08a" className="ember e4"/>
          </g>
        </svg>
      </section>
    </div>
  </>;
}
