import { useState, useCallback } from 'react';
import { summarizeArxiv, detectSubject } from '../utils/api';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

const SUGGESTIONS = ['electron', 'quantum computing', 'transformers machine learning', 'crispr'];

export function ArxivPanel({ addToast, onSubjectDetected, educationLevel }) {
  const [query, setQuery] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const gen = useCallback(async () => {
    if (!query.trim()) { addToast('Enter a search term first.', 'info'); return; }
    setLoading(true); setSummary(null);
    try {
      const result = await summarizeArxiv(query, educationLevel);
      setSummary(result);
      detectSubject(query).then(s => s && onSubjectDetected(s));
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    } finally { setLoading(false); }
  }, [query, addToast, onSubjectDetected, educationLevel]);

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>

        {/* Input area */}
        {!summary && !loading && (
          <div className="glass panel-enter" style={{ padding: '28px' }}>
            <div className="font-syne" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '8px' }}>
              ArXiv Paper Summarizer
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px', fontFamily: 'Outfit, sans-serif' }}>
              Search for scientific papers and get instant, PhD-level summaries of their abstracts.
            </p>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && gen()}
              placeholder="Enter a topic or keywords (e.g. quantum computing)..."
              className="input-ocean"
              style={{ marginBottom: '12px' }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => setQuery(s)} className="btn btn-ghost"
                  style={{ padding: '5px 12px', fontSize: '0.78rem', borderRadius: '20px' }}>
                  {s}
                </button>
              ))}
            </div>
            <button onClick={gen} className="btn btn-primary" style={{ width: '100%', padding: '13px' }}>
              🔬 Fetch & Summarize
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="glass panel-enter" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px', animation: 'spin 3s linear infinite' }}>🔬</div>
            <p className="font-syne" style={{ color: 'var(--glow-primary)', fontWeight: 600 }}>Scouring the ArXiv databases...</p>
          </div>
        )}

        {/* Rendered map */}
        {summary && !loading && (
          <div className="glass panel-enter" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="font-syne" style={{ margin: 0, color: 'var(--text-bright)' }}>Results for: {query}</h3>
              <button onClick={() => { setSummary(null); setQuery(''); }} className="btn btn-ghost" style={{ fontSize: '0.82rem' }}>
                ← New Search
              </button>
            </div>
            
            <div className="markdown-body" style={{ flex: 1, padding: '16px 0', overflowY: 'auto', fontFamily: 'Outfit, sans-serif' }}>
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{summary}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
