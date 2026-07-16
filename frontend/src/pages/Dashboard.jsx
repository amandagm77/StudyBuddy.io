import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [newSubjectTitle, setNewSubjectTitle] = useState('');

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    const res = await api.get('/subjects');
    setSubjects(res.data);
  }

  async function createSubject(e) {
    e.preventDefault();
    if (!newSubjectTitle.trim()) return;
    await api.post('/subjects', { title: newSubjectTitle });
    setNewSubjectTitle('');
    loadSubjects();
  }

  async function deleteSubject(subjectId, e) {
    e.stopPropagation(); // don't trigger navigation to the subject when clicking Delete
    const confirmed = window.confirm(
      'Delete this subject and all its notes/quizzes/flashcards/cheatsheets? This cannot be undone.'
    );
    if (!confirmed) return;
    await api.delete(`/subjects/${subjectId}`);
    loadSubjects();
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Welcome, {user?.name}!</h1>
        <h3 style={{ color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: '2rem' }}>
          What are we studying today?
        </h3>

        <form
          onSubmit={createSubject}
          style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', maxWidth: '480px' }}
        >
          <input
            className="input"
            placeholder="New subject title"
            value={newSubjectTitle}
            onChange={(e) => setNewSubjectTitle(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" style={{ whiteSpace: 'nowrap' }}>
            Add Subject
          </button>
        </form>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          {subjects.map((s) => (
            <div
              key={s._id}
              className="card"
              onClick={() => navigate(`/subjects/${s._id}/notes`)}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <h3 style={{ marginBottom: 0 }}>{s.title}</h3>
              <button
                className="btn btn-danger"
                onClick={(e) => deleteSubject(s._id, e)}
                style={{
                  position: 'absolute',
                  top: '0.75rem',
                  right: '0.75rem',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.8rem',
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {subjects.length === 0 && (
          <p className="muted">You don't have any subjects yet — add one above to get started.</p>
        )}
      </div>
    </div>
  );
}