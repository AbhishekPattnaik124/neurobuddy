import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';

export function UserProfile({ onClose }) {
  const { user, logout } = useAuthContext();

  if (!user) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(7,20,40,0.8)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      
      <div className="glass panel-enter p-panel" style={{
        width: '100%', maxWidth: '400px', position: 'relative',
        display: 'flex', flexDirection: 'column', gap: '24px',
        border: '1px solid rgba(0,229,255,0.2)'
      }} onClick={e => e.stopPropagation()}>
        
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: '1.2rem', width: '32px', height: '32px',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s'
        }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
          ✕
        </button>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--glow-primary), var(--glow-third))',
            margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--bg-void)',
            boxShadow: '0 0 24px rgba(0,229,255,0.4)',
            fontFamily: 'Outfit'
          }}>
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 className="font-syne" style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-bright)', fontWeight: 700 }}>
            {user.displayName || 'Student'}
          </h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontFamily: 'Outfit', fontSize: '1rem' }}>
            {user.email}
          </p>
        </div>

        <div style={{ height: '1px', background: 'rgba(0,229,255,0.1)' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'Outfit' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '0.95rem' }}>
            <span>Account Type</span>
            <span style={{ color: 'var(--glow-second)', fontWeight: 600 }}>
              {user.providerData?.[0]?.providerId === 'password' ? 'Email Auth' : 'Google Auth'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '0.95rem' }}>
            <span>UID</span>
            <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>
              {user.uid.slice(0, 8)}...
            </span>
          </div>
        </div>

        <button onClick={async () => { await logout(); window.location.reload(); }} className="btn btn-danger" style={{ width: '100%', marginTop: '16px', padding: '12px', fontSize: '1rem' }}>
          Sign Out
        </button>

      </div>
    </div>
  );
}
