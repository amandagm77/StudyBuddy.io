import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import SubjectNav from '../components/SubjectNav';
import FlashcardStudy from '../components/FlashcardStudy';
import ConfirmModal from '../components/ConfirmModal';

const MAX_CHARS = 100;
const MAX_CARDS = 15;

export default function Flashcards() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [cards, setCards] = useState([]);
  const [form, setForm] = useState({ front: '', back: '' });
  const [error, setError] = useState('');
  const [studyMode, setStudyMode] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    api.get(`/subjects/${subjectId}`).then((res) => setSubject(res.data));
    loadCards();
  }, [subjectId]);

  async function loadCards() {
    const res = await api.get(`/flashcards?subject=${subjectId}`);
    setCards(res.data);
  }

  async function createCard(e) {
    e.preventDefault();
    setError('');
    if (!form.front.trim()) {
      setError("Front side can't be blank.");
      return;
    }
    if (!form.back.trim()) {
      setError("Back side can't be blank.");
      return;
    }

    try {
      await api.post('/flashcards', { ...form, subject: subjectId });
      setForm({ front: '', back: '' });
      loadCards();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create flashcard');
    }
  }

  function deleteAllCards() {
    setConfirmModal({
      message: `Are you sure? This will permanently delete all ${cards.length} flashcards in this subject.`,
      onConfirm: async () => {
        await api.delete(`/flashcards?subject=${subjectId}`);
        setConfirmModal(null);
        loadCards();
      },
    });
  }

  function deleteCard(id) {
    setConfirmModal({
      message: 'Delete this flashcard?',
      onConfirm: async () => {
        await api.delete(`/flashcards/${id}`);
        setConfirmModal(null);
        loadCards();
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
          <p className="muted">{cards.length} / {MAX_CARDS} flashcards used</p>

          {studyMode ? (
            <FlashcardStudy cards={cards} onExit={() => setStudyMode(false)} />
          ) : (
            <>
              <button
                className="btn btn-primary"
                onClick={() => setStudyMode(true)}
                disabled={cards.length === 0}
                style={{ marginBottom: '1.5rem' }}
              >
                Study Mode
              </button>
              <button
                className="btn btn-danger"
                onClick={deleteAllCards}
                disabled={cards.length === 0}
                style={{ marginBottom: '1.5rem', marginLeft: '0.75rem' }}
              >
                Delete All
              </button>

              {cards.length < MAX_CARDS && (
                <form onSubmit={createCard} style={{ marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="label" htmlFor="flashcard-front">Front (question)</label>
                    <input
                      id="flashcard-front"
                      className="input"
                      placeholder="Front (question)"
                      value={form.front}
                      maxLength={MAX_CHARS}
                      onChange={(e) => setForm({ ...form, front: e.target.value })}
                    />
                    <span className="muted" aria-live="polite">{form.front.length}/{MAX_CHARS}</span>
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="flashcard-back">Back (answer)</label>
                    <input
                      id="flashcard-back"
                      className="input"
                      placeholder="Back (answer)"
                      value={form.back}
                      maxLength={MAX_CHARS}
                      onChange={(e) => setForm({ ...form, back: e.target.value })}
                    />
                    <span className="muted" aria-live="polite">{form.back.length}/{MAX_CHARS}</span>
                  </div>
                  <button className="btn btn-primary" type="submit">Add Flashcard</button>
                </form>
              )}
              {error && <p className="error-text">{error}</p>}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '1rem',
                }}
              >
                {cards.map((c) => (
                  <div key={c._id} className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.15rem', marginBottom: '0.5rem' }}>
                      {c.front}
                    </div>
                    <div style={{
                      fontWeight: 'bold',
                      fontSize: '1.05rem',
                      color: 'var(--color-primary)',
                      paddingTop: '0.5rem',
                      borderTop: '1px dashed var(--color-border)',
                    }}>
                      {c.back}
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteCard(c._id)}
                      style={{ marginTop: '0.75rem', fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
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