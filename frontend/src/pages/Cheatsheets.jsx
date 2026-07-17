import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import SubjectNav from '../components/SubjectNav';
import ConfirmModal from '../components/ConfirmModal';

const MAX_SHEETS = 5;

export default function Cheatsheets() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    api.get(`/subjects/${subjectId}`).then((res) => setSubject(res.data));
    loadSheets();
  }, [subjectId]);

  async function loadSheets() {
    const res = await api.get(`/cheatsheets?subject=${subjectId}`);
    setSheets(res.data);
  }

  async function createSheet(e) {
  e.preventDefault();
  setError('');
  if (!newTitle.trim()) {
    setError("Cheat sheet title can't be blank.");
    return;
  }

  try {
    await api.post('/cheatsheets', { title: newTitle, subject: subjectId });
    setNewTitle('');
    loadSheets();
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to create cheatsheet');
  }
  }

  function deleteAllSheets() {
  setConfirmModal({
    message: `Are you sure? This will permanently delete all ${sheets.length} cheatsheets in this subject.`,
    onConfirm: async () => {
      await api.delete(`/cheatsheets?subject=${subjectId}`);
      setConfirmModal(null);
      loadSheets();
    },
  });
  }

  function deleteSheet(id) {
  setConfirmModal({
    message: 'Delete this cheatsheet?',
    onConfirm: async () => {
      await api.delete(`/cheatsheets/${id}`);
      setConfirmModal(null);
      loadSheets();
    },
  });
  }

  if (!subject) return <div><Navbar /><div className="container"><p>Loading...</p></div></div>;

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <SubjectNav subjectId={subjectId} subjectTitle={subject.title} />

        <div className="card">
          <p className="muted">{sheets.length} / {MAX_SHEETS} cheatsheets used</p>

          {sheets.length < MAX_SHEETS && (
            <form onSubmit={createSheet} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input
                className="input"
                placeholder="e.g. Midterm 1, Final Exam"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <button className="btn btn-primary" type="submit" style={{ whiteSpace: 'nowrap' }}>
                Create Cheat Sheet
              </button>
            </form>
          )}
          {error && <p className="error-text">{error}</p>}

          <button
            className="btn btn-danger"
            onClick={deleteAllSheets}
            disabled={sheets.length === 0}
            style={{ marginBottom: '1rem' }}
          >
          Delete All
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sheets.map((s) => (
              <div
                key={s._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <Link to={`/cheatsheets/${s._id}/edit`} style={{ fontWeight: 600 }}>{s.title}</Link>
                <button className="btn btn-danger" onClick={() => deleteSheet(s._id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
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