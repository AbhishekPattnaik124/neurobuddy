import { useState, useCallback } from 'react';
import { generateQuiz, detectSubject, saveQuizScore } from '../utils/api';

const CONFETTI_COLORS = ['#00e5ff','#00ff9d','#7b61ff','#ff6b35','#ffd93d','#ff6b9d'];

function Confetti() {
  const [pieces] = useState(() => Array.from({ length: 50 }).map(() => ({
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 0.8}s`,
    animationDuration: `${1.5 + Math.random() * 1}s`,
    transform: `rotate(${Math.random() * 360}deg)`,
    width: `${4 + Math.random() * 6}px`,
    height: `${4 + Math.random() * 6}px`,
    borderRadius: Math.random() > 0.5 ? '50%' : '2px',
  })));

  return (
    <div className="confetti-container">
      {pieces.map((style, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            ...style,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          }}
        />
      ))}
    </div>
  );
}

function ScoreRing({ score, total }) {
  const r = 50;
  const circ = 2 * Math.PI * r;
  const pct = score / total;
  const offset = circ * (1 - pct);
  const color = pct >= 0.8 ? 'var(--glow-second)' : pct >= 0.6 ? 'var(--glow-primary)' : pct >= 0.4 ? 'var(--glow-third)' : 'var(--glow-warm)';

  const labels = {
    1: ['LEGENDARY 🔥', 'Absolutely perfect!'],
    0.8: ['EXCELLENT ⚡', 'Outstanding work!'],
    0.6: ['SOLID 💪', 'Great job — almost there!'],
    0: ['KEEP GRINDING 🎯', 'Practice makes perfect.'],
  };
  const [label, sublabel] = Object.entries(labels).reverse().find(([k]) => pct >= +k)?.[1] || labels[0];
  const pctVal = Math.round(pct * 100);

  return (
    <div style={{ textAlign: 'center', position: 'relative' }}>
      {pct === 1 && <Confetti />}
      <svg width="140" height="140" viewBox="0 0 120 120" style={{ display: 'block', margin: '0 auto 16px' }}>
        <circle className="score-ring-track" cx="60" cy="60" r={r} strokeWidth="8" />
        <circle
          className="score-ring-fill"
          cx="60" cy="60" r={r}
          strokeWidth="8"
          stroke={color}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
        <text x="60" y="56" textAnchor="middle" fill="var(--text-bright)" fontFamily="Orbitron" fontWeight="700" fontSize="18">{pctVal}%</text>
        <text x="60" y="72" textAnchor="middle" fill="var(--text-muted)" fontFamily="Outfit" fontSize="11">{score}/{total}</text>
      </svg>
      <div className="font-syne" style={{ fontSize: '1.6rem', fontWeight: 800, color, textShadow: `0 0 20px ${color}` }}>{label}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '6px', fontFamily: 'Outfit, sans-serif' }}>{sublabel}</div>
    </div>
  );
}

const TOPIC_SUGGESTIONS = ['Photosynthesis', 'Bubble Sort', 'World War II', 'Quantum Mechanics', 'Python Lists', 'The French Revolution', 'DNA Replication', 'Newton\'s Laws'];

export function QuizPanel({ addToast, onSubjectDetected, educationLevel }) {
  const [topic, setTopic] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [revealed, setRevealed] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  const gen = useCallback(async () => {
    if (!topic.trim()) { addToast('Enter a topic first.', 'info'); return; }
    setLoading(true); setQuiz(null); setSelected({}); setRevealed({}); setShowResult(false); setCurrent(0);
    try {
      const q = await generateQuiz(topic, educationLevel);
      setQuiz(q);
      detectSubject(topic).then(s => s && onSubjectDetected(s));
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    } finally { setLoading(false); }
  }, [topic, addToast, onSubjectDetected, educationLevel]);

  const select = (i) => { if (!revealed[current]) setSelected(p => ({ ...p, [current]: i })); };
  const reveal = () => {
    if (selected[current] === undefined) { addToast('Select an answer first!', 'info'); return; }
    setRevealed(p => ({ ...p, [current]: true }));
  };
  const next = () => {
    if (current < quiz.length - 1) { setCurrent(c => c + 1); }
    else {
      const score = quiz.filter((q, i) => selected[i] === q.ans).length;
      saveQuizScore(topic, score, quiz.length);
      setShowResult(true);
    }
  };

  const score = quiz ? quiz.filter((q, i) => selected[i] === q.ans).length : 0;
  const q = quiz?.[current];

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '24px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Topic input */}
        {!quiz && !loading && (
          <div className="glass panel-enter" style={{ padding: '28px' }}>
            <div className="font-syne" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '8px' }}>
              Quiz Generator
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px', fontFamily: 'Outfit, sans-serif' }}>
              Enter any topic and I'll create 5 challenging multiple-choice questions.
            </p>

            <div className="rotating-border" style={{ marginBottom: '16px' }}>
              <input
                id="quiz-topic-input"
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && gen()}
                placeholder="e.g. Photosynthesis, Bubble Sort, The French Revolution…"
                className="input-ocean"
                style={{ borderRadius: '11px' }}
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {TOPIC_SUGGESTIONS.map(s => (
                <button key={s} onClick={() => setTopic(s)} className="btn btn-ghost"
                  style={{ padding: '5px 12px', fontSize: '0.78rem', borderRadius: '20px' }}>
                  {s}
                </button>
              ))}
            </div>

            <button id="generate-quiz-btn" onClick={gen} className="btn btn-primary" style={{ width: '100%', padding: '13px' }}>
              ⚡ Generate Quiz
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="glass panel-enter" style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px', animation: 'spin 1.5s linear infinite', display: 'inline-block' }}>⚙️</div>
            <p className="font-syne" style={{ color: 'var(--glow-primary)', fontSize: '1rem', fontWeight: 600 }}>Crafting your quiz…</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px', fontFamily: 'Outfit, sans-serif' }}>Making it progressively harder</p>
          </div>
        )}

        {/* Results */}
        {showResult && quiz && (
          <div className="glass panel-enter" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
            <ScoreRing score={score} total={quiz.length} />

            {/* Review */}
            <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p className="font-syne" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                Review
              </p>
              {quiz.map((q, i) => (
                <div key={i} style={{
                  padding: '12px 14px', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start',
                  background: selected[i] === q.ans ? 'rgba(0,255,157,0.06)' : 'rgba(255,107,53,0.06)',
                  border: `1px solid ${selected[i] === q.ans ? 'rgba(0,255,157,0.2)' : 'rgba(255,107,53,0.2)'}`,
                }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{selected[i] === q.ans ? '✅' : '❌'}</span>
                  <div>
                    <p style={{ color: 'var(--text-bright)', fontSize: '0.875rem', fontFamily: 'Outfit, sans-serif' }}>{q.q}</p>
                    <p style={{ color: 'var(--glow-second)', fontSize: '0.78rem', marginTop: '3px', fontFamily: 'Outfit, sans-serif' }}>✓ {q.opts[q.ans]}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button id="retake-btn" onClick={() => { setSelected({}); setRevealed({}); setCurrent(0); setShowResult(false); }}
                className="btn btn-primary" style={{ flex: 1, padding: '11px' }}>
                🔄 Retake
              </button>
              <button onClick={() => { setQuiz(null); setTopic(''); }} className="btn btn-ghost" style={{ flex: 1, padding: '11px' }}>
                📝 New Topic
              </button>
            </div>
          </div>
        )}

        {/* Active quiz */}
        {quiz && !showResult && !loading && (
          <div className="panel-enter">
            {/* Progress */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="font-outfit" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Question <span style={{ color: 'var(--glow-primary)', fontWeight: 700 }}>{current + 1}</span> of {quiz.length}
                </span>
                <span className="font-outfit" style={{ fontSize: '0.78rem', color: 'var(--glow-second)' }}>
                  {quiz.filter((_, i) => revealed[i] && selected[i] === quiz[i].ans).length} correct
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${((current) / quiz.length) * 100}%` }} />
              </div>
            </div>

            {/* Question card */}
            <div className="glass" style={{ padding: '28px' }}>
              <p className="font-syne" style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-bright)', lineHeight: 1.6, marginBottom: '22px' }}>
                {q.q}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
                {q.opts.map((opt, i) => {
                  let extraClass = 'quiz-option';
                  if (revealed[current]) {
                    extraClass += ' disabled';
                    if (i === q.ans) extraClass += ' correct';
                    else if (i === selected[current]) extraClass += ' incorrect';
                  } else if (selected[current] === i) {
                    extraClass += ' selected';
                  }

                  return (
                    <button key={i} id={`quiz-opt-${current}-${i}`} className={extraClass} onClick={() => select(i)}>
                      <span style={{
                        width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.78rem', fontWeight: 700, fontFamily: 'Orbitron, sans-serif',
                        background: selected[current] === i ? 'var(--glow-primary)' : 'rgba(255,255,255,0.05)',
                        color: selected[current] === i ? 'var(--bg-void)' : 'var(--text-muted)',
                        transition: 'all 0.2s',
                        ...(revealed[current] && i === q.ans ? { background: 'var(--glow-second)', color: 'var(--bg-void)' } : {}),
                        ...(revealed[current] && i === selected[current] && i !== q.ans ? { background: 'var(--glow-warm)', color: 'var(--bg-void)' } : {}),
                      }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span>{opt}</span>
                      {revealed[current] && i === q.ans && <span style={{ marginLeft: 'auto' }}>✅</span>}
                      {revealed[current] && i === selected[current] && i !== q.ans && <span style={{ marginLeft: 'auto' }}>❌</span>}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {!revealed[current] ? (
                  <button id="check-answer-btn" onClick={reveal} disabled={selected[current] === undefined} className="btn btn-primary" style={{ padding: '10px 22px' }}>
                    Check Answer
                  </button>
                ) : (
                  <button id="next-question-btn" onClick={next} className="btn btn-primary" style={{ padding: '10px 22px' }}>
                    {current < quiz.length - 1 ? 'Next →' : 'See Results 🏁'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
