import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, CalendarDays, CheckCircle2, LibraryBig, Send } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { BookCover } from '../components/BookCard';
import Notice from '../components/Notice';

export default function BookDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  useEffect(() => { setError(''); api(`/livros/${id}`).then(setBook).catch(e => setError(e.message)); }, [id]);
  async function requestBook() {
    setSending(true); setError(''); setMessage('');
    try { const result = await api('/me/solicitacoes', { method: 'POST', body: { id_livro: book.id_livro } }); setMessage(result.message); }
    catch (e) { setError(e.message); } finally { setSending(false); }
  }
  return <div className="container page-block"><Link to="/catalogo" className="back-link"><ArrowLeft size={17}/> Voltar ao catálogo</Link><Notice message={error}/>
    {!book ? <p className="subtle">Carregando livro…</p> : <div className="detail-grid"><div className="detail-cover"><BookCover book={book} size="large"/></div>
      <div className="detail-content"><span className="eyebrow accent">{book.tema || 'ACERVO GERAL'}</span><h1>{book.titulo}</h1><p className="detail-author">por <strong>{book.autor || 'Autor não informado'}</strong></p>
        <div className={`detail-status ${book.quantidade_disponivel > 0 ? 'available' : ''}`}><CheckCircle2 size={19}/>{book.quantidade_disponivel > 0 ? `${book.quantidade_disponivel} exemplar(es) disponível(is)` : 'Nenhum exemplar disponível agora'}</div>
        <p className="detail-synopsis">{book.sinopse || 'A biblioteca ainda não adicionou uma sinopse para este título.'}</p>
        <div className="book-facts"><div><CalendarDays size={20}/><span><small>Publicação</small><strong>{book.ano_publicacao || 'Não informado'}</strong></span></div><div><BookOpen size={20}/><span><small>Edição</small><strong>{book.edicao || 'Não informada'}</strong></span></div><div><LibraryBig size={20}/><span><small>Biblioteca</small><strong>{book.biblioteca || 'Não informada'}</strong></span></div></div>
        <Notice kind="success" message={message}/>
        {book.quantidade_disponivel > 0 ? (user ? <button className="button button-dark detail-cta" disabled={sending || !!message} onClick={requestBook}><Send size={18}/>{sending ? 'Enviando…' : message ? 'Solicitação enviada' : 'Solicitar empréstimo'}</button> : <Link className="button button-dark detail-cta" to="/login"><Send size={18}/> Faça login para solicitar</Link>) : <button className="button button-muted detail-cta" disabled>Indisponível para solicitação</button>}
        <small className="detail-note">Após solicitar, aguarde a equipe confirmar sua retirada. A solicitação não garante reserva de estoque.</small>
      </div>
    </div>}
  </div>;
}
