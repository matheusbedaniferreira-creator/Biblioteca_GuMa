import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen } from 'lucide-react';

const colors = [
  ['#17453e', '#ebd5a5'], ['#bd6a45', '#fff1e0'], ['#5f628e', '#e5e2ff'],
  ['#c7a656', '#343227'], ['#36566f', '#f1dfbf'], ['#805d61', '#f4ece3'],
];
export function BookCover({ book, size = '' }) {
  const [bg, ink] = colors[(Number(book?.id_livro) || 0) % colors.length];
  return <div className={`book-cover ${size}`} style={{ background: bg, color: ink }}>
    {book?.imagem_capa_url ? <img src={book.imagem_capa_url} alt={`Capa de ${book.titulo}`} loading="lazy" onError={event => { event.currentTarget.style.display = 'none'; }} /> : null}
    <div className="cover-fallback" aria-hidden="true"><BookOpen size={28} strokeWidth={1.3}/><div className="cover-line"/><span>{book?.titulo}</span><small>{book?.autor || 'Acervo da biblioteca'}</small></div>
  </div>;
}
export default function BookCard({ book }) {
  return <Link className="book-card" to={`/livro/${book.id_livro}`}>
    <BookCover book={book}/>
    <div className="book-card-meta">
      <span className="eyebrow muted">{book.tema || 'Literatura'}</span>
      <h3>{book.titulo}</h3>
      <p>{book.autor || 'Autor não informado'}</p>
      <div className="book-card-bottom"><span className={`availability ${book.quantidade_disponivel > 0 ? 'yes' : 'no'}`}><i/>{book.quantidade_disponivel > 0 ? 'Disponível' : 'Indisponível'}</span><ArrowUpRight size={18}/></div>
    </div>
  </Link>;
}
