import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, BookOpenText, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';
import Notice from '../components/Notice';

export default function Discover() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [draft, setDraft] = useState(q);
  const [result, setResult] = useState({ items: [], total: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setDraft(q);
    if (q.trim().length < 2) { setResult({ items: [], total: 0 }); return; }
    const controller = new AbortController();
    setLoading(true); setError('');
    api(`/google-books?q=${encodeURIComponent(q)}`, { signal: controller.signal })
      .then(setResult).catch(e => { if (!controller.signal.aborted) setError(e.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [q]);
  return <div className="container page-block">
    <div className="page-top"><span className="eyebrow accent">GOOGLE BOOKS</span><h1>Descubra <em>novas leituras.</em></h1><p>Busque livros do mundo todo com capa, autores e descrição. Os resultados externos não indicam disponibilidade na nossa biblioteca.</p></div>
    <form className="catalog-search" onSubmit={e => {e.preventDefault(); if(draft.trim().length >= 2) setParams({q:draft.trim()}); }}><Search size={20}/><input required minLength={2} maxLength={120} value={draft} onChange={e => setDraft(e.target.value)} placeholder="Pesquise títulos, assuntos e autores"/><button type="submit">Buscar no Google Books</button></form>
    <p className="detail-note">Quer emprestar? <Link to="/catalogo">Confira primeiro o acervo físico disponível</Link>. Livros encontrados pelo Google não podem ser solicitados diretamente.</p>
    <Notice message={error}/>
    {loading ? <p>Pesquisando…</p> : <p className="results-label">{q ? `${result.total} resultados informados pelo Google Books` : 'Digite algo para começar'}</p>}
    <div className="discover-grid">{result.items.map(item => <article key={item.google_id} className="discover-item"><div className="discover-thumb">{item.imagem_capa_url ? <img src={item.imagem_capa_url} alt={`Capa de ${item.titulo}`} referrerPolicy="no-referrer" loading="lazy"/> : <BookOpenText size={48}/>}</div><div><h2>{item.titulo}</h2><p><strong>{item.autores.join(', ') || 'Autor não informado'}</strong>{item.ano_publicacao ? ` · ${item.ano_publicacao}` : ''}</p><p>{item.descricao || 'Descrição não fornecida pelo Google Books.'}</p>{item.info_url && <a href={item.info_url} target="_blank" rel="noopener noreferrer">Ficha no Google Books <ExternalLink size={15}/></a>}<p><small>Catálogo externo · disponibilidade não confirmada</small></p></div></article>)}</div>
  </div>;
}
