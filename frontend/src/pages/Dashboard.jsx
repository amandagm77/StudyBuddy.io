import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [subjectError, setSubjectError] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    const res = await api.get('/subjects');
    setSubjects(res.data);
  }

  async function createSubject(e) {
    e.preventDefault();
    if (!newSubjectTitle.trim()) {
      setSubjectError("Subject title can't be blank.");
      return;
    }
    setSubjectError('');
    await api.post('/subjects', { title: newSubjectTitle });
    setNewSubjectTitle('');
    loadSubjects();
  }

  function deleteAllSubjects() {
    setConfirmModal({
      message: `Are you sure? This will permanently delete all ${subjects.length} subjects and everything inside them (notes, quizzes, flashcards, cheatsheets). This cannot be undone.`,
      onConfirm: async () => {
        await api.delete('/subjects');
        setConfirmModal(null);
        loadSubjects();
      },
    });
  }

  function deleteSubject(subjectId, e) {
    e.stopPropagation();
    setConfirmModal({
      message: 'Delete this subject and all its notes/quizzes/flashcards/cheatsheets? This cannot be undone.',
      onConfirm: async () => {
        await api.delete(`/subjects/${subjectId}`);
        setConfirmModal(null);
        loadSubjects();
      },
    });
  }

  function goToSubject(subjectId) {
    navigate(`/subjects/${subjectId}/notes`);
  }

  return (
    <div>
      <Navbar />
      <div className="container fade-in-up" style={{ paddingTop: '2.5rem', paddingBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Welcome, {user?.name}!</h1>
        <h3 style={{ color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: '2rem' }}>
          What are we studying today?
        </h3>

        <div style={{ margin: '0 auto 2rem', maxWidth: '480px' }}>
          <form onSubmit={createSubject} style={{ display: 'flex', gap: '0.75rem' }}>
            <label className="label" htmlFor="dashboard-new-subject" style={{ display: 'none' }}>
              New subject title
            </label>
            <input
              id="dashboard-new-subject"
              className="input"
              placeholder="Enter Subject title here"
              value={newSubjectTitle}
              maxLength={30}
              onChange={(e) => setNewSubjectTitle(e.target.value)}
            />
            <button className="btn btn-primary" type="submit" style={{ whiteSpace: 'nowrap' }}>
              Add Subject
            </button>
          </form>
          {subjectError && <p className="error-text" style={{ marginTop: '0.5rem', marginBottom: 0 }}>{subjectError}</p>}
        </div>

        <button
          className="btn btn-danger"
          onClick={deleteAllSubjects}
          disabled={subjects.length === 0}
          style={{ marginBottom: '1.5rem' }}
        >
          Delete All Subjects
        </button>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, 220px)',
            justifyContent: 'center',
            gap: '1rem',
          }}
        >
          {subjects.map((s) => (
            <div
              key={s._id}
              className="card"
              onClick={() => goToSubject(s._id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goToSubject(s._id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Open ${s.title}`}
              style={{ cursor: 'pointer', position: 'relative', textAlign: 'left' }}
            >
              <h3 style={{ marginTop: '2.25rem', marginBottom: 0, overflowWrap: 'break-word', wordBreak: 'break-word' }}>{s.title}</h3>
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
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}