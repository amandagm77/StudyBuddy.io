import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AuthLayout from '../components/AuthLayout';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' -> 'code' -> 'reset'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  async function submitEmail(e) {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    const res = await api.post('/auth/forgot-password', { email });
    setInfo(res.data.message);
    setStep('code');
  } catch (err) {
    setError(err.response?.data?.error || 'Something went wrong');
  } finally {
    setLoading(false);
  }
  }

  async function submitCode(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/verify-reset-code', { email, code });
      setResetToken(res.data.resetToken);
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code');
    }
  }

  async function submitNewPassword(e) {
    e.preventDefault();
    setError('');
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await api.post('/auth/reset-password', {
        resetToken,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    }
  }

  return (
    <AuthLayout>
      {step === 'email' && (
        <form onSubmit={submitEmail}>
          <h2 style={{ marginBottom: '1rem' }}>Forgot Password</h2>
          <p className="muted">Enter your email and we'll send you a 6-digit reset code.</p>
          {error && <p className="error-text">{error}</p>}
          <div className="form-group">
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Sending code...' : 'Send Code'}
          </button>
        </form>
      )}

      {step === 'code' && (
        <form onSubmit={submitCode}>
          <h2 style={{ marginBottom: '1rem' }}>Enter Code</h2>
          {info && (
          <div>
            <p className="muted" style={{ marginBottom: '0.25rem' }}>{info}</p>
            <p className="muted" style={{ fontStyle: 'italic' }}>
              Don't see it? Check your Junk or Spam folder — reset emails sometimes land there.
            </p>
          </div>
          )}
          {error && <p className="error-text">{error}</p>}
          <div className="form-group">
            <label className="label">6-Digit Code</label>
            <input
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
            Verify Code
          </button>
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={submitNewPassword}>
          <h2 style={{ marginBottom: '1rem' }}>Set New Password</h2>
          {error && <p className="error-text">{error}</p>}
          <div className="form-group">
            <label className="label">New Password</label>
            <input
              className="input"
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              minLength={8}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Repeat New Password</label>
            <input
              className="input"
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
            Reset Password
          </button>
        </form>
      )}

      <p className="muted" style={{ textAlign: 'center', marginTop: '1.25rem' }}>
        <Link to="/login">Back to login</Link>
      </p>
    </AuthLayout>
  );
}