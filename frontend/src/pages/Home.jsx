import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Heart,
  KeyRound,
  LockKeyhole,
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
    tag: 'distopia',
    description: 'Um clássico intenso para quem gosta de política, controle social e narrativas marcantes.',
  },
  {
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    tag: 'literatura brasileira',
    description: 'Ótima porta de entrada para leituras com ironia, profundidade psicológica e análise social.',
  },
  {
    title: 'O Pequeno Príncipe',
    author: 'Antoine de Saint-Exupéry',
    tag: 'sensível',
    description: 'Leitura curta, simbólica e memorável, ideal para leitores que buscam reflexões delicadas.',
  },
  {
    title: 'Orgulho e Preconceito',
    author: 'Jane Austen',
    tag: 'romance clássico',
    description: 'Para quem quer personagens fortes, diálogos elegantes e um romance muito bem construído.',
  },
];

const securityTopics = [
  {
    icon: ShieldCheck,
    title: 'Hash de senha',
    description: 'A senha nunca deve ser salva em texto puro. O provedor de autenticação trabalha com hash seguro no armazenamento.',
  },
  {
    icon: KeyRound,
    title: 'Salt automático',
    description: 'Cada senha recebe um salt próprio, dificultando ataques por tabela e reaproveitamento de hashes.',
  },
  {
    icon: LockKeyhole,
    title: 'Segredos no servidor',
    description: 'Chaves de API, credenciais do banco e a APP_KEY ficam isoladas no backend, sem exposição para o navegador.',
  },
];

export default function Home() {
  const [collections, setCollections] = useState({ destaques: [], mais_procurados: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [slideIndex, setSlideIndex] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api('/livros/destaques')
      .then(setCollections)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const carouselSlides = useMemo(() => [
    {
      type: 'image',
      eyebrow: 'DESTAQUE DA SEMANA',
      title: 'Livros em evidência na GuMa',
      description: 'Uma vitrine visual com títulos clássicos, ambiente acolhedor e identidade mais editorial para a página inicial.',
      media: featuredBooksImage,
      actionLabel: 'Explorar o catálogo',
      actionTo: '/catalogo',
    },
    {
      type: 'video',
      eyebrow: 'ENTREVISTA E CONVERSA',
      title: 'Uma conversa com a escritora Maggie O’Farrell',
      description: 'Entrevista sobre literatura e o romance Hamnet, em um espaço para descobrir histórias por meio da voz das autoras.',
      media: 'https://www.youtube-nocookie.com/embed/l6T9H_idh8Y?autoplay=1&mute=1&loop=1&playlist=l6T9H_idh8Y&controls=1&rel=0',
      actionLabel: 'Descobrir livros',
      actionTo: '/descobrir',
      videoUrl: 'https://www.youtube.com/watch?v=l6T9H_idh8Y',
    },
    {
      type: 'text',
      eyebrow: 'SEGURANÇA DIGITAL',
      title: 'Proteção por camadas, não só aparência',
      description: 'Entenda como funcionam hash, salt, sessões no servidor e proteção de credenciais com autenticação gerenciada pelo Supabase Auth.',
      actionLabel: 'Ver detalhes de segurança',
      actionTo: '/seguranca',
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

    <div className="container" style={{paddingTop: 24}}><Link className="text-link" to="/descobrir">Explorar livros e capas no Google Books <ArrowUpRight size={18}/></Link></div>

    <section className="benefits"><div className="container benefit-grid"><div><BookOpenText size={24}/><span><strong>Descubra novos livros</strong><small>Encontre seu próximo favorito</small></span></div><div><Heart size={24}/><span><strong>Solicite online</strong><small>Reserve a retirada com facilidade</small></span></div><div><Sparkles size={24}/><span><strong>Para todos os leitores</strong><small>Seu espaço para explorar</small></span></div></div></section>

    <section className="carousel-section"><div className="container">
      <div className="section-heading"><div><span className="eyebrow accent">EM DESTAQUE NA GUMA</span><h2>Carrossel com <em>curadoria visual</em></h2><p>Imagem editorial, vídeo sobre livros e um resumo da proposta de segurança da plataforma.</p></div></div>
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
            {currentSlide.type === 'image' && <img src={currentSlide.media} alt="Composição minimalista com livros em destaque"/>}
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
            {currentSlide.type === 'text' && (
              <div className="security-slide">
                {securityTopics.map(({ icon: Icon, title, description }) => (
                  <article key={title}>
                    <div className="security-mini-icon"><Icon size={18}/></div>
                    <strong>{title}</strong>
                    <p>{description}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
        <button type="button" className="carousel-arrow right" onClick={nextSlide} aria-label="Próximo slide"><ChevronRight size={20}/></button>
      </div>
      <div className="carousel-controls"><div className="carousel-dots">{carouselSlides.map((slide, index) => <button key={slide.title} type="button" className={index === slideIndex ? 'dot active' : 'dot'} onClick={() => setSlideIndex(index)} aria-label={`Abrir slide ${index + 1}`}/>)}</div><button className="carousel-play-toggle" type="button" onClick={() => setCarouselPaused(value => !value)} aria-label={carouselPaused ? "Retomar rotação do carrossel" : "Pausar rotação do carrossel"}>{carouselPaused ? <Play size={16}/> : <Pause size={16}/>} {carouselPaused ? "Retomar" : "Pausar"}</button></div>
    </div></section>

    <div className="container collections">
      {error && <div className="notice notice-error">{error}</div>}

      <section className="collection-section"><div className="section-heading"><div><span className="eyebrow accent">RECOMENDAÇÕES</span><h2>Livros mais <em>recomendados</em></h2><p>Sugestões editoriais para diferentes perfis de leitura, em uma seção pensada para destacar obras conhecidas e queridas.</p></div><Link className="text-link" to="/catalogo">Ver todo o acervo <ArrowUpRight size={18}/></Link></div>
        <div className="recommended-grid">{recommendedShelf.map(item => <article className="recommended-card" key={item.title}><span className="recommended-tag">{item.tag}</span><h3>{item.title}</h3><strong>{item.author}</strong><p>{item.description}</p></article>)}</div>
      </section>

      <section className="collection-section"><div className="section-heading"><div><span className="eyebrow accent">CURADORIA DA BIBLIOTECA</span><h2>Escolhas especiais <em>para você</em></h2><p>Livros selecionados pela equipe da GuMa.</p></div><Link className="text-link" to="/catalogo">Ver todo o acervo <ArrowUpRight size={18}/></Link></div>
        {loading ? <p className="subtle">Carregando recomendações…</p> : collections.destaques.length ? <div className="book-grid">{collections.destaques.slice(0, 4).map(b => <BookCard key={b.id_livro} book={b}/>)}</div> : <div className="empty-panel"><BookOpenText size={30}/><h3>As recomendações estão a caminho</h3><p>A equipe pode marcar livros como destaque no painel administrativo.</p></div>}
      </section>

      <section className="feature-banner"><div><span className="eyebrow light">PARA QUEM AMA LER</span><h2>Seu próximo capítulo<br/>está esperando.</h2><p>Crie uma conta gratuita, descubra livros, acompanhe pedidos e mantenha sua estante organizada.</p><Link className="button button-cream" to="/login">Criar minha conta <ArrowRight size={18}/></Link></div><div className="banner-illustration" aria-hidden="true"><span>GU<br/>MA.</span></div></section>

      <section className="collection-section"><div className="section-heading"><div><span className="eyebrow accent">LEITURAS EM ALTA</span><h2>Mais <em>procurados</em></h2><p>Classificados pelo número de solicitações realizadas.</p></div><Link className="text-link" to="/catalogo">Explorar catálogo <ArrowUpRight size={18}/></Link></div>
        {!loading && collections.mais_procurados.length ? <div className="book-grid">{collections.mais_procurados.slice(0, 4).map(b => <BookCard key={b.id_livro} book={b}/>)}</div> : !loading && <p className="subtle">Ainda não há solicitações para calcular os mais procurados.</p>}
      </section>

      <section className="security-section"><div className="section-heading"><div><span className="eyebrow accent">SEGURANÇA E CRIPTOGRAFIA</span><h2>Proteção pensada <em>desde a base</em></h2><p>Na GuMa, a parte visual conversa com uma arquitetura segura: segredo no .env, autenticação centralizada e separação clara entre frontend e backend.</p></div></div>
        <div className="security-grid">{securityTopics.map(({ icon: Icon, title, description }) => <article className="security-card" key={title}><div className="security-icon"><Icon size={22}/></div><h3>{title}</h3><p>{description}</p></article>)}</div>
        <div className="security-note"><strong>Observação técnica:</strong> o arquivo <code>.env</code> fica no backend e armazena a URL do Supabase, configurações de banco, segredos de sessão e chaves de serviços, mantendo tudo restrito ao servidor.</div>
        <Link className="text-link" to="/seguranca" style={{marginTop:20}}>Conhecer nossa arquitetura de segurança <ArrowUpRight size={18}/></Link>
      </section>
    </div>
  </>;
}
