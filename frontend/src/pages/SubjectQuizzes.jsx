import { useState, useEffect } from 'react';
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

  useEffect(() => {
    api.get(`/subjects/${subjectId}`).then((res) => setSubject(res.data));
    api.get(`/quizzes?subject=${subjectId}`).then((res) => setQuizzes(res.data));
  }, [subjectId]);

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
                  {new Date(q.createdAt).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </span>
                <button className="btn btn-primary" onClick={() => setActiveQuiz(q)}>
                  Take Quiz
                </button>
              </div>
            ))}
          </div>

          {/* Re-mounting on quiz id ensures a fresh attempt each time,
              rather than carrying over answers from a previous review */}
          {activeQuiz && (
            <Quiz key={activeQuiz._id} quiz={activeQuiz} onClose={() => setActiveQuiz(null)} />
          )}
        </div>
      </div>
    </div>
  );
}