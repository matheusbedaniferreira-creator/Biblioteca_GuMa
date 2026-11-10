import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, BookOpenText, ArrowLeft, ArrowRight } from 'lucide-react';
import BookCard from '../components/BookCard';
import Notice from '../components/Notice';
import { api } from '../lib/api';

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const onlyAvailable = params.get('disponivel') === '1';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [draft, setDraft] = useState(query);
  const [data, setData] = useState({ data: [], current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { setDraft(query); }, [query]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    api(`/livros?q=${encodeURIComponent(query)}&disponivel=${onlyAvailable ? '1' : '0'}&page=${page}`, { signal: controller.signal })
      .then(setData).catch(e => { if (!controller.signal.aborted) setError(e.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query, onlyAvailable, page]);
  const update = (changes) => setParams(prev => { const next = new URLSearchParams(prev); Object.entries(changes).forEach(([k, v]) => v ? next.set(k, v) : next.delete(k)); next.delete('page'); return next; });
  return <div className="container page-block catalog-page"><div className="page-top"><span className="eyebrow accent">NOSSO ACERVO</span><h1>Encontre sua <em>próxima leitura.</em></h1><p>Explore o catálogo da biblioteca e descubra livros para todos os gostos.</p></div>
    <div className="catalog-toolbar"><form className="catalog-search" onSubmit={e => { e.preventDefault(); update({ q: draft }); }}><Search size={20}/><input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Título, autor ou assunto…" aria-label="Pesquisar livros"/><button type="submit">Buscar</button></form><label className="filter-switch"><SlidersHorizontal size={19}/><input type="checkbox" checked={onlyAvailable} onChange={e => update({ disponivel: e.target.checked ? '1' : '' })}/> Somente disponíveis</label></div>
    <div className="results-label"><strong>{loading ? 'Buscando…' : `${data.total} livro(s) encontrado(s)`}</strong>{query && <span>Resultados para “{query}”</span>}</div>
    <Notice message={error}/>
    <p className="detail-note">Não encontrou no nosso acervo? <Link to={`/descobrir?q=${encodeURIComponent(query)}`}>Busque capas e descrições no Google Books</Link>. Resultados externos não têm estoque local.</p>
    {!loading && !data.data.length ? <div className="empty-panel"><BookOpenText size={33}/><h3>Nenhum livro encontrado</h3><p>Tente outra palavra-chave ou remova os filtros.</p></div> : <div className="book-grid">{data.data.map(book => <BookCard key={book.id_livro} book={book}/>)}</div>}
    {data.last_page > 1 && <div className="pagination"><button disabled={page <= 1} onClick={() => setParams(p => { const a = new URLSearchParams(p); a.set('page', String(page - 1)); return a; })}><ArrowLeft size={17}/> Anterior</button><span>Página {data.current_page} de {data.last_page}</span><button disabled={page >= data.last_page} onClick={() => setParams(p => { const a = new URLSearchParams(p); a.set('page', String(page + 1)); return a; })}>Próxima <ArrowRight size={17}/></button></div>}
  </div>;
}
