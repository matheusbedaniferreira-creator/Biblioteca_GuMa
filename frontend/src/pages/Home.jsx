import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';

const fallbackBooks = [
  {
    id_livro: null,
    titulo: 'O Pequeno Príncipe',
    autor: 'Antoine de Saint-Exupéry',
    tema: 'Fábula',
    sinopse: 'Um piloto cai no deserto do Saara e encontra um pequeno príncipe que viajou de asteroide em asteroide refletindo sobre amizade e afeto.',
    quantidade_disponivel: 2,
    quantidade_total: 3,
    tone: '#1c473c',
  },
  {
    id_livro: null,
    titulo: 'Dom Casmurro',
    autor: 'Machado de Assis',
    tema: 'Literatura brasileira',
    sinopse: 'Bentinho revisita suas memórias de juventude e a relação com Capitu em uma das narrativas mais marcantes da literatura nacional.',
    quantidade_disponivel: 1,
    quantidade_total: 2,
    tone: '#7d4431',
  },
  {
    id_livro: null,
    titulo: '1984',
    autor: 'George Orwell',
    tema: 'Distopia',
    sinopse: 'Sob o olhar constante do Grande Irmão, Winston Smith questiona a vigilância, a manipulação da história e o valor da liberdade.',
    quantidade_disponivel: 3,
    quantidade_total: 3,
    tone: '#294657',
  },
  {
    id_livro: null,
    titulo: 'Orgulho e Preconceito',
    autor: 'Jane Austen',
    tema: 'Romance clássico',
    sinopse: 'Diálogos afiados, crítica social e o encontro inesquecível entre Elizabeth Bennet e o Sr. Darcy na Inglaterra do século XIX.',
    quantidade_disponivel: 2,
    quantidade_total: 2,
    tone: '#8f6c3d',
  },
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

const quickTopics = [
  'Literatura brasileira',
  'Distopia',
  'Romance clássico',
  'Ficção científica',
  'Fábula',
  'História',
];

const coverTones = ['#1c473c', '#7d4431', '#264454', '#7a5d36', '#334d3f', '#573c4c'];

const readerNotes = [
  {
    initials: 'RJ',
    color: '#d9e5de',
    name: 'Roberto Jordão',
    text: 'Que capítulo envolvente! A leitura flui rápido e realmente transporta para outro universo.',
    book: 'O Pequeno Príncipe',
    time: 'há 2 min',
  },
  {
    initials: 'AH',
    color: '#ede3d1',
    name: 'Ana Helena',
    text: 'Terminei a leitura ontem à noite e já reservei o próximo volume aqui pelo catálogo da GuMa.',
    book: 'Dom Casmurro',
    time: 'há 18 min',
  },
];

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getWeekDays(offsetWeeks = 0) {
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offsetWeeks * 7);
  const startOfWeek = new Date(base);
  startOfWeek.setDate(base.getDate() - base.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return {
      key: d.toISOString().slice(0, 10),
      label: WEEK_DAYS[i],
      day: d.getDate(),
      isSunday: i === 0,
    };
  });
}

function bookHref(book) {
  return book.id_livro ? `/livro/${book.id_livro}` : `/catalogo?q=${encodeURIComponent(book.titulo)}`;
}

function BookThumb({ book, index = 0 }) {
  const bg = book.tone || coverTones[index % coverTones.length];
  return (
    <div className="spread-cover" style={{ backgroundColor: bg }}>
      {book.imagem_capa_url ? (
        <img src={book.imagem_capa_url} alt={`Capa de ${book.titulo}`} loading="lazy"/>
      ) : (
        <div className="spread-cover-fallback">
          <small>{book.autor || 'GuMa'}</small>
          <span>{book.titulo}</span>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { user, profile } = useAuth();
  const [highlights, setHighlights] = useState({ destaques: [], mais_procurados: [] });
  const [catalogBooks, setCatalogBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    Promise.all([
      api('/livros/destaques').catch(() => null),
      api('/livros?page=1').catch(() => null),
    ])
      .then(([hl, cat]) => {
        if (hl && Array.isArray(hl.destaques) && Array.isArray(hl.mais_procurados)) {
          setHighlights(hl);
        }
        if (cat && Array.isArray(cat.data)) {
          setCatalogBooks(cat.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const mergedBooks = useMemo(() => {
    const seen = new Set();
    const list = [];
    const pushUnique = (arr) => {
      arr.forEach((item) => {
        if (!item) return;
        const key = item.id_livro ? `id-${item.id_livro}` : `t-${item.titulo}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push(item);
        }
      });
    };
    pushUnique(highlights.destaques);
    pushUnique(highlights.mais_procurados);
    pushUnique(catalogBooks);
    if (list.length < 5) pushUnique(fallbackBooks);
    return list;
  }, [highlights, catalogBooks]);

  const featuredBook = mergedBooks[0] || fallbackBooks[0];
  const popularBooks = mergedBooks.slice(0, 4);
  const collectionBook = mergedBooks[4] || mergedBooks[1] || fallbackBooks[1];
  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);

  const firstName =
    profile?.bibliotecario?.nome?.split(' ')[0] ||
    profile?.cliente?.nome?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    '';

  const featuredExcerpt =
    featuredBook.sinopse ||
    'Descubra este título disponível no acervo da GuMa e faça sua solicitação de retirada online.';

  return (
    <div className="editorial-home">
      {/* PRIMEIRA SEÇÃO: LIVRO ABERTO EM DUAS PÁGINAS */}
      <div className="spread-layout">
        {/* PÁGINA ESQUERDA (#f2efe8) */}
        <section className="spread-left">
          <div className="spread-hero-block">
            <div className="spread-hero-copy">
              <h1>
                {firstName ? (
                  <>Boa leitura,<br/>{firstName}</>
                ) : (
                  <>Boa leitura,<br/>na GuMa</>
                )}
              </h1>
              <p>
                Explore o acervo da biblioteca, descubra novas histórias e acompanhe suas solicitações de empréstimo em um só lugar.
              </p>
              <Link to="/catalogo" className="spread-cta">
                Começar a ler <ArrowUpRight size={15} strokeWidth={2.2}/>
              </Link>
            </div>

            <Link to={bookHref(featuredBook)} className="open-book-bridge" aria-label={`Abrir detalhes de ${featuredBook.titulo}`}>
              <div className="open-book-obj">
                <div className="open-page open-page-left">
                  <div className="open-page-ornament">CAPÍTULO I</div>
                  <p className="open-page-text">{featuredExcerpt}</p>
                  <p className="open-page-text muted-lines">
                    Na GuMa, cada exemplar físico do acervo se conecta ao catálogo digital para facilitar sua reserva e manter sua estante organizada.
                  </p>
                </div>
                <div className="open-page open-page-right">
                  {featuredBook.imagem_capa_url ? (
                    <img src={featuredBook.imagem_capa_url} alt={featuredBook.titulo}/>
                  ) : (
                    <div className="open-page-art">
                      <span className="open-art-brand">GUMA ACERVO</span>
                      <strong>{featuredBook.titulo}</strong>
                      <small>{featuredBook.autor || 'Edição da biblioteca'}</small>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </div>

          <div className="spread-section">
            <div className="spread-section-head">
              <h2>Em alta agora</h2>
              <Link to="/catalogo" className="dots-link" aria-label="Ver todo o catálogo" title="Ver todo o catálogo">••</Link>
            </div>
            <div className="spread-book-grid">
              {popularBooks.map((book, idx) => (
                <Link key={book.id_livro || book.titulo} to={bookHref(book)} className="spread-book-item">
                  <BookThumb book={book} index={idx}/>
                  <strong>{book.titulo}</strong>
                  <span>{book.autor || book.tema || 'Acervo GuMa'}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="spread-section spread-collection">
            <div className="spread-section-head">
              <h2>Coleção em destaque</h2>
              <Link to="/catalogo" className="dots-link" aria-label="Ver coleção completa" title="Ver coleção completa">••</Link>
            </div>
            <Link to={bookHref(collectionBook)} className="series-row">
              <div className="series-thumbs">
                <div className="series-mini back" style={{ backgroundColor: '#1c473c' }}/>
                <div className="series-mini front" style={{ backgroundColor: '#7d4431' }}>
                  {collectionBook.imagem_capa_url ? (
                    <img src={collectionBook.imagem_capa_url} alt={collectionBook.titulo}/>
                  ) : (
                    <span>GuMa</span>
                  )}
                </div>
              </div>
              <div className="series-meta">
                <strong>{collectionBook.titulo}</strong>
                <span>{collectionBook.tema || collectionBook.autor || 'Acervo físico disponível'}</span>
              </div>
              <div className="series-count">
                {collectionBook.quantidade_total ?? 1} ex.
              </div>
            </Link>
          </div>
        </section>

        {/* PÁGINA DIREITA (#faf9f5) */}
        <aside className="spread-right">
          <div className="featured-detail">
            <Link to={bookHref(featuredBook)} className="featured-title-link">
              <h2>{featuredBook.titulo}</h2>
            </Link>
            <div className="featured-progress">
              <span className="progress-accent">{featuredBook.quantidade_disponivel ?? 1}</span>
              <span className="progress-total"> / {featuredBook.quantidade_total ?? 1} exemplares disponíveis</span>
            </div>
            <p className="featured-synopsis">{featuredExcerpt}</p>
            <div className="featured-author">– {featuredBook.autor || 'Acervo GuMa'}</div>
          </div>

          <div className="schedule-block">
            <div className="spread-section-head">
              <h2>Agenda de leitura</h2>
              <div className="schedule-nav">
                <button type="button" onClick={() => setWeekOffset((w) => w - 1)} aria-label="Semana anterior">
                  <ChevronLeft size={16}/>
                </button>
                <button type="button" onClick={() => setWeekOffset((w) => w + 1)} aria-label="Próxima semana">
                  <ChevronRight size={16}/>
                </button>
              </div>
            </div>
            <div className="week-strip">
              {weekDays.map((d) => {
                const active = selectedDay === d.key;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setSelectedDay(d.key)}
                    className={`day-pill ${active ? 'active' : ''} ${d.isSunday ? 'sunday' : ''}`}
                  >
                    <span className="day-name">{d.label}</span>
                    <strong className="day-num">{d.day}</strong>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="friends-block">
            <div className="spread-section-head">
              <h2>Leitores da GuMa</h2>
              <Link to="/catalogo" className="dots-link" aria-label="Ver catálogo" title="Ver catálogo">••</Link>
            </div>
            <div className="friends-timeline">
              {readerNotes.map((note) => (
                <article key={note.name} className="friend-item">
                  <span className="friend-avatar" style={{ backgroundColor: note.color }}>
                    {note.initials}
                  </span>
                  <div className="friend-body">
                    <strong>{note.name}</strong>
                    <p>{note.text}</p>
                    <div className="friend-foot">
                      <span className="friend-chapter">
                        <Check size={12} strokeWidth={2.5}/> {note.book}
                      </span>
                      <small>{note.time}</small>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* CONTINUAÇÃO EDITORIAL DA PÁGINA INICIAL */}
      <div className="editorial-continuation">
        {/* Barra Explorar por Tema */}
        <section className="editorial-topic-bar">
          <div className="editorial-wrap editorial-topic-inner">
            <span className="topic-label">Explorar por tema</span>
            <div className="topic-chips">
              {quickTopics.map((topic) => (
                <Link key={topic} className="topic-chip" to={`/catalogo?q=${encodeURIComponent(topic)}`}>
                  {topic}
                </Link>
              ))}
              <Link className="topic-chip topic-chip-all" to="/catalogo">
                Ver todos <ArrowRight size={14}/>
              </Link>
            </div>
          </div>
        </section>

        <div className="editorial-wrap editorial-sections">
          {/* Destaques do acervo (do banco) */}
          {!loading && highlights?.destaques?.length > 0 && (
            <section className="editorial-section">
              <div className="editorial-section-head">
                <div>
                  <h2>Destaques do acervo</h2>
                  <p>Títulos selecionados pela equipe da biblioteca.</p>
                </div>
                <Link className="text-link" to="/catalogo">
                  Ver catálogo <ArrowUpRight size={17}/>
                </Link>
              </div>
              <div className="book-grid">
                {highlights.destaques.slice(0, 4).map((b) => (
                  <BookCard key={b.id_livro} book={b}/>
                ))}
              </div>
            </section>
          )}

          {/* Clássicos para começar */}
          <section className="editorial-section">
            <div className="editorial-section-head">
              <div>
                <h2>Clássicos para começar</h2>
                <p>Sugestões para explorar no catálogo local ou descobrir no Google Books.</p>
              </div>
              <Link className="text-link" to="/descobrir">
                Buscar no Google Books <ArrowUpRight size={17}/>
              </Link>
            </div>
            <div className="recommended-grid">
              {recommendedShelf.map((item) => (
                <Link className="recommended-card editorial-card" key={item.title} to={`/catalogo?q=${encodeURIComponent(item.title)}`}>
                  <span className="recommended-tag">{item.tag}</span>
                  <h3>{item.title}</h3>
                  <strong>{item.author}</strong>
                  <p>{item.description}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Entrevista literária */}
          <section className="editorial-section">
            <div className="video-feature editorial-video">
              <div className="video-feature-copy">
                <h2>Entrevista: Maggie O’Farrell</h2>
                <p>A autora fala sobre processo criativo e os bastidores do romance Hamnet, em um espaço dedicado a descobrir histórias pela voz de quem escreve.</p>
                <Link className="spread-cta" to="/descobrir">
                  Descobrir livros <ArrowUpRight size={15}/>
                </Link>
              </div>
              <div className="video-frame">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/l6T9H_idh8Y?mute=1&rel=0"
                  title="Entrevista com Maggie O’Farrell sobre o romance Hamnet"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
                <a className="youtube-backup" href="https://www.youtube.com/watch?v=l6T9H_idh8Y" target="_blank" rel="noopener noreferrer">
                  Abrir no YouTube
                </a>
              </div>
            </div>
          </section>

          {/* Banner de cadastro */}
          <section className="editorial-cta-banner">
            <div>
              <h2>Crie sua conta na biblioteca</h2>
              <p>Acompanhe solicitações, prazos de devolução e mantenha sua estante organizada.</p>
            </div>
            <Link className="button button-cream" to="/login">
              Entrar ou cadastrar <ArrowRight size={17}/>
            </Link>
          </section>
        </div>

        {/* Rodapé editorial */}
        <footer className="editorial-footer">
          <div className="editorial-wrap editorial-footer-inner">
            <span className="editorial-footer-brand">GuMa</span>
            <p>Biblioteca Digital © {new Date().getFullYear()}</p>
            <div className="footer-links">
              <Link to="/catalogo">Catálogo</Link>
              <Link to="/descobrir">Google Books</Link>
              <Link to="/seguranca">Segurança</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
