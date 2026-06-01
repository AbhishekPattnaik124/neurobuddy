import { useState, useCallback } from 'react';
import { generateFlashcards, detectSubject } from '../utils/api';

const SUGGESTIONS = ['React Hooks', 'The Water Cycle', 'World War I Causes', "Newton's Laws of Motion", 'DNA Replication', 'Machine Learning Basics'];

export function FlashcardsPanel({ addToast, onSubjectDetected, educationLevel }) {
  const [topic, setTopic] = useState('');
  const [cards, setCards] = useState(null);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const gen = useCallback(async () => {
    if (!topic.trim()) { addToast('Enter a topic first.', 'info'); return; }
    setLoading(true); setCards(null); setIdx(0); setFlipped(false); setMastered(new Set());
    try {
      const cards = await generateFlashcards(topic, educationLevel);
      setCards(cards);
      detectSubject(topic).then(s => s && onSubjectDetected(s));
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    } finally { setLoading(false); }
  }, [topic, addToast, onSubjectDetected, educationLevel]);

  const goTo = (i) => { if (i >= 0 && i < cards.length) { setIdx(i); setFlipped(false); } };
  const toggleMastered = () => setMastered(prev => {
    const n = new Set(prev);
    n.has(idx) ? n.delete(idx) : n.add(idx);
    return n;
  });

  const card = cards?.[idx];


  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '24px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Topic input */}
        {!cards && !loading && (
          <div className="glass panel-enter" style={{ padding: '28px' }}>
            <div className="font-syne" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '8px' }}>
              Flashcard Maker
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px', fontFamily: 'Outfit, sans-serif' }}>
              I'll generate 8 flashcards that test deep understanding, not just memorization.
            </p>
            <input
              id="flashcard-topic-input"
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && gen()}
              placeholder="Topic or paste your notes…"
              className="input-ocean"
              style={{ marginBottom: '12px' }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => setTopic(s)} className="btn btn-ghost"
                  style={{ padding: '5px 12px', fontSize: '0.78rem', borderRadius: '20px' }}>
                  {s}
                </button>
              ))}
            </div>
            <button id="generate-cards-btn" onClick={gen} className="btn btn-primary" style={{ width: '100%', padding: '13px' }}>
              🃏 Create Flashcards
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="glass panel-enter" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🃏</div>
            <p className="font-syne" style={{ color: 'var(--glow-primary)', fontWeight: 600 }}>Generating flashcards…</p>
          </div>
        )}

        {/* Cards */}
        {cards && !loading && (
          <div className="panel-enter" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Card <span style={{ color: 'var(--glow-primary)', fontWeight: 700 }}>{idx + 1}</span> of {cards.length}
                </span>
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.8rem', color: 'var(--glow-second)' }}>
                  {mastered.size} mastered
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${((idx + 1) / cards.length) * 100}%` }} />
              </div>
            </div>

            {/* The card */}
            <div
              id="flashcard"
              className={`flashcard-scene ${flipped ? 'flipped' : ''}`}
              style={{
                height: '260px',
                animation: 'float 3s ease-in-out infinite',
              }}
              onClick={() => setFlipped(f => !f)}
            >
              <div className="flashcard-inner">
                {/* Front */}
                <div className="flashcard-front glass" style={{
                  background: 'linear-gradient(135deg, rgba(7,20,40,0.95), rgba(4,13,26,0.98))',
                  border: '1px solid rgba(0,229,255,0.18)',
                }}>
                  <div style={{
                    fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: 'var(--glow-primary)', marginBottom: '16px', fontFamily: 'Outfit, sans-serif', fontWeight: 600,
                  }}>
                    Question
                  </div>
                  <div style={{ fontSize: '2rem', marginBottom: '12px', color: 'rgba(0,229,255,0.4)' }}>?</div>
                  <p className="font-syne" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-bright)', lineHeight: 1.6 }}>
                    {card.front}
                  </p>
                  <p style={{ marginTop: '16px', fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'Outfit, sans-serif', animation: 'dot-pulse 2s ease infinite' }}>
                    Click to reveal →
                  </p>
                </div>

                {/* Back */}
                <div className="flashcard-back" style={{
                  background: 'linear-gradient(135deg, rgba(0,229,255,0.07), rgba(123,97,255,0.07))',
                  border: '1px solid rgba(0,255,157,0.25)',
                  boxShadow: '0 0 30px rgba(0,255,157,0.08)',
                }}>
                  <div style={{
                    fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: 'var(--glow-second)', marginBottom: '16px', fontFamily: 'Outfit, sans-serif', fontWeight: 600,
                  }}>
                    Answer
                  </div>
                  <div style={{ fontSize: '2rem', marginBottom: '12px', color: 'rgba(0,255,157,0.4)' }}>!</div>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-bright)', lineHeight: 1.7, fontFamily: 'Outfit, sans-serif' }}>
                    {card.back}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button id="prev-card-btn" onClick={() => goTo(idx - 1)} disabled={idx === 0}
                className="btn btn-ghost" style={{ flex: 1, padding: '10px' }}>← Prev</button>

              <button id="master-btn" onClick={toggleMastered}
                className="btn"
                style={{
                  flex: 1, padding: '10px',
                  background: mastered.has(idx) ? 'rgba(0,255,157,0.12)' : 'rgba(0,229,255,0.05)',
                  border: `1px solid ${mastered.has(idx) ? 'rgba(0,255,157,0.4)' : 'rgba(0,229,255,0.15)'}`,
                  color: mastered.has(idx) ? 'var(--glow-second)' : 'var(--text-muted)',
                  fontSize: '0.82rem',
                }}>
                {mastered.has(idx) ? '✅ Mastered' : '☆ Master'}
              </button>

              <button id="next-card-btn" onClick={() => goTo(idx + 1)} disabled={idx === cards.length - 1}
                className="btn btn-ghost" style={{ flex: 1, padding: '10px' }}>Next →</button>
            </div>

            {/* Dot indicators */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {cards.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: i === idx ? 'var(--glow-primary)' : mastered.has(i) ? 'var(--glow-second)' : 'rgba(255,255,255,0.1)',
                  border: i === idx ? 'none' : '1px solid rgba(255,255,255,0.15)',
                  boxShadow: i === idx ? '0 0 8px var(--glow-primary)' : 'none',
                  transition: 'all 0.2s', cursor: 'none',
                }} />
              ))}
            </div>

            {/* All mastered */}
            {mastered.size === cards.length && (
              <div style={{
                padding: '16px', borderRadius: '12px', textAlign: 'center',
                background: 'rgba(0,255,157,0.07)', border: '1px solid rgba(0,255,157,0.25)',
                animation: 'fade-up 0.4s ease both',
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🎉</div>
                <p className="font-syne" style={{ color: 'var(--glow-second)', fontWeight: 700, fontSize: '0.9rem' }}>You've mastered all cards!</p>
                <button onClick={() => setMastered(new Set())}
                  style={{ marginTop: '8px', background: 'none', border: 'none', cursor: 'none', color: 'var(--text-dim)', fontSize: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>
                  Reset & practice again
                </button>
              </div>
            )}

            {/* New topic */}
            <button onClick={() => { setCards(null); setTopic(''); }} className="btn btn-ghost" style={{ fontSize: '0.82rem' }}>
              ← New Topic
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
