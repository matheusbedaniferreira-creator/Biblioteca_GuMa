import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

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
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
    return {
      key: d.toISOString().slice(0, 10),
      label: WEEK_DAYS[i],
      day: d.getDate(),
      isToday,
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
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    Promise.all([
      api('/livros/destaques').catch(() => null),
      api('/livros?page=1').catch(() => null),
    ]).then(([hl, cat]) => {
      if (hl && Array.isArray(hl.destaques) && Array.isArray(hl.mais_procurados)) {
        setHighlights(hl);
      }
      if (cat && Array.isArray(cat.data)) {
        setCatalogBooks(cat.data);
      }
    });
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

          {/* Livro aberto central apoiado sobre a dobra das duas páginas */}
          <Link to={bookHref(featuredBook)} className="open-book-bridge" aria-label={`Abrir detalhes de ${featuredBook.titulo}`}>
            <div className="open-book-obj">
              <div className="open-page open-page-left">
                <div className="open-page-ornament">CAPÍTULO I</div>
                <p className="open-page-text">
                  {featuredExcerpt}
                </p>
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

        {/* Em alta no acervo (4 capas) */}
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

        {/* Coleção em destaque (rodapé esquerdo) */}
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
        {/* Detalhe do livro aberto */}
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

        {/* Agenda de leitura */}
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

        {/* Leitores da GuMa (timeline pontilhada) */}
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
  );
}
