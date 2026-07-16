import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const MAX_SHEETS = 5;

export default function Cheatsheets() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');

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
    if (!newTitle.trim()) return;

    try {
      await api.post('/cheatsheets', { title: newTitle, subject: subjectId });
      setNewTitle('');
      loadSheets();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create cheatsheet');
    }
  }

  async function deleteSheet(id) {
    const confirmed = window.confirm('Delete this cheatsheet?');
    if (!confirmed) return;
    await api.delete(`/cheatsheets/${id}`);
    loadSheets();
  }

  return (
    <div>
      <Link to="/dashboard">&larr; Back to Dashboard</Link>
      <h2>Cheat Sheets {subject && `— ${subject.title}`}</h2>
      <p>{sheets.length} / {MAX_SHEETS} cheatsheets used</p>

      {sheets.length < MAX_SHEETS && (
        <form onSubmit={createSheet}>
          <input
            placeholder="e.g. Midterm 1, Final Exam"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button type="submit">Create Cheat Sheet</button>
        </form>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {sheets.map((s) => (
          <li key={s._id}>
            <Link to={`/cheatsheets/${s._id}/edit`}>{s.title}</Link>
            <button onClick={() => deleteSheet(s._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}