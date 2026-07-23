import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { label: 'Notes', path: 'notes' },
  { label: 'Flashcards', path: 'flashcards' },
  { label: 'Cheat Sheets', path: 'cheatsheets' },
  { label: 'Quizzes', path: 'quizzes' },
];

export default function SubjectNav({ subjectId, subjectTitle }) {
  const location = useLocation();

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <Link
        to="/dashboard"
        className="btn btn-secondary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}
      >
        <span aria-hidden="true">&larr;</span> All Subjects
      </Link>
      <h2 style={{ margin: '0.5rem 0 1rem' }}>{subjectTitle}</h2>

      <div className="subject-tabs" style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--color-border)' }}>
        {tabs.map((tab) => {
          const path = `/subjects/${subjectId}/${tab.path}`;
          const isActive = location.pathname === path;
          return (
            <Link
              key={tab.path}
              to={path}
              style={{
                padding: '0.6rem 1.1rem',
                fontWeight: 600,
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                marginBottom: '-2px', // overlaps the container's border so the active underline sits flush
                textDecoration: 'none',
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}