import { useState, useEffect } from 'react';
import { checkHealth } from '../utils/api';

export function SettingsModal({ onClose }) {
  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [onClose]);

  useEffect(() => {
    checkHealth().then(h => { setHealth(h); setChecking(false); });
  }, []);

  const online = health?.status === 'ok' && health?.key_set;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(2,8,16,0.8)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="glass p-panel" style={{
        width: '100%', maxWidth: '480px',
        animation: 'panel-enter 0.4s cubic-bezier(0.16,1,0.3,1) both',
        border: '1px solid rgba(0,229,255,0.2)',
        boxShadow: '0 0 60px rgba(0,229,255,0.08)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h2 className="font-syne" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)' }}>Setup</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'Outfit, sans-serif', marginTop: '4px' }}>
              Configure your AI backend
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'none', color: 'var(--text-muted)', fontSize: '1.2rem' }}>✕</button>
        </div>

        {/* Status card */}
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          background: online ? 'rgba(0,255,157,0.06)' : 'rgba(255,107,53,0.06)',
          border: `1px solid ${online ? 'rgba(0,255,157,0.25)' : 'rgba(255,107,53,0.25)'}`,
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: checking ? 'var(--glow-primary)' : online ? 'var(--glow-second)' : 'var(--glow-warm)',
              boxShadow: checking ? '0 0 8px var(--glow-primary)' : online ? '0 0 8px var(--glow-second)' : '0 0 8px var(--glow-warm)',
              animation: checking ? 'dot-pulse 1s ease infinite' : 'none',
            }} />
            <span className="font-syne" style={{
              fontSize: '0.85rem', fontWeight: 700,
              color: checking ? 'var(--glow-primary)' : online ? 'var(--glow-second)' : 'var(--glow-warm)',
            }}>
              {checking ? 'Checking backend…' : online ? '✓ Backend Connected' : '✗ Backend Not Detected'}
            </span>
          </div>
          {health && (
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <div>model: {health.model || 'N/A'}</div>
              <div>key_set: {String(health.key_set)}</div>
              <div>sdk: {health.sdk_available ? 'installed ✓' : 'missing ✗'}</div>
            </div>
          )}
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          {[
            {
              step: '01',
              title: 'Get a Free Gemini API Key',
              desc: 'Visit aistudio.google.com → Sign in → Get API Key',
              color: 'var(--glow-primary)',
            },
            {
              step: '02',
              title: 'Add Key to Backend',
              desc: 'Edit backend/.env → Set GEMINI_API_KEY=your_key',
              color: 'var(--glow-third)',
            },
            {
              step: '03',
              title: 'Start the Backend',
              desc: 'Run backend/start.bat (Windows) or: cd backend && python main.py',
              color: 'var(--glow-second)',
            },
          ].map(item => (
            <div key={item.step} style={{
              display: 'flex', gap: '14px', alignItems: 'flex-start',
              padding: '12px', borderRadius: '10px',
              background: 'rgba(7,20,40,0.5)',
              border: '1px solid rgba(0,229,255,0.06)',
            }}>
              <span className="font-orbitron" style={{ fontSize: '0.75rem', color: item.color, flexShrink: 0, marginTop: '2px' }}>
                {item.step}
              </span>
              <div>
                <p className="font-syne" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-bright)' }}>{item.title}</p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => { setChecking(true); checkHealth().then(h => { setHealth(h); setChecking(false); }); }}
            className="btn btn-ghost" style={{ flex: 1, padding: '11px' }}>
            ↻ Recheck
          </button>
          <button onClick={onClose} className="btn btn-primary" style={{ flex: 1, padding: '11px' }}>
            {online ? '✓ Done' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
