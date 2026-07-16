import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import SubjectNav from '../components/SubjectNav';
import FlashcardStudy from '../components/FlashcardStudy';

const MAX_CHARS = 100;
const MAX_CARDS = 15;

export default function Flashcards() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [cards, setCards] = useState([]);
  const [form, setForm] = useState({ front: '', back: '' });
  const [error, setError] = useState('');
  const [studyMode, setStudyMode] = useState(false);

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
    if (!form.front.trim() || !form.back.trim()) return;

    try {
      await api.post('/flashcards', { ...form, subject: subjectId });
      setForm({ front: '', back: '' });
      loadCards();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create flashcard');
    }
  }

  async function deleteCard(id) {
    const confirmed = window.confirm('Delete this flashcard?');
    if (!confirmed) return;
    await api.delete(`/flashcards/${id}`);
    loadCards();
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

              {cards.length < MAX_CARDS && (
                <form onSubmit={createCard} style={{ marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <input
                      className="input"
                      placeholder="Front (question)"
                      value={form.front}
                      maxLength={MAX_CHARS}
                      onChange={(e) => setForm({ ...form, front: e.target.value })}
                    />
                    <span className="muted">{form.front.length}/{MAX_CHARS}</span>
                  </div>
                  <div className="form-group">
                    <input
                      className="input"
                      placeholder="Back (answer)"
                      value={form.back}
                      maxLength={MAX_CHARS}
                      onChange={(e) => setForm({ ...form, back: e.target.value })}
                    />
                    <span className="muted">{form.back.length}/{MAX_CHARS}</span>
                  </div>
                  <button className="btn btn-primary" type="submit">Add Flashcard</button>
                </form>
              )}
              {error && <p className="error-text">{error}</p>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {cards.map((c) => (
                  <div
                    key={c._id}
                    style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}
                  >
                    {/* Bold + larger font for quick-glance review, per the spec */}
                    <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>{c.front}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>{c.back}</div>
                    <button className="btn btn-danger" onClick={() => deleteCard(c._id)} style={{ marginTop: '0.5rem' }}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}