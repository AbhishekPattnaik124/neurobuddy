import { useState, useCallback } from 'react';
import { generateStory, detectSubject } from '../utils/api';
import ReactMarkdown from 'react-markdown';

const SUGGESTIONS = ['The Solar System', 'How Plants Grow', 'Dinosaurs', 'The Human Heart'];

export function StoryModePanel({ addToast, onSubjectDetected, educationLevel }) {
  const [topic, setTopic] = useState('');
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(false);

  const gen = useCallback(async () => {
    if (!topic.trim()) { addToast('Enter a topic first.', 'info'); return; }
    setLoading(true); setStory(null);
    try {
      const result = await generateStory(topic, educationLevel);
      setStory(result);
      detectSubject(topic).then(s => s && onSubjectDetected(s));
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    } finally { setLoading(false); }
  }, [topic, addToast, onSubjectDetected, educationLevel]);

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>

        {/* Input area */}
        {!story && !loading && (
          <div className="glass panel-enter" style={{ padding: '28px' }}>
            <div className="font-syne" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '8px' }}>
              StoryMode AI
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px', fontFamily: 'Outfit, sans-serif' }}>
              Learn complex topics through fun, interactive, and engaging stories!
            </p>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && gen()}
              placeholder="What do you want to hear a story about?"
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
            <button onClick={gen} className="btn btn-primary" style={{ width: '100%', padding: '13px' }}>
              📖 Tell me a Story!
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="glass panel-enter" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px', animation: 'bounce 1s infinite' }}>📖</div>
            <p className="font-syne" style={{ color: 'var(--glow-primary)', fontWeight: 600 }}>Once upon a time...</p>
          </div>
        )}

        {/* Rendered map */}
        {story && !loading && (
          <div className="glass panel-enter" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="font-syne" style={{ margin: 0, color: 'var(--text-bright)' }}>The Story of: {topic}</h3>
              <button onClick={() => { setStory(null); setTopic(''); }} className="btn btn-ghost" style={{ fontSize: '0.82rem' }}>
                ← New Story
              </button>
            </div>
            
            <div className="markdown-body" style={{ flex: 1, padding: '16px 0', overflowY: 'auto', fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', lineHeight: 1.8 }}>
              <ReactMarkdown>{story}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
