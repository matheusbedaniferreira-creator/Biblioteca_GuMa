import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Heart,
  Search,
  ShieldCheck,
  Sparkles,
  Pause,
  Play,
} from 'lucide-react';
import { api } from '../lib/api';
import BookCard from '../components/BookCard';
import featuredBooksImage from '../assets/featured-books-guma.webp';

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
  const [slideIndex, setSlideIndex] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api('/livros/destaques')
      .then(setCollections)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const carouselSlides = useMemo(() => [
    {
      type: 'image',
      eyebrow: 'DESTAQUE DA SEMANA',
      title: 'Livros em evidência na GuMa',
      description: 'Títulos selecionados para inspirar sua próxima leitura, do acervo físico às descobertas digitais.',
      media: featuredBooksImage,
      actionLabel: 'Explorar o catálogo',
      actionTo: '/catalogo',
    },
    {
      type: 'video',
      eyebrow: 'ENTREVISTA',
      title: 'Conversa com Maggie O’Farrell',
      description: 'A autora fala sobre processo criativo e os bastidores do romance Hamnet.',
      media: 'https://www.youtube-nocookie.com/embed/l6T9H_idh8Y?autoplay=1&mute=1&loop=1&playlist=l6T9H_idh8Y&controls=1&rel=0',
      actionLabel: 'Descobrir no Google Books',
      actionTo: '/descobrir',
      videoUrl: 'https://www.youtube.com/watch?v=l6T9H_idh8Y',
    },
  ], []);

  useEffect(() => {
    // Nao mude automaticamente enquanto a entrevista estiver em exibicao.
    if (carouselPaused || slideIndex === 1) return;
    const timer = setTimeout(() => {
      setSlideIndex(current => (current + 1) % carouselSlides.length);
    }, 8000);
    return () => clearTimeout(timer);
  }, [carouselSlides.length, slideIndex, carouselPaused]);

  const currentSlide = carouselSlides[slideIndex];
  const nextSlide = () => setSlideIndex(current => (current + 1) % carouselSlides.length);
  const prevSlide = () => setSlideIndex(current => (current - 1 + carouselSlides.length) % carouselSlides.length);

  return <>
    <section className="hero"><div className="container hero-grid">
      <div className="hero-copy"><span className="eyebrow hero-eyebrow"><Sparkles size={15}/> SUA PRÓXIMA HISTÓRIA COMEÇA AQUI</span>
        <h1>Todo livro abre <em>um novo mundo.</em></h1>
        <p>Descubra histórias, explore novos autores e encontre sua próxima leitura favorita. Na GuMa, sua biblioteca digital e o acervo físico caminham juntos.</p>
        <form className="hero-search" onSubmit={e => { e.preventDefault(); navigate(`/catalogo?q=${encodeURIComponent(query)}`); }}>
          <Search size={20}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Qual história você procura?" aria-label="Pesquisar livros"/><button aria-label="Buscar livros" type="submit"><ArrowRight size={21}/></button>
        </form>
        <div className="hero-mini"><span className="hero-dot"/> Explore o acervo, descubra recomendações e acompanhe seus pedidos em um só lugar</div>
      </div>
      <div className="hero-art" aria-hidden="true"><div className="art-orbit art-orbit-one"/><div className="art-orbit art-orbit-two"/><div className="decor-spark decor-one">✧</div><div className="decor-spark decor-two">✳</div><div className="hero-book hero-book-back"><span>GUMA<br/>READS</span></div><div className="hero-book hero-book-front"><span className="tiny">BIBLIOTECA</span><span className="large">leia<br/>mais.</span><span className="tiny bottom">ACERVO E DESCOBERTA</span></div><div className="art-quote"><BookOpenText size={18}/> Uma página de cada vez.</div></div>
    </div></section>

    <section className="benefits"><div className="container benefit-grid"><div><BookOpenText size={24}/><span><strong>Acervo completo</strong><small>Busque títulos locais e no Google Books</small></span></div><div><Heart size={24}/><span><strong>Solicite online</strong><small>Reserve a retirada sem complicação</small></span></div><div><ShieldCheck size={24}/><span><strong>Conta protegida</strong><small>Sessão no servidor e controle de acesso</small></span></div></div></section>

    <section className="carousel-section"><div className="container">
      <div className="section-heading"><div><span className="eyebrow accent">EM DESTAQUE NA GUMA</span><h2>Vitrine da <em>semana</em></h2><p>Sugestões visuais e entrevistas para inspirar sua próxima leitura.</p></div><Link className="text-link" to="/descobrir">Buscar no Google Books <ArrowUpRight size={18}/></Link></div>
      <div className="media-carousel">
        <button type="button" className="carousel-arrow left" onClick={prevSlide} aria-label="Slide anterior"><ChevronLeft size={20}/></button>
        <div className="carousel-content">
          <div className="carousel-copy">
            <span className="eyebrow accent">{currentSlide.eyebrow}</span>
            <h3>{currentSlide.title}</h3>
            <p>{currentSlide.description}</p>
            <Link className="button button-dark" to={currentSlide.actionTo}>{currentSlide.actionLabel} <ArrowRight size={17}/></Link>
          </div>
          <div className="carousel-media">
            {currentSlide.type === 'image' && <img src={currentSlide.media} alt="Livros em destaque na GuMa"/>}
            {currentSlide.type === 'video' && (
              <div className="video-frame">
                <iframe
                  src={currentSlide.media}
                  title="Entrevista com Maggie O’Farrell sobre o romance Hamnet"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
                <a className="youtube-backup" href={currentSlide.videoUrl} target="_blank" rel="noopener noreferrer">Ver entrevista no YouTube</a>
              </div>
            )}
          </div>
        </div>
        <button type="button" className="carousel-arrow right" onClick={nextSlide} aria-label="Próximo slide"><ChevronRight size={20}/></button>
      </div>
      <div className="carousel-controls"><div className="carousel-dots">{carouselSlides.map((slide, index) => <button key={slide.title} type="button" className={index === slideIndex ? 'dot active' : 'dot'} onClick={() => setSlideIndex(index)} aria-label={`Abrir slide ${index + 1}`}/>)}</div><button className="carousel-play-toggle" type="button" onClick={() => setCarouselPaused(value => !value)} aria-label={carouselPaused ? "Retomar rotação do carrossel" : "Pausar rotação do carrossel"}>{carouselPaused ? <Play size={16}/> : <Pause size={16}/>} {carouselPaused ? "Retomar" : "Pausar"}</button></div>
    </div></section>

    <div className="container collections">
      <section className="collection-section"><div className="section-heading"><div><span className="eyebrow accent">RECOMENDAÇÕES</span><h2>Clássicos para <em>começar</em></h2><p>Alguns títulos essenciais que você encontra por aqui.</p></div><Link className="text-link" to="/catalogo">Ver todo o acervo <ArrowUpRight size={18}/></Link></div>
        <div className="recommended-grid">{recommendedShelf.map(item => <article className="recommended-card" key={item.title}><span className="recommended-tag">{item.tag}</span><h3>{item.title}</h3><strong>{item.author}</strong><p>{item.description}</p></article>)}</div>
      </section>

      {!loading && collections.destaques.length > 0 && (
        <section className="collection-section"><div className="section-heading"><div><span className="eyebrow accent">CURADORIA DA BIBLIOTECA</span><h2>Escolhas da <em>equipe</em></h2></div><Link className="text-link" to="/catalogo">Ver todo o acervo <ArrowUpRight size={18}/></Link></div>
          <div className="book-grid">{collections.destaques.slice(0, 4).map(b => <BookCard key={b.id_livro} book={b}/>)}</div>
        </section>
      )}

      <section className="feature-banner"><div><span className="eyebrow light">PARA QUEM AMA LER</span><h2>Seu próximo capítulo<br/>está esperando.</h2><p>Crie sua conta, acompanhe solicitações de empréstimo e mantenha sua estante organizada.</p><Link className="button button-cream" to="/login">Criar minha conta <ArrowRight size={18}/></Link></div><div className="banner-illustration" aria-hidden="true"><span>GU<br/>MA.</span></div></section>

      {!loading && collections.mais_procurados.length > 0 && (
        <section className="collection-section"><div className="section-heading"><div><span className="eyebrow accent">LEITURAS EM ALTA</span><h2>Mais <em>procurados</em></h2><p>Os títulos mais solicitados pelos leitores.</p></div><Link className="text-link" to="/catalogo">Explorar catálogo <ArrowUpRight size={18}/></Link></div>
          <div className="book-grid">{collections.mais_procurados.slice(0, 4).map(b => <BookCard key={b.id_livro} book={b}/>)}</div>
        </section>
      )}

      <section className="security-section">
        <div className="security-note" style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, flexWrap:'wrap'}}>
          <div><strong>Arquitetura segura:</strong> autenticação gerenciada, sessões criptografadas no servidor, logs de auditoria e controle de acesso por perfil.</div>
          <Link className="text-link" to="/seguranca">Ver detalhes de segurança <ArrowUpRight size={18}/></Link>
        </div>
      </section>
    </div>
  </>;
}
