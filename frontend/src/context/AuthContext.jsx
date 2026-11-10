import { createContext, useContext, useEffect, useState } from 'react';
import { api, resetCsrf } from '../lib/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  async function reloadProfile() {
    const result = await api('/auth/me');
    setUser(result.user);
    setProfile(result.profile);
    setProfileError('');
    return result;
  }

  useEffect(() => {
    let live = true;
    api('/auth/me').then(result => {
      if (!live) return;
      setUser(result.user);
      setProfile(result.profile);
    }).catch(error => {
      if (!live) return;
      setUser(null);
      setProfile(null);
      if (!/login|autenticad|sess[aã]o/i.test(error.message)) setProfileError(error.message);
    }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);

  async function signOut() {
    try { await api('/auth/logout', { method: 'POST' }); }
    finally { setUser(null); setProfile(null); resetCsrf(); }
  }

  return <AuthContext.Provider value={{
    user, profile, loading, profileError, authenticated: Boolean(user),
    reloadProfile, signOut,
  }}>{children}</AuthContext.Provider>;
}
