import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenText, CalendarDays, CircleCheck, Clock3, UserRound } from 'lucide-react';
import { api, dateTime, localDate, statusText } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Notice from '../components/Notice';

export default function MyAccount() {
  const { profile, reloadProfile, user, authenticated } = useAuth();
  const [requests, setRequests] = useState([]); const [loans, setLoans] = useState([]);
  const [error, setError] = useState(''); const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false); const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.cliente?.nome || '');
  const [phone, setPhone] = useState(profile?.cliente?.telefone || '');
  async function load() {
    const [req, loan] = await Promise.all([api('/me/solicitacoes', {}), api('/me/emprestimos', {})]);
    setRequests(req); setLoans(loan);
  }
  useEffect(() => { if (authenticated) load().catch(e => setError(e.message)); }, [authenticated]);
  useEffect(() => { setName(profile?.cliente?.nome || ''); setPhone(profile?.cliente?.telefone || ''); }, [profile?.cliente?.nome, profile?.cliente?.telefone]);
  async function cancel(id) {
    if (!window.confirm('Deseja cancelar esta solicitação?')) return;
    setBusy(true); setError('');
    try { await api(`/me/solicitacoes/${id}/cancelar`, { method: 'PATCH' }); await load(); setSuccess('Solicitação cancelada.'); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function save(e) {
    e.preventDefault(); setBusy(true); setError('');
    try { await api('/me', { method: 'PATCH', body: { nome: name, telefone: phone || null } }); await reloadProfile(); setSuccess('Perfil atualizado.'); setEditing(false); }
    catch(e) { setError(e.message); } finally { setBusy(false); }
  }
  return <div className="container page-block account-page"><div className="page-top"><span className="eyebrow accent">MINHA BIBLIOTECA</span><h1>Olá, <em>{profile?.cliente?.nome?.split(' ')[0] || user?.email?.split('@')[0]}</em></h1><p>Um lugar para acompanhar suas leituras e solicitações.</p></div><Notice message={error}/><Notice message={success} kind="success" onClose={() => setSuccess('')}/>
    <div className="account-grid"><div className="account-main"><section className="white-panel"><div className="panel-heading"><div><span className="eyebrow muted">MEUS PEDIDOS</span><h2>Solicitações de livros</h2></div><Link className="text-link" to="/catalogo">Buscar livros <ArrowRight size={17}/></Link></div>
      {!requests.length ? <div className="table-empty"><BookOpenText size={30}/><p>Você ainda não solicitou nenhum livro.</p></div> : <div className="stack-items">{requests.map(r => <div className="activity-item" key={r.id_solicitacao}><span className="activity-icon"><BookOpenText size={20}/></span><div className="activity-details"><strong>{r.titulo}</strong><small>Pedido em {dateTime(r.data_solicitacao)}</small></div><span className={`status-tag status-${r.status.toLowerCase()}`}>{statusText[r.status] || r.status}</span>{r.status === 'PENDENTE' && <button className="text-button danger" onClick={() => cancel(r.id_solicitacao)} disabled={busy}>Cancelar</button>}</div>)}</div>}
    </section><section className="white-panel"><div className="panel-heading"><div><span className="eyebrow muted">ACOMPANHAMENTO</span><h2>Empréstimos</h2></div></div>
      {!loans.length ? <div className="table-empty"><CalendarDays size={30}/><p>Seus empréstimos aparecerão aqui quando a retirada for confirmada.</p></div> : <div className="stack-items">{loans.map(l => <div className="activity-item" key={l.id_emprestimo}><span className="activity-icon"><Clock3 size={20}/></span><div className="activity-details"><strong>{l.titulo}</strong><small>Devolução prevista: {localDate(l.data_prevista_devolucao)}</small></div><span className={`status-tag status-${l.status.toLowerCase()}`}>{l.status === 'EMPRESTADO' && l.data_prevista_devolucao < new Date().toISOString().slice(0,10) ? 'Atrasado' : statusText[l.status]}</span></div>)}</div>}
    </section></div><aside className="account-aside"><div className="white-panel profile-card"><span className="profile-avatar"><UserRound size={27}/></span><h3>Meu perfil</h3><p>{user?.email}</p>{!editing ? <><div className="profile-info"><small>Nome</small><strong>{profile?.cliente?.nome || '—'}</strong><small>Telefone</small><strong>{profile?.cliente?.telefone || 'Não informado'}</strong></div><button className="button button-outline full" onClick={() => setEditing(true)}>Editar perfil</button></> : <form onSubmit={save} className="stack-form"><label>Nome<input required value={name} onChange={e => setName(e.target.value)}/></label><label>Telefone<input value={phone} onChange={e => setPhone(e.target.value)}/></label><button className="button button-dark" disabled={busy}>Salvar alterações</button><button type="button" className="text-button" onClick={() => setEditing(false)}>Cancelar</button></form>}</div><div className="aside-note"><CircleCheck size={22}/><p>As retiradas são confirmadas pela equipe da biblioteca. Confira o prazo em seus empréstimos.</p></div></aside></div>
  </div>;
}
