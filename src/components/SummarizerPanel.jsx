import { useState, useCallback } from 'react';
import { summarizeText, detectSubject, copyToClipboard } from '../utils/api';

const EXAMPLE = `Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy—usually from the sun—into chemical energy stored as glucose. This occurs in the chloroplasts, which contain chlorophyll.

The overall equation: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

There are two main stages: the light-dependent reactions (in thylakoid membranes, producing ATP and NADPH) and the Calvin cycle (in the stroma, producing glucose). Photosynthesis is critical for life — it produces oxygen and forms the base of most food chains.`;

function SummarySection({ title, content, color, delay, icon }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse bullet points
  const lines = content.split('\n').filter(Boolean);

  return (
    <div
      style={{
        borderRadius: '12px',
        background: 'rgba(7,20,40,0.6)',
        border: '1px solid rgba(0,229,255,0.08)',
        borderLeft: `3px solid ${color}`,
        overflow: 'hidden',
        animation: `reveal-section 0.5s cubic-bezier(0.16,1,0.3,1) both`,
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        background: `${color}08`,
        borderBottom: `1px solid ${color}20`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1rem' }}>{icon}</span>
          <span className="font-syne" style={{ fontSize: '0.85rem', fontWeight: 700, color }}>
            {title}
          </span>
        </div>
        <button
          onClick={handleCopy}
          style={{
            background: 'none', border: 'none', cursor: 'none',
            color: copied ? 'var(--glow-second)' : 'var(--text-dim)',
            fontSize: '0.75rem', fontFamily: 'Outfit, sans-serif',
            display: 'flex', alignItems: 'center', gap: '4px',
            transition: 'color 0.2s',
          }}
        >
          {copied ? '✓ Copied' : '⎘ Copy'}
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px' }}>
        {lines.map((line, i) => {
          const isBullet = line.startsWith('-') || line.startsWith('•');
          const isDefinition = line.includes(':') && !isBullet;
          const clean = line.replace(/^[-•]\s*/, '');
          const [term, ...rest] = isDefinition ? line.split(':') : [];
          return (
            <div key={i} style={{
              display: 'flex', gap: '8px', alignItems: 'flex-start',
              marginBottom: i < lines.length - 1 ? '8px' : 0,
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.875rem', lineHeight: 1.7,
            }}>
              {isBullet && (
                <span style={{ color, flexShrink: 0, marginTop: '2px' }}>▸</span>
              )}
              <span style={{ color: 'var(--text-bright)' }}>
                {isDefinition ? (
                  <>
                    <strong style={{ color }}>{term.trim()}</strong>
                    <span style={{ color: 'var(--text-muted)' }}>:{rest.join(':')}</span>
                  </>
                ) : clean}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SummarizerPanel({ addToast, onSubjectDetected, educationLevel }) {
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const MAX = 6000;

  const wordCount = input.trim().split(/\s+/).filter(Boolean).length;

  const handleSummarize = useCallback(async () => {
    if (!input.trim()) { addToast('Paste some text first.', 'info'); return; }
    if (input.trim().length < 50) { addToast('Please enter at least 50 characters.', 'info'); return; }
    setLoading(true); setSummary(null);
    try {
      const result = await summarizeText(input.trim(), educationLevel);
      setSummary(result);
      detectSubject(input.slice(0, 300)).then(s => s && onSubjectDetected(s));
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    } finally { setLoading(false); }
  }, [input, addToast, onSubjectDetected, educationLevel]);

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
          gap: '20px',
        }}
          className="panel-enter"
        >
          {/* Left: input */}
          <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="font-syne" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                Paste Your Notes
              </span>
              <button
                onClick={() => setInput(EXAMPLE)}
                style={{
                  background: 'none', border: 'none', cursor: 'none',
                  color: 'var(--glow-primary)', fontSize: '0.75rem',
                  fontFamily: 'Outfit, sans-serif', transition: 'opacity 0.2s',
                }}
              >
                Load Example
              </button>
            </div>

            <textarea
              id="summarizer-input"
              value={input}
              onChange={e => setInput(e.target.value.slice(0, MAX))}
              placeholder="Paste lecture notes, textbook paragraphs, or any educational text here…"
              className="input-ocean"
              style={{ flex: 1, minHeight: '340px', lineHeight: '1.7' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                fontSize: '0.78rem', fontFamily: 'Outfit, sans-serif',
                color: input.length > MAX * 0.9 ? 'var(--glow-warm)' : 'var(--text-dim)',
              }}>
                {wordCount} words · {input.length.toLocaleString()}/{MAX.toLocaleString()} chars
              </span>
              <button
                id="summarize-btn"
                onClick={handleSummarize}
                disabled={loading || !input.trim()}
                className="btn btn-primary"
                style={{ padding: '10px 20px' }}
              >
                {loading ? '⏳ Summarizing…' : '✨ Summarize'}
              </button>
            </div>
          </div>

          {/* Right: output */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {!loading && !summary && (
              <div className="glass" style={{ padding: '32px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div style={{ fontSize: '3rem' }}>📝</div>
                <p className="font-syne" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Summary appears here</p>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', fontFamily: 'Outfit, sans-serif' }}>
                  Key Points · Important Definitions · TL;DR
                </p>
              </div>
            )}

            {loading && (
              <div className="glass" style={{ padding: '32px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', border: '3px solid rgba(0,229,255,0.1)', borderTop: '3px solid var(--glow-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p className="font-syne" style={{ color: 'var(--glow-primary)', fontSize: '0.9rem', fontWeight: 600 }}>Analyzing your text…</p>
              </div>
            )}

            {summary && !loading && (
              <>
                <SummarySection
                  title="Key Points" icon="🔑" color="var(--glow-primary)"
                  content={summary.keypoints} delay={0}
                />
                <SummarySection
                  title="Important Definitions" icon="📖" color="var(--glow-third)"
                  content={summary.definitions} delay={200}
                />
                <SummarySection
                  title="TL;DR" icon="⚡" color="var(--glow-second)"
                  content={summary.tldr} delay={400}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile responsive style */}
      <style>{`
        @media (max-width: 768px) {
          .summarizer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
