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

  return (
    <div>
      <h3>Quiz</h3>
      {quiz.questions.map((q, qIndex) => (
        <div key={qIndex} style={{ marginBottom: '1.5rem' }}>
          <p><strong>{qIndex + 1}. {q.question}</strong></p>
          {q.options.map((option, oIndex) => {
            const isSelected = answers[qIndex] === oIndex;
            const isCorrect = oIndex === q.correctIndex;
            // Color logic only kicks in after submission, to show right/wrong
            let color = 'black';
            if (submitted && isSelected) color = isCorrect ? 'green' : 'red';
            if (submitted && !isSelected && isCorrect) color = 'green';

            return (
              <div key={oIndex}>
                <button
                  onClick={() => selectAnswer(qIndex, oIndex)}
                  style={{ color, fontWeight: isSelected ? 'bold' : 'normal' }}
                >
                  {option}
                </button>
              </div>
            );
          })}
          {submitted && <p><em>{q.explanation}</em></p>}
        </div>
      ))}

      {!submitted ? (
        <button onClick={() => setSubmitted(true)}>Submit Quiz</button>
      ) : (
        <p>Score: {score} / {quiz.questions.length}</p>
      )}
      <button onClick={onClose}>Close</button>
    </div>
  );
}