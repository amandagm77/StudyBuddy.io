import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input placeholder="Email" type="email" value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <input placeholder="Password" type="password" value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })} required />
      <button type="submit">Login</button>
      <p>No account? <Link to="/register">Register</Link></p>
    </form>
  );
}