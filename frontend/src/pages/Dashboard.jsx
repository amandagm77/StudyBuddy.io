import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Quiz from '../components/Quiz';
import RewritePreview from '../components/RewritePreview';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [activeSubject, setActiveSubject] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', body: '' });
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [activeRewrite, setActiveRewrite] = useState(null);
  const [rewriteLoadingId, setRewriteLoadingId] = useState(null); // tracks which note is loading
  const [rewriteError, setRewriteError] = useState('');

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

  async function openSubject(subject) {
    setActiveSubject(subject);
    const res = await api.get(`/notes?subject=${subject._id}`);
    setNotes(res.data);
  }

  async function createNote(e) {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.body.trim()) return;
    await api.post('/notes', { ...newNote, subject: activeSubject._id });
    setNewNote({ title: '', body: '' });
    openSubject(activeSubject); // refresh notes list
  }

  async function generateRewrite(noteId) {
    setRewriteLoadingId(noteId);
    setRewriteError('');
    try {
      const res = await api.post('/rewrites/generate', { noteId });
      setActiveRewrite(res.data);
    } catch (err) {
      setRewriteError(err.response?.data?.error || 'Failed to generate rewrite');
    } finally {
      setRewriteLoadingId(null);
    }
  }

  async function applyRewrite(rewrite) {
    // Reuse the existing note update route — no new backend endpoint needed
    await api.put(`/notes/${rewrite.note}`, {
      title: notes.find((n) => n._id === rewrite.note)?.title,
      body: rewrite.rewrittenText,
    });
    setActiveRewrite(null);
    openSubject(activeSubject); // refresh notes list to show the applied change
  }

  function toggleNoteSelection(noteId) {
    setSelectedNoteIds((prev) =>
      prev.includes(noteId) ? prev.filter((id) => id !== noteId) : [...prev, noteId]
    );
  }

  async function generateQuiz() {
    if (selectedNoteIds.length === 0) {
      setQuizError('Select at least one note first');
      return;
    }
    setQuizLoading(true);
    setQuizError('');
    try {
      const res = await api.post('/quizzes/generate', {
        subjectId: activeSubject._id,
        noteIds: selectedNoteIds,
        numQuestions: 5,
      });
      setActiveQuiz(res.data);
    } catch (err) {
      setQuizError(err.response?.data?.error || 'Failed to generate quiz');
    } finally {
      setQuizLoading(false);
    }
  }

  return (
    <div>
      <header>
        <span>Welcome, {user?.name}</span>
        <button onClick={logout}>Logout</button>
      </header>

      <section>
        <h3>Your Subjects</h3>
        <form onSubmit={createSubject}>
          <input placeholder="New subject title" value={newSubjectTitle}
            onChange={(e) => setNewSubjectTitle(e.target.value)} />
          <button type="submit">Add Subject</button>
        </form>
        <ul>
          {subjects.map((s) => (
            <li key={s._id}>
              <button onClick={() => openSubject(s)}>{s.title}</button>
            </li>
          ))}
        </ul>
      </section>

      {activeSubject && (
        <section>
          <h3>Notes for {activeSubject.title}</h3>
          <form onSubmit={createNote}>
            <input placeholder="Note title" value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })} />
            <textarea placeholder="Note content" value={newNote.body}
              onChange={(e) => setNewNote({ ...newNote, body: e.target.value })} />
            <button type="submit">Add Note</button>
          </form>
          <ul>
            {notes.map((n) => (
              <li key={n._id}>
                <input
                  type="checkbox"
                  checked={selectedNoteIds.includes(n._id)}
                  onChange={() => toggleNoteSelection(n._id)}
                />
                <strong>{n.title}</strong>: {n.body}
                <button onClick={() => generateRewrite(n._id)} disabled={rewriteLoadingId === n._id}>
                  {rewriteLoadingId === n._id ? 'Rewriting...' : 'Rewrite for Clarity'}
                </button>
              </li>
            ))}
          </ul>
          {rewriteError && <p style={{ color: 'red' }}>{rewriteError}</p>}
          {activeRewrite && (
            <RewritePreview
              rewrite={activeRewrite}
              onApply={applyRewrite}
              onDiscard={() => setActiveRewrite(null)}
            />
          )}

          <button onClick={generateQuiz} disabled={quizLoading}>
            {quizLoading ? 'Generating quiz...' : 'Generate Quiz from Selected Notes'}
          </button>
          {quizError && <p style={{ color: 'red' }}>{quizError}</p>}

          {activeQuiz && <Quiz quiz={activeQuiz} onClose={() => setActiveQuiz(null)} />}
        </section>
      )}
    </div>
  );
}