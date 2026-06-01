const ICONS = {
  success: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  error:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  info:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
};

export function Toast({ toasts, removeToast }) {
  return (
    <div style={{
      position: 'fixed', top: '80px', right: '20px',
      zIndex: 9990, display: 'flex', flexDirection: 'column', gap: '8px',
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast toast-${t.type} toast-enter`}
          style={{ pointerEvents: 'auto', cursor: 'none' }}
          onClick={() => removeToast(t.id)}
        >
          <span style={{ flexShrink: 0 }}>{ICONS[t.type] || ICONS.info}</span>
          <span style={{ color: 'var(--text-bright)', fontSize: '0.875rem' }}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
