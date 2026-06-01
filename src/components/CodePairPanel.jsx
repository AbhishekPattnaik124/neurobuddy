import { useState, useCallback } from 'react';
import { generateCodePair } from '../utils/api';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

export function CodePairPanel({ addToast, onSubjectDetected, educationLevel }) {
  const [code, setCode] = useState('');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const gen = useCallback(async () => {
    if (!code.trim()) { addToast('Enter some code to review.', 'info'); return; }
    if (!question.trim()) { addToast('Ask a question about the code.', 'info'); return; }
    
    setLoading(true); setResponse(null);
    try {
      const result = await generateCodePair(code, question, educationLevel);
      setResponse(result);
      onSubjectDetected('ComputerScience');
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    } finally { setLoading(false); }
  }, [code, question, addToast, onSubjectDetected, educationLevel]);

  return (
    <div className="p-panel" style={{ overflowY: 'auto', height: '100%' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>

        <div className="glass panel-enter p-inner" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div className="font-syne" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '4px' }}>
              Code Pair Programmer
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
              Paste your code and ask an expert Senior Engineer for debugging, review, or optimization.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Your Code:</label>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Paste code snippet here..."
                className="input-ocean"
                style={{ 
                  fontFamily: 'monospace', 
                  minHeight: '200px', 
                  resize: 'vertical',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre'
                }}
                spellCheck="false"
              />
            </div>

            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Your Question:</label>
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter' && e.ctrlKey) gen();
                }}
                placeholder="E.g., Why is this returning undefined? or How can I optimize this?"
                className="input-ocean"
                style={{ minHeight: '100px', resize: 'vertical' }}
              />
              <button onClick={gen} disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '13px', marginTop: 'auto' }}>
                {loading ? '💻 Reviewing Code...' : '💻 Ask Pair Programmer'}
              </button>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center' }}>Pro-tip: Press Ctrl+Enter to submit</div>
            </div>
          </div>
        </div>

        {/* Rendered Response */}
        {response && !loading && (
          <div className="glass panel-enter p-inner" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="font-syne" style={{ margin: 0, color: 'var(--text-bright)' }}>AI Code Review</h3>
            </div>
            
            <div className="markdown-body" style={{ flex: 1, padding: '16px 0', overflowY: 'auto', fontFamily: 'Outfit, sans-serif' }}>
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{response}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
