import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        background: 'var(--color-header-bg)',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Link to="/dashboard">
        <img src="/logos/logo-horizontal.png" alt="StudyBuddy.io" style={{ height: '36px' }} />
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ color: 'var(--color-text-on-dark)', fontSize: '0.9rem' }}>
          {user?.name}
        </span>
        <button className="btn btn-secondary" onClick={logout} style={{ color: 'var(--color-text-on-dark)' }}>
          Logout
        </button>
      </div>
    </header>
  );
}