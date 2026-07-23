import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { logout } = useAuth();
  const { theme } = useTheme();
  const logoSrc = theme === 'dark' ? '/logos/logo-horizontal-darkmode.png' : '/logos/logo-horizontal.png';

  return (
    <header
      className="app-navbar"
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
        <img src={logoSrc} alt="StudyBuddy.io" style={{ height: '44px' }} />
      </Link>

      <div className="app-navbar-actions" style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: '1rem' }}>
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