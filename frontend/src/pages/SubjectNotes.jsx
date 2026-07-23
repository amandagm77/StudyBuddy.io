import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import SubjectNav from '../components/SubjectNav';
import Quiz from '../components/Quiz';
import RewritePreview from '../components/RewritePreview';
import NoteEditor from '../components/NoteEditor';
import ConfirmModal from '../components/ConfirmModal';
import { Sparkles } from 'lucide-react';

function normalizeSpaces(html) {
  return html.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');
}

export default function SubjectNotes() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', body: '' });
  const [formKey, setFormKey] = useState(0);
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [activeRewrite, setActiveRewrite] = useState(null);
  const [rewriteLoadingId, setRewriteLoadingId] = useState(null);
  const [rewriteError, setRewriteError] = useState('');
  const [noteError, setNoteError] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);

  // Inline edit state — only one note can be in edit mode at a time
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', body: '' });
  const [editError, setEditError] = useState('');

  const quizRef = useRef(null);

  useEffect(() => {
    api.get(`/subjects/${subjectId}`).then((res) => setSubject(res.data));
    loadNotes();
  }, [subjectId]);

  useEffect(() => {
    if (activeQuiz && quizRef.current) {
      quizRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeQuiz]);

  async function loadNotes() {
    const res = await api.get(`/notes?subject=${subjectId}`);
    setNotes(res.data);
  }

  async function createNote(e) {
    e.preventDefault();
    if (!newNote.title.trim()) {
      setNoteError("Note title can't be blank.");
      return;
    }
    if (!newNote.body.trim()) {
      setNoteError("Note content can't be blank.");
      return;
    }
    setNoteError('');
    await api.post('/notes', { ...newNote, subject: subjectId });
    setNewNote({ title: '', body: '' });
    setFormKey((k) => k + 1);
    loadNotes();
  }

  function startEdit(note) {
    setEditingNoteId(note._id);
    setEditForm({ title: note.title, body: note.body });
    setEditError('');
    setActiveRewrite(null); // close any open rewrite preview for this or another note
  }

  function cancelEdit() {
    setEditingNoteId(null);
    setEditError('');
  }

  async function saveEdit(noteId) {
    if (!editForm.title.trim()) {
      setEditError("Note title can't be blank.");
      return;
    }
    if (!editForm.body.trim()) {
      setEditError("Note content can't be blank.");
      return;
    }
    await api.put(`/notes/${noteId}`, { title: editForm.title, body: editForm.body });
    setEditingNoteId(null);
    loadNotes();
  }

  function deleteNote(noteId) {
    setConfirmModal({
      message: 'Delete this note?',
      onConfirm: async () => {
        await api.delete(`/notes/${noteId}`);
        setConfirmModal(null);
        loadNotes();
      },
    });
  }

  function deleteAllNotes() {
    setConfirmModal({
      message: `Are you sure? This will permanently delete all ${notes.length} notes in this subject.`,
      onConfirm: async () => {
        await api.delete(`/notes?subject=${subjectId}`);
        setSelectedNoteIds([]);
        setConfirmModal(null);
        loadNotes();
      },
    });
  }

  function toggleNoteSelection(noteId) {
    setSelectedNoteIds((prev) =>
      prev.includes(noteId) ? prev.filter((id) => id !== noteId) : [...prev, noteId]
    );
  }

  function toggleSelectAll() {
    const allSelected = notes.length > 0 && selectedNoteIds.length === notes.length;
    setSelectedNoteIds(allSelected ? [] : notes.map((n) => n._id));
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
    const htmlBody = `<p>${rewrite.rewrittenText.replace(/\n/g, '<br>')}</p>`;
    await api.put(`/notes/${rewrite.note}`, {
      title: notes.find((n) => n._id === rewrite.note)?.title,
      body: htmlBody,
    });
    setActiveRewrite(null);
    loadNotes();
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
        subjectId,
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

  if (!subject) return <div><Navbar /><div className="container"><p>Loading...</p></div></div>;

  const allSelected = notes.length > 0 && selectedNoteIds.length === notes.length;

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <SubjectNav subjectId={subjectId} subjectTitle={subject.title} />

        <div className="card">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button className="btn btn-primary" onClick={generateQuiz} disabled={quizLoading}>
              <Sparkles size={16} className="ai-icon" aria-hidden="true" />
              {quizLoading ? 'Generating quiz...' : 'Generate Quiz from Selected Notes'}
            </button>
            <button className="btn btn-secondary" onClick={toggleSelectAll} disabled={notes.length === 0}>
              {allSelected ? 'Deselect All' : 'Select All'}
            </button>
            <button className="btn btn-danger" onClick={deleteAllNotes} disabled={notes.length === 0}>
              Delete All
            </button>
          </div>
          {quizError && <p className="error-text">{quizError}</p>}

          <h3>Notes</h3>

          <form key={formKey} onSubmit={createNote} style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <input
                className="input"
                placeholder="Enter Note title here"
                value={newNote.title}
                maxLength={30}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              />
            </div>
            <NoteEditor
              value={newNote.body}
              onChange={(html) => setNewNote({ ...newNote, body: html })}
              placeholder="Note contents"
            />
            <button className="btn btn-primary" type="submit" style={{ marginTop: '0.75rem' }}>
              Add Note
            </button>
            {noteError && <p className="error-text">{noteError}</p>}
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notes.map((n) => {
              const isEditing = editingNoteId === n._id;
              return (
                <div
                  key={n._id}
                  style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}
                >
                  {isEditing ? (
                    <>
                      <div className="form-group">
                        <input
                          className="input"
                          value={editForm.title}
                          maxLength={30}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        />
                      </div>
                      <NoteEditor
                        value={editForm.body}
                        onChange={(html) => setEditForm({ ...editForm, body: html })}
                        placeholder="Note contents"
                      />
                      {editError && <p className="error-text">{editError}</p>}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <button className="btn btn-primary" onClick={() => saveEdit(n._id)}>Save</button>
                        <button className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={selectedNoteIds.includes(n._id)}
                          onChange={() => toggleNoteSelection(n._id)}
                          style={{ marginTop: '0.35rem' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong style={{ display: 'inline-block', maxWidth: '100%', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                            {n.title}
                          </strong>
                          <div
                            className="note-content"
                            style={{ color: 'var(--color-text-muted)' }}
                            dangerouslySetInnerHTML={{ __html: normalizeSpaces(n.body) }}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => generateRewrite(n._id)}
                          disabled={rewriteLoadingId === n._id}
                        >
                          <Sparkles size={16} className="ai-icon" aria-hidden="true" />
                          {rewriteLoadingId === n._id ? 'Rewriting...' : 'Rewrite for Clarity'}
                        </button>
                        <button className="btn btn-secondary" onClick={() => startEdit(n)}>Edit</button>
                        <button className="btn btn-danger" onClick={() => deleteNote(n._id)}>Delete</button>
                      </div>

                      {rewriteError && rewriteLoadingId === null && activeRewrite?.note === n._id && (
                        <p className="error-text">{rewriteError}</p>
                      )}
                      {activeRewrite && activeRewrite.note === n._id && (
                        <RewritePreview
                          rewrite={activeRewrite}
                          onApply={applyRewrite}
                          onDiscard={() => setActiveRewrite(null)}
                        />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {rewriteError && !activeRewrite && <p className="error-text">{rewriteError}</p>}

          <div ref={quizRef}>
            {activeQuiz && <Quiz quiz={activeQuiz} onClose={() => setActiveQuiz(null)} />}
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