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
  const [deck, setDeck] = useState(cards); // local, shufflable copy — doesn't mutate the original prop
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = deck[index];

  function goNext() {
    setFlipped(false); // always show the front first when landing on a new card
    setIndex((i) => (i + 1) % deck.length); // wraps back to the first card after the last
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
    <div>
      <p style={{ textAlign: 'center' }}>Card {index + 1} of {deck.length}</p>

      <div className="flip-card" onClick={() => setFlipped(!flipped)}>
        <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`}>
          <div className="flip-card-front">{card.front}</div>
          <div className="flip-card-back">{card.back}</div>
        </div>
      </div>
      <p className="flip-card-hint">Click the card to flip it</p>

      <div className="study-controls">
        <button onClick={goPrev}>&larr; Previous</button>
        <button onClick={shuffle}>Shuffle</button>
        <button onClick={goNext}>Next &rarr;</button>
      </div>
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button onClick={onExit}>Exit Study Mode</button>
      </div>
    </div>
  );
}