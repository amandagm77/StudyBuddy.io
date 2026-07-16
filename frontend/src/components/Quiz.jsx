import { useState } from 'react';

export default function Quiz({ quiz, onClose }) {
  const [answers, setAnswers] = useState({}); // { questionIndex: selectedOptionIndex }
  const [submitted, setSubmitted] = useState(false);

  function selectAnswer(qIndex, optionIndex) {
    if (submitted) return; // lock answers after submission
    setAnswers({ ...answers, [qIndex]: optionIndex });
  }

  const score = quiz.questions.reduce(
    (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
    0
  );

  // Determines the full button style for an option, post-submission
  function getOptionStyle(qIndex, oIndex, correctIndex) {
    const isSelected = answers[qIndex] === oIndex;
    const isCorrect = oIndex === correctIndex;

    const base = {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      padding: '0.65rem 1rem',
      marginBottom: '0.5rem',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--color-border)',
      background: isSelected ? '#e5e7eb' : 'var(--color-surface)', // light grey while chosen but unsubmitted
      color: 'var(--color-text)',
      cursor: submitted ? 'default' : 'pointer',
      fontWeight: isSelected ? 600 : 400,
    };

    if (!submitted) return base;

    // After submission: color the whole button, not just the text —
    // green for the correct answer, red for a wrong pick, so the
    // right/wrong signal is visible at a glance rather than easy to miss
    if (isCorrect) {
      return {
        ...base,
        background: '#dcfce7',
        borderColor: '#16a34a',
        color: '#15803d',
        fontWeight: 600,
      };
    }
    if (isSelected && !isCorrect) {
      return {
        ...base,
        background: '#fee2e2',
        borderColor: '#dc2626',
        color: '#b91c1c',
        fontWeight: 600,
      };
    }
    return { ...base, opacity: 0.6 };
  }

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <h3>Quiz</h3>
      {quiz.questions.map((q, qIndex) => (
        <div key={qIndex} style={{ marginBottom: '1.75rem' }}>
          <p style={{ fontWeight: 600 }}>{qIndex + 1}. {q.question}</p>
          {q.options.map((option, oIndex) => (
            <button
              key={oIndex}
              onClick={() => selectAnswer(qIndex, oIndex)}
              style={getOptionStyle(qIndex, oIndex, q.correctIndex)}
            >
              {option}
            </button>
          ))}
          {submitted && <p className="muted" style={{ fontStyle: 'italic' }}>{q.explanation}</p>}
        </div>
      ))}

      {!submitted ? (
        <button className="btn btn-primary" onClick={() => setSubmitted(true)}>Submit Quiz</button>
      ) : (
        <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Score: {score} / {quiz.questions.length}</p>
      )}
      <button className="btn btn-secondary" onClick={onClose} style={{ marginLeft: '0.75rem' }}>
        Close
      </button>
    </div>
  );
}