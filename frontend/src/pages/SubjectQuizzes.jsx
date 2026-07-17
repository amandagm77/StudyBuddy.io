import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import SubjectNav from '../components/SubjectNav';
import Quiz from '../components/Quiz';

export default function SubjectQuizzes() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [activeMode, setActiveMode] = useState('take');

  const quizRef = useRef(null); // used to auto-scroll to the active quiz

  useEffect(() => {
    api.get(`/subjects/${subjectId}`).then((res) => setSubject(res.data));
    api.get(`/quizzes?subject=${subjectId}`).then((res) => setQuizzes(res.data));
  }, [subjectId]);

  // Auto-scroll down to the quiz whenever it's opened (either View Answers or Retake)
  useEffect(() => {
    if (activeQuiz && quizRef.current) {
      quizRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeQuiz, activeMode]);

  if (!subject) return <div><Navbar /><div className="container"><p>Loading...</p></div></div>;

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <SubjectNav subjectId={subjectId} subjectTitle={subject.title} />

        <div className="card">
          <h3>Past Quizzes</h3>

          {quizzes.length === 0 && (
            <p className="muted">No quizzes yet — generate one from the Notes tab first.</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {quizzes.map((q) => (
              <div
                key={q._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.85rem 1rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span>
                  {q.questions.length} questions &middot;{' '}
                  {new Date(q.createdAt).toLocaleString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: 'numeric', minute: '2-digit',
                  })}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => { setActiveQuiz(q); setActiveMode('review'); }}
                  >
                    View Answers
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => { setActiveQuiz(q); setActiveMode('take'); }}
                  >
                    Retake Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div ref={quizRef}>
            {activeQuiz && (
              <Quiz key={`${activeQuiz._id}-${activeMode}`} quiz={activeQuiz} mode={activeMode} onClose={() => setActiveQuiz(null)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}