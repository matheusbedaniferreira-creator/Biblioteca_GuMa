import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpenText, Eye, EyeOff, LockKeyhole, Mail, User } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Notice from '../components/Notice';

export default function Login() {
  const location = useLocation(); const navigate = useNavigate();
  const oauthError = new URLSearchParams(location.search).get('erro');
  const { user, loading, reloadProfile } = useAuth();
  const [register, setRegister] = useState(false);
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('');
  const nextPath = location.state?.from || '/minha-conta';
  if (user && !loading) return <Navigate to={nextPath} replace/>;
  async function handleSubmit(e) {
    e.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      if (register) {
        if (password.length < 8) throw new Error('Escolha uma senha com pelo menos 8 caracteres.');
        const result = await api('/auth/register', { method: 'POST', body: { nome: name, email, password } });
        if (result.logged_in) { await reloadProfile(); navigate('/minha-conta'); }
        else setMessage(result.message || 'Cadastro recebido. Confira seu e-mail para confirmar a conta.');
      } else {
        await api('/auth/login', { method: 'POST', body: { email, password } });
        await reloadProfile();
        navigate(nextPath);
      }
    } catch (e) { setError(e.message); } finally { setPassword(''); setBusy(false); }
  }
  function signInGoogle() {
    // O Laravel cria o verificador PKCE e redireciona ao Google via Supabase.
    // Nenhum token e gravado no navegador por JavaScript.
    window.location.assign('/api/auth/google');
  }
  return <div className="auth-layout"><section className="auth-side"><div className="auth-side-inner"><div className="auth-mark"><BookOpenText size={26}/> folha.</div><span className="eyebrow">UM UNIVERSO DE POSSIBILIDADES</span><h2>Grandes histórias começam com <em>uma página.</em></h2><p>Faça parte da nossa comunidade de leitores e tenha o acervo na palma da mão.</p><div className="auth-side-quote">“Um livro é um sonho que você segura nas mãos.”</div></div></section>
    <section className="auth-form-panel"><div className="auth-form-wrap"><Link className="mobile-brand" to="/">folha.</Link><span className="eyebrow accent">BEM-VINDO À BIBLIOTECA</span><h1>{register ? 'Crie sua conta.' : 'Que bom ter você de volta.'}</h1><p className="form-intro">{register ? 'Comece sua jornada de leitura gratuitamente.' : 'Entre na sua conta para continuar suas leituras.'}</p>
        <Notice message={error || (oauthError ? 'Nao foi possivel entrar pelo Google. Verifique o provedor e as URLs de redirecionamento do Supabase.' : '')}/><Notice message={message} kind="success"/>
        <button className="google-button" type="button" onClick={signInGoogle}><svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.21c0-.71-.06-1.23-.2-1.77H12v3.55h5.37a4.6 4.6 0 01-2 3.02v2.48h3.23c1.9-1.75 2.75-4.32 2.75-7.28z"/><path fill="#34A853" d="M12 21.72c2.7 0 4.96-.9 6.6-2.44l-3.22-2.48c-.9.6-2.05.95-3.38.95-2.6 0-4.8-1.76-5.6-4.14H3.08v2.57A9.97 9.97 0 0012 21.72z"/><path fill="#FBBC05" d="M6.4 13.61a6 6 0 010-3.82V7.22H3.08a9.97 9.97 0 000 8.96z"/><path fill="#EA4335" d="M12 5.66c1.43 0 2.71.49 3.71 1.46l2.79-2.8C16.95 2.85 14.7 2 12 2a9.97 9.97 0 00-8.92 5.22l3.32 2.57C7.2 7.42 9.4 5.66 12 5.66z"/></svg> Continuar com Google</button>
        <div className="form-divider"><span>ou use seu e-mail</span></div>
        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
          {register && <label>Nome completo<div className="input-with-icon"><User size={18}/><input autoComplete="off" required minLength={2} maxLength={100} value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome"/></div></label>}
          <label>E-mail<div className="input-with-icon"><Mail size={18}/><input autoComplete="off" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="seuemail@exemplo.com"/></div></label>
          <label>Senha<div className="input-with-icon"><LockKeyhole size={18}/><input type={showPass ? 'text' : 'password'} autoComplete="off" required minLength={register ? 8 : 1} value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha"/><button type="button" className="input-eye" onClick={() => setShowPass(!showPass)} aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}>{showPass ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>
          <button className="button button-dark auth-submit" type="submit" disabled={busy}>{busy ? 'Aguarde…' : register ? 'Criar conta' : 'Entrar na minha conta'} <ArrowRight size={18}/></button>
        </form>
        <p className="auth-toggle">{register ? 'Já tem uma conta?' : 'Ainda não tem conta?'} <button type="button" onClick={() => { setRegister(!register); setError(''); setMessage(''); }}>{register ? 'Fazer login' : 'Criar conta grátis'}</button></p>
      </div></section></div>;
}
