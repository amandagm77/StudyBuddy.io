import { useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

export default function Help() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState({ error: '', success: '' });

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ error: '', success: '' });
    if (!message.trim()) {
      setStatus({ error: "Message can't be blank.", success: '' });
      return;
    }
    try {
      await api.post('/contact', { message });
      setMessage('');
      setStatus({ error: '', success: "Thanks — your question has been submitted." });
    } catch (err) {
      setStatus({ error: err.response?.data?.error || 'Failed to submit message', success: '' });
    }
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem', maxWidth: '760px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ marginBottom: 0 }}>Help & FAQ</h1>
          <Link className="btn btn-secondary" to="/dashboard">Dashboard</Link>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3>Notes</h3>
          <p>
            Notes are where you write and organize what you're studying, subject by subject.
            You can format text with bold, italics, highlighting, and bullet points using the
            toolbar above the note editor.
          </p>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3>Flashcards</h3>
          <p>
            Each subject can hold up to 15 flashcards, with a 100-character limit per side —
            short and quick to review. Use <strong>Study Mode</strong> to flip through them one at
            a time, click a card to flip it over, and use <strong>Shuffle</strong> to randomize
            the order for better recall practice.
          </p>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3>Cheat Sheets</h3>
          <p>
            Each subject can hold up to 5 cheat sheets, styled like a real two-sided allowed-notes
            page you'd bring to an exam. Fill in Side 1 (Front) and Side 2 (Back) using the same
            formatting toolbar as Notes, and click <strong>Save</strong> to keep your changes.
          </p>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3>AI Features</h3>
          <p>
            <strong>Rewrite for Clarity</strong> sends your note or cheat sheet content to Claude,
            which rewrites it to be clearer and easier to study from, without changing the facts.
            You'll see a side-by-side preview and can choose to Apply the rewrite or Discard it.
          </p>
          <p>
            <strong>Generate Quiz from Selected Notes</strong> lets you check the boxes next to
            one or more notes, then creates a multiple-choice practice quiz based only on that
            content. Past quizzes are saved under the Quizzes tab, where you can retake them or
            just view the answers and explanations.
          </p>
        </div>

        <p className="muted" style={{ fontStyle: 'italic', marginBottom: '2rem' }}>
          *Disclaimer: AI can get things wrong. Always check the facts through verifiable sources.
        </p>

        <div className="card">
          <h3>Contact Us</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            Have a question about StudyBuddy.io? Send it here and we'll get back to you.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <textarea
                className="input"
                rows={5}
                placeholder="What's your question?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            {status.error && <p className="error-text">{status.error}</p>}
            {status.success && <p style={{ color: 'var(--color-primary)' }}>{status.success}</p>}
            <button className="btn btn-primary" type="submit">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
}