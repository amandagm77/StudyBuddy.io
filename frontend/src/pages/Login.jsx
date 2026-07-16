import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

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
    <AuthLayout>
      <h2 style={{ marginBottom: '1.5rem' }}>Welcome back</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="error-text">{error}</p>}

        <div className="form-group">
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>
          Log in
        </button>

        <p className="muted" style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </AuthLayout>
  );
}