import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        position: 'relative',
        background: 'radial-gradient(ellipse 700px 160% at center, #ffffff 0%, var(--color-header-gradient-edge) 100%)',
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
        <span style={{ color: 'var(--brand-dark)', fontWeight: 600, fontSize: '0.9rem' }}>
          {user?.name}
        </span>
        <button
          className="btn btn-secondary"
          onClick={logout}
          style={{ color: 'var(--brand-dark)', borderColor: 'var(--brand-dark)' }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}