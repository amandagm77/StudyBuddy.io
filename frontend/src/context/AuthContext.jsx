import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check "am I already logged in?"

  // On first load, ask the backend if our cookie is still valid
  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => setUser(null)) // no valid cookie — that's fine, just means logged out
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data);
  }

  async function register(email, password, name) {
    const res = await api.post('/auth/register', { email, password, name });
    setUser(res.data);
  }

  async function logout() {
    await api.post('/auth/logout');
    setUser(null);
  }

  function updateUser(updatedUser) {
  setUser(updatedUser);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}