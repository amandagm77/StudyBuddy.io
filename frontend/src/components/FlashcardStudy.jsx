import { useState } from 'react';
import './FlashcardStudy.css';

// Fisher-Yates shuffle — produces an unbiased random order, unlike naive
// approaches like sorting on Math.random() which skew the distribution
function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function FlashcardStudy({ cards, onExit }) {
  const [deck, setDeck] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = deck[index];

  function goNext() {
    setFlipped(false);
    setIndex((i) => (i + 1) % deck.length);
  }

  function goPrev() {
    setFlipped(false);
    setIndex((i) => (i - 1 + deck.length) % deck.length);
  }

  function shuffle() {
    setDeck(shuffleArray(cards));
    setIndex(0);
    setFlipped(false);
  }

  if (deck.length === 0) {
    return (
      <div>
        <p>No flashcards to study yet — add some first.</p>
        <button onClick={onExit}>Back</button>
      </div>
    );
  }

return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p>Card {index + 1} of {deck.length}</p>

        <div className="flip-card" onClick={() => setFlipped(!flipped)}>
          <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`}>
            <div className="flip-card-front">{card.front}</div>
            <div className="flip-card-back">{card.back}</div>
          </div>
        </div>
        <p className="flip-card-hint">Click the card to flip it</p>

        <div className="study-controls">
          <button className="btn btn-secondary" onClick={goPrev}>&larr; Previous</button>
          <button className="btn btn-primary" onClick={shuffle}>Shuffle</button>
          <button className="btn btn-secondary" onClick={goNext}>Next &rarr;</button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button className="btn btn-danger" onClick={onExit}>Exit Study Mode</button>
      </div>
    </div>
  );
}