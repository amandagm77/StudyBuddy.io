import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [nameStatus, setNameStatus] = useState({ error: '', success: '' });

  const [emailForm, setEmailForm] = useState({ currentPassword: '', newEmail: '' });
  const [emailStatus, setEmailStatus] = useState({ error: '', success: '' });

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ error: '', success: '' });

  async function handleNameSubmit(e) {
    e.preventDefault();
    setNameStatus({ error: '', success: '' });
    if (!name.trim()) {
      setNameStatus({ error: "Name can't be blank.", success: '' });
      return;
    }
    try {
      const res = await api.put('/auth/name', { name });
      updateUser(res.data);
      setNameStatus({ error: '', success: 'Name updated.' });
    } catch (err) {
      setNameStatus({ error: err.response?.data?.error || 'Failed to update name', success: '' });
    }
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setEmailStatus({ error: '', success: '' });
    if (!emailForm.currentPassword || !emailForm.newEmail) {
      setEmailStatus({ error: 'Both fields are required.', success: '' });
      return;
    }
    try {
      const res = await api.put('/auth/email', emailForm);
      updateUser({ ...user, email: res.data.email });
      setEmailForm({ currentPassword: '', newEmail: '' });
      setEmailStatus({ error: '', success: 'Email updated.' });
    } catch (err) {
      setEmailStatus({ error: err.response?.data?.error || 'Failed to update email', success: '' });
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordStatus({ error: '', success: '' });
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus({ error: 'All fields are required.', success: '' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ error: 'New password and repeat password do not match.', success: '' });
      return;
    }
    try {
      await api.put('/auth/password', passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStatus({ error: '', success: 'Password updated.' });
    } catch (err) {
      setPasswordStatus({ error: err.response?.data?.error || 'Failed to update password', success: '' });
    }
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem', maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ marginBottom: 0 }}>Settings</h1>
          <Link className="btn btn-secondary" to="/dashboard">Dashboard</Link>
        </div>

        {/* Appearance */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3>Appearance</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="muted" id="dark-mode-label">Dark Mode</span>
            <button className="btn btn-secondary" onClick={toggleTheme} aria-labelledby="dark-mode-label">
              {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
          </div>
        </div>

        {/* Name */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3>Name</h3>
          <form onSubmit={handleNameSubmit}>
            <div className="form-group">
              <label className="label" htmlFor="settings-name">Name</label>
              <input id="settings-name" className="input" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
            </div>
            {nameStatus.error && <p className="error-text">{nameStatus.error}</p>}
            {nameStatus.success && <p style={{ color: 'var(--color-primary)' }}>{nameStatus.success}</p>}
            <button className="btn btn-primary" type="submit">Save Name</button>
          </form>
        </div>

        {/* Email */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3>Email</h3>
          <p className="muted" style={{ marginTop: 0 }}>Current: {user?.email}</p>
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label className="label" htmlFor="settings-email-current-password">Current Password</label>
              <input
                id="settings-email-current-password"
                className="input"
                type="password"
                value={emailForm.currentPassword}
                onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="settings-new-email">New Email</label>
              <input
                id="settings-new-email"
                className="input"
                type="email"
                value={emailForm.newEmail}
                onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
              />
            </div>
            {emailStatus.error && <p className="error-text">{emailStatus.error}</p>}
            {emailStatus.success && <p style={{ color: 'var(--color-primary)' }}>{emailStatus.success}</p>}
            <button className="btn btn-primary" type="submit">Update Email</button>
          </form>
        </div>

        {/* Password */}
        <div className="card">
          <h3>Password</h3>
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="label" htmlFor="settings-password-current">Current Password</label>
              <input
                id="settings-password-current"
                className="input"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="settings-password-new">New Password</label>
              <input
                id="settings-password-new"
                className="input"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="settings-password-confirm">Repeat New Password</label>
              <input
                id="settings-password-confirm"
                className="input"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
            {passwordStatus.error && <p className="error-text">{passwordStatus.error}</p>}
            {passwordStatus.success && <p style={{ color: 'var(--color-primary)' }}>{passwordStatus.success}</p>}
            <button className="btn btn-primary" type="submit">Update Password</button>
          </form>
        </div>
      </div>
    </div>
  );
}