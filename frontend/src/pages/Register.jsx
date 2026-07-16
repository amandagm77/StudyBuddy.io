import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

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
    <AuthLayout>
      <h2 style={{ marginBottom: '1.5rem' }}>Create your account</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="error-text">{error}</p>}

        <div className="form-group">
          <label className="label">Name</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

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
            minLength={8}
          />
          <span className="muted">Minimum 8 characters</span>
        </div>

        <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>
          Register
        </button>

        <p className="muted" style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}