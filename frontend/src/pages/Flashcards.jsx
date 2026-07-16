import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const MAX_CHARS = 100;
const MAX_CARDS = 15;

export default function Flashcards() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [cards, setCards] = useState([]);
  const [form, setForm] = useState({ front: '', back: '' });
  const [error, setError] = useState('');

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

  return (
    <div>
      <Link to="/dashboard">&larr; Back to Dashboard</Link>
      <h2>Flashcards {subject && `— ${subject.title}`}</h2>
      <p>{cards.length} / {MAX_CARDS} flashcards used</p>

      {cards.length < MAX_CARDS && (
        <form onSubmit={createCard}>
          <div>
            <input
              placeholder="Front (question)"
              value={form.front}
              maxLength={MAX_CHARS}
              onChange={(e) => setForm({ ...form, front: e.target.value })}
            />
            <span>{form.front.length}/{MAX_CHARS}</span>
          </div>
          <div>
            <input
              placeholder="Back (answer)"
              value={form.back}
              maxLength={MAX_CHARS}
              onChange={(e) => setForm({ ...form, back: e.target.value })}
            />
            <span>{form.back.length}/{MAX_CHARS}</span>
          </div>
          <button type="submit">Add Flashcard</button>
        </form>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {cards.map((c) => (
          <li key={c._id} style={{ margin: '1rem 0' }}>
            {/* Bold + larger font for quick-glance review, per the spec */}
            <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>{c.front}</div>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#555' }}>{c.back}</div>
            <button onClick={() => deleteCard(c._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}