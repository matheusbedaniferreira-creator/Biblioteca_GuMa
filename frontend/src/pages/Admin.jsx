import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, BookOpenText, CheckCircle2, ClipboardList, LayoutDashboard, LibraryBig, Plus, RefreshCw, Search, Users, X } from 'lucide-react';
import { api, dateTime, localDate, statusText } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Notice from '../components/Notice';

const emptyBook = { titulo: '', tema: '', secao: '', edicao: '', ano_publicacao: '', sinopse: '', imagem_capa_url: '', quantidade_total: 1, id_autor: '', id_biblioteca: '', destaque: false };
const todayPlus = (days = 14) => { const date = new Date(); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); };
const toBookPayload = b => ({
  titulo: b.titulo, tema: b.tema || null, secao: b.secao || null, edicao: b.edicao || null,
  ano_publicacao: b.ano_publicacao === '' ? null : Number(b.ano_publicacao),
  sinopse: b.sinopse || null, imagem_capa_url: b.imagem_capa_url || null,
  quantidade_total: Number(b.quantidade_total), id_autor: b.id_autor ? Number(b.id_autor) : null,
  id_biblioteca: Number(b.id_biblioteca), destaque: Boolean(b.destaque),
});

export default function Admin() {
  const { profile, authenticated } = useAuth();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null); const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]); const [libraries, setLibraries] = useState([]);
  const [requests, setRequests] = useState([]); const [loans, setLoans] = useState([]); const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false); const [book, setBook] = useState(emptyBook);
  const [editingId, setEditingId] = useState(null); const [bookSearch, setBookSearch] = useState('');
  const [booksPage, setBooksPage] = useState(1); const [booksLastPage, setBooksLastPage] = useState(1);
  const [loanBookSearch, setLoanBookSearch] = useState(''); const [loanBooks, setLoanBooks] = useState([]);
  const [authorName, setAuthorName] = useState(''); const [libraryName, setLibraryName] = useState('');
  const [manualLoan, setManualLoan] = useState({ id_cliente: '', id_livro: '', data_prevista_devolucao: todayPlus() });
  const [dueDates, setDueDates] = useState({});
  const [googleSearch, setGoogleSearch] = useState('');
  const [googleResults, setGoogleResults] = useState([]);
  const [googleBusy, setGoogleBusy] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!authenticated) return;
    const [s, b, a, l, r, loansData, c] = await Promise.all([
      api('/admin/dashboard', {}), api('/admin/livros?page=1&per_page=24', {}),
      api('/admin/autores', {}), api('/admin/bibliotecas', {}),
      api('/admin/solicitacoes', {}), api('/admin/emprestimos', {}),
      api('/admin/clientes', {}),
    ]);
    setStats(s); setBooks(b.data); setBooksPage(1); setBooksLastPage(b.last_page);
    setAuthors(a); setLibraries(l); setRequests(r); setLoans(loansData); setCustomers(c);
  }, [authenticated]);
  useEffect(() => { fetchAll().catch(e => setError(e.message)); }, [fetchAll]);

  async function run(action, success) {
    setBusy(true); setError(''); setNotice('');
    try { await action(); await fetchAll(); setNotice(success); return true; }
    catch (e) { setError(e.message); return false; } finally { setBusy(false); }
  }
  async function findGoogleBooks(e) {
    e.preventDefault();
    if (googleSearch.trim().length < 2) return;
    setGoogleBusy(true); setError('');
    try {
      const result = await api(`/google-books?q=${encodeURIComponent(googleSearch.trim())}`);
      setGoogleResults(result.items || []);
    } catch (e) { setError(e.message); } finally { setGoogleBusy(false); }
  }
  function useGoogleMetadata(item) {
    const known = authors.find(a => (a.nome || '').toLocaleLowerCase('pt-BR') === (item.autores[0] || '').toLocaleLowerCase('pt-BR'));
    setEditingId(null);
    setBook({ ...emptyBook, titulo: item.titulo, ano_publicacao: item.ano_publicacao || '',
      sinopse: item.descricao || '', imagem_capa_url: item.imagem_capa_url || '',
      id_autor: known?.id_autor || '', id_biblioteca: libraries[0]?.id_biblioteca || '', quantidade_total: 1 });
    setNotice(known ? 'Metadados preenchidos. Confira a edição e o estoque físico antes de cadastrar.' :
      `Metadados preenchidos. Cadastre o autor ${item.autores[0] || '(não informado)'} em Cadastros, se necessário, e confirme o estoque antes de salvar.`);
    setGoogleResults([]);
  }
  async function saveBook(e) {
    e.preventDefault();
    const ok = await run(() => api(editingId ? `/admin/livros/${editingId}` : '/admin/livros', {
      method: editingId ? 'PATCH' : 'POST', body: toBookPayload(book),
    }), editingId ? 'Livro atualizado com sucesso.' : 'Livro cadastrado com sucesso.');
    if (ok) { setEditingId(null); setBook(emptyBook); }
  }
  function editBook(b) {
    setEditingId(b.id_livro);
    setBook({ ...emptyBook, ...b, id_autor: b.id_autor || '', id_biblioteca: b.id_biblioteca || '', ano_publicacao: b.ano_publicacao ?? '', imagem_capa_url: b.imagem_capa_url || '' });
    setTab('books'); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function addAuthor(e) {
    e.preventDefault();
    const ok = await run(() => api('/admin/autores', { method: 'POST', body: { nome: authorName } }), 'Autor cadastrado.');
    if (ok) setAuthorName('');
  }
  async function addLibrary(e) {
    e.preventDefault();
    const ok = await run(() => api('/admin/bibliotecas', { method: 'POST', body: { nome: libraryName, horario_abertura: '08:00', horario_fechamento: '18:00' } }), 'Biblioteca cadastrada. Ajuste os horários no banco, se necessário.');
    if (ok) setLibraryName('');
  }
  async function approve(r) {
    if (!window.confirm(`Confirmar a retirada de "${r.titulo}" por ${r.cliente}? O estoque será reduzido.`)) return;
    await run(() => api(`/admin/solicitacoes/${r.id_solicitacao}/emprestar`, {
      method: 'POST', body: { data_prevista_devolucao: dueDates[r.id_solicitacao] || todayPlus() },
    }), 'Retirada registrada e empréstimo criado.');
  }
  async function reject(r) {
    if (!window.confirm(`Recusar a solicitação de ${r.cliente}?`)) return;
    await run(() => api(`/admin/solicitacoes/${r.id_solicitacao}/recusar`, { method: 'POST' }), 'Solicitação recusada.');
  }
  async function returnBook(l) {
    if (!window.confirm(`Confirmar devolução de "${l.titulo}" por ${l.cliente}?`)) return;
    await run(() => api(`/admin/emprestimos/${l.id_emprestimo}/devolver`, { method: 'POST' }), 'Devolução confirmada.');
  }
  async function createManualLoan(e) {
    e.preventDefault();
    const ok = await run(() => api('/admin/emprestimos', {
      method: 'POST', body: { id_cliente: Number(manualLoan.id_cliente), id_livro: Number(manualLoan.id_livro), data_prevista_devolucao: manualLoan.data_prevista_devolucao },
    }), 'Empréstimo manual cadastrado.');
    if (ok) setManualLoan({ id_cliente: '', id_livro: '', data_prevista_devolucao: todayPlus() });
  }
  const tabs = [
    ['overview', LayoutDashboard, 'Visão geral'], ['books', BookOpenText, 'Acervo'],
    ['requests', ClipboardList, 'Solicitações'], ['loans', LibraryBig, 'Empréstimos'], ['people', Users, 'Cadastros'],
  ];
  // Pesquisa administrativa no servidor: nao limita o acervo a 12 titulos.
  useEffect(() => {
    if (!authenticated) return;
    const timer = setTimeout(() => {
      api(`/admin/livros?q=${encodeURIComponent(bookSearch)}&page=${booksPage}&per_page=24`, {})
        .then(b => { setBooks(b.data); setBooksLastPage(b.last_page); })
        .catch(e => setError(e.message));
    }, 280);
    return () => clearTimeout(timer);
  }, [bookSearch, booksPage, authenticated]);
  useEffect(() => {
    if (!authenticated) return;
    const timer = setTimeout(() => {
      api(`/admin/livros?q=${encodeURIComponent(loanBookSearch)}&per_page=100`, {})
        .then(b => setLoanBooks(b.data)).catch(e => setError(e.message));
    }, 280);
    return () => clearTimeout(timer);
  }, [loanBookSearch, authenticated]);
  const visibleBooks = books;
  return <div className="admin-layout"><aside className="admin-sidebar"><div className="sidebar-logo"><BookOpenText size={26}/> <span>folha<span className="brand-dot">.</span></span><small>GESTÃO</small></div><div className="sidebar-label">ESPAÇO ADMINISTRATIVO</div><nav>{tabs.map(([key, Icon, label]) => <button key={key} onClick={() => { setTab(key); setError(''); setNotice(''); }} className={tab === key ? 'side-item selected' : 'side-item'}><Icon size={19}/>{label}{key === 'requests' && stats?.solicitacoes_pendentes > 0 && <b>{stats.solicitacoes_pendentes}</b>}</button>)}</nav><div className="sidebar-bottom"><span className="avatar-small">{profile?.bibliotecario?.nome?.charAt(0) || 'B'}</span><div><strong>{profile?.bibliotecario?.nome || 'Bibliotecário'}</strong><small>Equipe autorizada</small></div></div></aside>
    <div className="admin-content"><div className="admin-topbar"><div><span className="eyebrow muted">GERENCIAMENTO DA BIBLIOTECA</span><h1>{tabs.find(x => x[0] === tab)?.[2]}</h1></div><button className="button button-outline button-small" onClick={() => run(fetchAll, 'Dados atualizados.')} disabled={busy}><RefreshCw size={16}/> Atualizar</button></div>
      <Notice message={error} onClose={() => setError('')}/><Notice message={notice} kind="success" onClose={() => setNotice('')}/>
      {tab === 'overview' && <><div className="stat-grid">{[
        ['Livros cadastrados', stats?.livros, BookOpenText], ['Exemplares disponíveis', stats?.exemplares_disponiveis, LibraryBig],
        ['Empréstimos ativos', stats?.emprestimos_ativos, ClipboardList], ['Solicitações pendentes', stats?.solicitacoes_pendentes, Users],
      ].map(([title, value, Icon]) => <div className="stat-card" key={title}><span className="stat-icon"><Icon size={23}/></span><small>{title}</small><strong>{value ?? '—'}</strong></div>)}</div>
        <div className="admin-two-cols"><section className="white-panel"><div className="panel-heading"><h2>Solicitações recentes</h2><button className="text-button" onClick={() => setTab('requests')}>Ver todas <ArrowRight size={16}/></button></div><div className="stack-items">{requests.slice(0, 5).map(r => <div className="activity-item" key={r.id_solicitacao}><span className="activity-icon"><BookOpenText size={19}/></span><div className="activity-details"><strong>{r.titulo}</strong><small>{r.cliente}</small></div><span className={`status-tag status-${r.status.toLowerCase()}`}>{statusText[r.status]}</span></div>)}{!requests.length && <p className="subtle">Nenhuma solicitação ainda.</p>}</div></section><section className="white-panel"><div className="panel-heading"><h2>Resumo operacional</h2></div><div className="metric-list"><p><span>Clientes cadastrados</span><b>{stats?.clientes ?? '—'}</b></p><p><span>Empréstimos em atraso</span><b>{stats?.emprestimos_atrasados ?? '—'}</b></p><p><span>Pedidos aguardando análise</span><b>{stats?.solicitacoes_pendentes ?? '—'}</b></p></div><button className="button button-dark full" onClick={() => setTab('books')}><Plus size={17}/> Cadastrar novo livro</button></section></div>
      </>}
      {tab === 'books' && <div className="admin-two-cols books-admin"><section className="white-panel"><div className="panel-heading"><div><span className="eyebrow muted">CATÁLOGO</span><h2>Livros cadastrados</h2></div><span className="muted">Página {booksPage} de {booksLastPage}</span></div><div className="small-search"><Search size={17}/><input placeholder="Filtrar títulos carregados…" value={bookSearch} onChange={e => { setBookSearch(e.target.value); setBooksPage(1); }}/></div><div className="stack-items">{visibleBooks.map(b => <div className="book-management-item" key={b.id_livro}><div><strong>{b.titulo}</strong><small>{b.autor || 'Sem autor'} · {b.quantidade_disponivel}/{b.quantidade_total} disponíveis</small></div><button className="button button-outline button-small" onClick={() => editBook(b)}>Editar</button></div>)}{!visibleBooks.length && <p className="subtle">Nenhum livro nesta página corresponde à busca.</p>}</div><div className="pagination admin-pagination"><button type="button" disabled={booksPage <= 1} onClick={() => setBooksPage(booksPage - 1)}>Anterior</button><span>{booksPage} / {booksLastPage}</span><button type="button" disabled={booksPage >= booksLastPage} onClick={() => setBooksPage(booksPage + 1)}>Próxima</button></div></section>
        <section className="white-panel"><div className="panel-heading"><div><span className="eyebrow muted">{editingId ? 'EDITANDO' : 'NOVO LIVRO'}</span><h2>{editingId ? 'Editar livro' : 'Cadastrar livro'}</h2></div>{editingId && <button className="icon-button" aria-label="Cancelar edição" onClick={() => { setEditingId(null); setBook(emptyBook); }}><X size={19}/></button>}</div>
          <form className="stack-form" onSubmit={findGoogleBooks}>
            <label>Preencher dados usando Google Books (opcional)<input minLength={2} maxLength={120} value={googleSearch} onChange={e => setGoogleSearch(e.target.value)} placeholder="Título ou ISBN"/></label>
            <button type="submit" className="button button-outline button-small" disabled={googleBusy}>{googleBusy ? 'Buscando…' : 'Buscar metadados externos'}</button>
          </form>
          {googleResults.length > 0 && <div className="stack-items">{googleResults.map(item => <div key={item.google_id} className="book-management-item"><div><strong>{item.titulo}</strong><small>{item.autores.join(', ') || 'Sem autor'} · {item.ano_publicacao || 'Ano desconhecido'}</small></div><button type="button" className="button button-outline button-small" onClick={() => useGoogleMetadata(item)}>Preencher</button></div>)}</div>}
          <p className="muted mini-note">O Google Books fornece apenas metadados. O cadastro só deve ser confirmado quando houver um exemplar físico no acervo.</p>
          <form className="stack-form" onSubmit={saveBook}><label>Título *<input required maxLength={150} value={book.titulo} onChange={e => setBook({ ...book, titulo: e.target.value })} placeholder="Ex.: Dom Casmurro"/></label>
            <div className="form-two"><label>Autor<select value={book.id_autor} onChange={e => setBook({ ...book, id_autor: e.target.value })}><option value="">Não informado</option>{authors.map(a => <option key={a.id_autor} value={a.id_autor}>{a.nome}</option>)}</select></label><label>Biblioteca *<select required value={book.id_biblioteca} onChange={e => setBook({ ...book, id_biblioteca: e.target.value })}><option value="">Selecione…</option>{libraries.map(l => <option key={l.id_biblioteca} value={l.id_biblioteca}>{l.nome}</option>)}</select></label></div>
            <div className="form-two"><label>Gênero / tema<input maxLength={80} value={book.tema || ''} onChange={e => setBook({ ...book, tema: e.target.value })} placeholder="Literatura"/></label><label>Seção<input maxLength={50} value={book.secao || ''} onChange={e => setBook({ ...book, secao: e.target.value })} placeholder="Romance"/></label></div>
            <div className="form-three"><label>Edição<input maxLength={20} value={book.edicao || ''} onChange={e => setBook({ ...book, edicao: e.target.value })} placeholder="2ª"/></label><label>Ano<input type="number" min={0} max={2100} value={book.ano_publicacao ?? ''} onChange={e => setBook({ ...book, ano_publicacao: e.target.value })}/></label><label>Qtd. total *<input type="number" required min={0} max={1000000} value={book.quantidade_total} onChange={e => setBook({ ...book, quantidade_total: e.target.value })}/></label></div>
            <label>URL da capa (HTTPS)<input type="url" placeholder="https://..." value={book.imagem_capa_url || ''} onChange={e => setBook({ ...book, imagem_capa_url: e.target.value })}/></label>
            <label>Sinopse<textarea rows={4} value={book.sinopse || ''} onChange={e => setBook({ ...book, sinopse: e.target.value })} placeholder="Conte um pouco sobre a obra…"/></label>
            <label className="check-label"><input type="checkbox" checked={Boolean(book.destaque)} onChange={e => setBook({ ...book, destaque: e.target.checked })}/> Exibir como recomendado na página inicial</label>
            <button className="button button-dark full" disabled={busy}>{busy ? 'Salvando…' : editingId ? 'Salvar alterações' : 'Cadastrar livro'} <ArrowRight size={17}/></button>
            <small className="muted">O estoque disponível é calculado pelo banco. Alterar o total preserva os empréstimos ativos.</small>
          </form></section></div>}
      {tab === 'requests' && <section className="white-panel"><div className="panel-heading"><div><span className="eyebrow muted">PEDIDOS DE LEITORES</span><h2>Solicitações recebidas</h2></div></div><div className="stack-items">{requests.map(r => <div key={r.id_solicitacao} className="admin-request-item"><div className="request-details"><strong>{r.titulo}</strong><span>{r.cliente} · {r.email_cliente}</span><small>Solicitado em {dateTime(r.data_solicitacao)} · {r.quantidade_disponivel} exemplar(es) no estoque</small></div><div className="request-actions"><span className={`status-tag status-${r.status.toLowerCase()}`}>{statusText[r.status]}</span>{r.status === 'PENDENTE' && <><label className="date-inline">Devolver até<input type="date" min={todayPlus(0)} value={dueDates[r.id_solicitacao] || todayPlus()} onChange={e => setDueDates({ ...dueDates, [r.id_solicitacao]: e.target.value })}/></label><button disabled={busy || r.quantidade_disponivel < 1} className="button button-dark button-small" onClick={() => approve(r)}><CheckCircle2 size={16}/> Confirmar retirada</button><button disabled={busy} className="button button-outline button-small" onClick={() => reject(r)}>Recusar</button></>}</div></div>)}{!requests.length && <div className="table-empty">Nenhuma solicitação recebida.</div>}</div></section>}
      {tab === 'loans' && <div className="admin-two-cols"><section className="white-panel"><div className="panel-heading"><div><span className="eyebrow muted">HISTÓRICO</span><h2>Empréstimos realizados</h2></div></div><div className="stack-items">{loans.map(l => <div className="admin-request-item" key={l.id_emprestimo}><div className="request-details"><strong>{l.titulo}</strong><span>{l.cliente}</span><small>Prazo: {localDate(l.data_prevista_devolucao)} · Retirada: {dateTime(l.data_retirada)}</small></div><div className="request-actions"><span className={`status-tag status-${l.status.toLowerCase()}`}>{statusText[l.status]}</span>{l.status === 'EMPRESTADO' && <button disabled={busy} className="button button-dark button-small" onClick={() => returnBook(l)}>Registrar devolução</button>}</div></div>)}{!loans.length && <p className="subtle">Nenhum empréstimo registrado.</p>}</div></section>
        <section className="white-panel"><div className="panel-heading"><h2>Retirada manual</h2></div><p className="subtle">Utilize para empréstimos presenciais, sem solicitação online.</p><form className="stack-form" onSubmit={createManualLoan}><label>Cliente *<select required value={manualLoan.id_cliente} onChange={e => setManualLoan({ ...manualLoan, id_cliente: e.target.value })}><option value="">Selecione…</option>{customers.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nome} — {c.email}</option>)}</select></label><label>Buscar livro<input placeholder="Digite o título ou autor…" value={loanBookSearch} onChange={e => setLoanBookSearch(e.target.value)}/></label><label>Livro *<select required value={manualLoan.id_livro} onChange={e => setManualLoan({ ...manualLoan, id_livro: e.target.value })}><option value="">Selecione…</option>{loanBooks.filter(b => b.quantidade_disponivel > 0).map(b => <option key={b.id_livro} value={b.id_livro}>{b.titulo} ({b.quantidade_disponivel})</option>)}</select></label><label>Previsão de devolução *<input type="date" required min={todayPlus(0)} value={manualLoan.data_prevista_devolucao} onChange={e => setManualLoan({ ...manualLoan, data_prevista_devolucao: e.target.value })}/></label><button className="button button-dark full" disabled={busy}>Registrar empréstimo</button></form><small className="muted mini-note">Pesquise pelo título ou autor para localizar livros em acervos maiores.</small></section></div>}
      {tab === 'people' && <div className="admin-two-cols"><section className="white-panel"><div className="panel-heading"><h2>Bibliotecas e autores</h2></div><form className="stack-form inline-create" onSubmit={addAuthor}><label>Cadastrar autor<input required maxLength={100} value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Nome do autor"/></label><button className="button button-dark button-small" disabled={busy}><Plus size={16}/> Adicionar</button></form><form className="stack-form inline-create" onSubmit={addLibrary}><label>Cadastrar biblioteca<input required maxLength={100} value={libraryName} onChange={e => setLibraryName(e.target.value)} placeholder="Nome da unidade"/></label><button className="button button-dark button-small" disabled={busy}><Plus size={16}/> Adicionar</button></form><p className="muted mini-note">Novas bibliotecas recebem horário padrão de 08:00 a 18:00; ajuste conforme o funcionamento real.</p><div className="list-chips"><strong>Autores ({authors.length})</strong><p>{authors.map(a => <span key={a.id_autor}>{a.nome}</span>)}</p></div><div className="list-chips"><strong>Bibliotecas ({libraries.length})</strong><p>{libraries.map(l => <span key={l.id_biblioteca}>{l.nome}</span>)}</p></div></section><section className="white-panel"><div className="panel-heading"><h2>Clientes ({customers.length})</h2></div><div className="stack-items">{customers.map(c => <div className="book-management-item" key={c.id_cliente}><div><strong>{c.nome}</strong><small>{c.email}</small></div><span className="muted">#{c.id_cliente}</span></div>)}{!customers.length && <p className="subtle">Nenhum cliente ainda.</p>}</div></section></div>}
    </div></div>;
}
