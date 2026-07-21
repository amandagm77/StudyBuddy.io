import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        position: 'relative',
        background: 'radial-gradient(ellipse 700px 160% at center, var(--color-header-gradient-center) 0%, var(--color-header-gradient-edge) 100%)',
        padding: '1rem 1.5rem',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div />

      <Link to="/dashboard" style={{ justifySelf: 'center' }}>
        <img src="/logos/logo-horizontal.png" alt="StudyBuddy.io" style={{ height: '44px' }} />
      </Link>

      <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ color: 'var(--color-header-text)', fontWeight: 600, fontSize: '0.9rem' }}>
          {user?.name}
        </span>
        <Link className="btn btn-secondary" to="/help" style={{ color: 'var(--color-header-text)', borderColor: 'var(--color-header-text)' }}>
          Help
        </Link>
        <Link className="btn btn-secondary" to="/settings" style={{ color: 'var(--color-header-text)', borderColor: 'var(--color-header-text)' }}>
          Settings
        </Link>
        <button
          className="btn btn-secondary"
          onClick={logout}
          style={{ color: 'var(--color-header-text)', borderColor: 'var(--color-header-text)' }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}