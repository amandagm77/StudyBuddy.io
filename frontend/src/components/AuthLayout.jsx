import { useTheme } from '../context/ThemeContext';

export default function AuthLayout({ children }) {
  const { theme } = useTheme();
  const logoSrc = theme === 'dark' ? '/logos/logo-stacked-darkmode.png' : '/logos/logo-stacked.png';
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--color-bg)',
      }}
    >
      {/* Signature touch: a soft glow echoing the branching motif radiating
          from the book in the logo — restrained, not literal */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(53,201,135,0.16) 0%, rgba(53,201,135,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px', padding: '1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src={logoSrc} alt="StudyBuddy.io" className="fade-in" style={{ width: '220px' }} />
            <p className="muted" style={{ marginTop: '0.75rem', fontSize: '1rem' }}>
              An app for students to organize notes and study smarter for any test.
            </p>
        </div>
        <div className="card">{children}</div>
      </div>
    </div>
  );
}