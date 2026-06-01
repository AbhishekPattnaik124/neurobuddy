import { useState, useCallback, useEffect, useRef } from 'react';
import { generateMindMap, detectSubject } from '../utils/api';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Outfit, sans-serif',
});

const SUGGESTIONS = ['Photosynthesis', 'World War II', 'Machine Learning', 'The Water Cycle'];

export function MindMapPanel({ addToast, onSubjectDetected, educationLevel }) {
  const [topic, setTopic] = useState('');
  const [mindmapCode, setMindmapCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const gen = useCallback(async () => {
    if (!topic.trim()) { addToast('Enter a topic first.', 'info'); return; }
    setLoading(true); setMindmapCode(null);
    try {
      const code = await generateMindMap(topic, educationLevel);
      setMindmapCode(code);
      detectSubject(topic).then(s => s && onSubjectDetected(s));
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    } finally { setLoading(false); }
  }, [topic, addToast, onSubjectDetected, educationLevel]);

  useEffect(() => {
    if (mindmapCode && containerRef.current) {
      const uniqueId = `mermaid-${Date.now()}`;
      mermaid.render(uniqueId, mindmapCode).then((result) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = result.svg;
        }
      }).catch(err => {
        console.error('Mermaid render error:', err);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div style="color:var(--glow-warm);padding:16px;text-align:center">⚠️ Failed to render mindmap. The AI may have returned an unusual format — please try a simpler topic.</div>`;
        }
      });
    }
  }, [mindmapCode]);

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>

        {/* Topic input */}
        {!mindmapCode && !loading && (
          <div className="glass panel-enter" style={{ padding: '28px' }}>
            <div className="font-syne" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '8px' }}>
              Mind Map Generator
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px', fontFamily: 'Outfit, sans-serif' }}>
              Visualize complex topics and see how concepts connect.
            </p>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && gen()}
              placeholder="Enter a topic..."
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
              🧠 Generate Map
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="glass panel-enter" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🧠</div>
            <p className="font-syne" style={{ color: 'var(--glow-primary)', fontWeight: 600 }}>Building your mind map…</p>
          </div>
        )}

        {/* Rendered map */}
        {mindmapCode && !loading && (
          <div className="glass panel-enter" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="font-syne" style={{ margin: 0, color: 'var(--text-bright)' }}>{topic}</h3>
              <button onClick={() => { setMindmapCode(null); setTopic(''); }} className="btn btn-ghost" style={{ fontSize: '0.82rem' }}>
                ← New Map
              </button>
            </div>
            
            <div 
              ref={containerRef} 
              style={{ 
                flex: 1, 
                background: 'rgba(0,0,0,0.2)', 
                borderRadius: '12px', 
                padding: '24px',
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {/* Mermaid SVG inserted here */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
