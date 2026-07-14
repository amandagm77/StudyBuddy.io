import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await register(form.email, form.password, form.name);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input placeholder="Name" value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <input placeholder="Email" type="email" value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <input placeholder="Password (min 8 chars)" type="password" value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
      <button type="submit">Register</button>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </form>
  );
}