const SUBJECT_CONFIG = {
  ComputerScience: { cls: 'badge-cs',        icon: '💻', label: 'CS' },
  Mathematics:     { cls: 'badge-math',       icon: '∑',  label: 'Math' },
  Physics:         { cls: 'badge-physics',    icon: '⚛',  label: 'Physics' },
  Chemistry:       { cls: 'badge-chemistry',  icon: '⚗',  label: 'Chemistry' },
  Biology:         { cls: 'badge-science',    icon: '🧬', label: 'Biology' },
  History:         { cls: 'badge-history',    icon: '📜', label: 'History' },
  Geography:       { cls: 'badge-geography',  icon: '🌍', label: 'Geography' },
  Literature:      { cls: 'badge-literature', icon: '📚', label: 'Literature' },
  Economics:       { cls: 'badge-economics',  icon: '📈', label: 'Economics' },
  General:         { cls: 'badge-general',    icon: '🎓', label: 'General' },
};

export function Header({ subject, backendOnline, onSettings, onProfile, educationLevel, setEducationLevel }) {
  const cfg = subject ? SUBJECT_CONFIG[subject] : null;

  return (
    <header
      className="load-header"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 'var(--header-h)',
        background: 'rgba(10,31,61,0.8)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid rgba(0,229,255,0.15)',
        boxShadow: '0 4px 40px rgba(0,229,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '1.4rem' }}>🧠</div>
        <span className="font-orbitron" style={{
          fontSize: '1.1rem', fontWeight: 700,
          color: 'var(--glow-primary)',
          textShadow: '0 0 20px rgba(0,229,255,0.5)',
          letterSpacing: '0.05em',
        }}>
          NeuroBuddy
          <span style={{
            display: 'inline-block',
            width: '6px', height: '6px',
            background: 'var(--glow-second)',
            borderRadius: '50%',
            margin: '0 4px',
            animation: 'dot-pulse 2s ease-in-out infinite',
            boxShadow: '0 0 8px var(--glow-second)',
          }} />
          AI
        </span>
      </div>

      {/* Center — subject badge */}
      <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {cfg && (
          <span
            className={`subject-badge ${cfg.cls}`}
            style={{ animation: 'fade-up 0.3s ease both' }}
          >
            {cfg.icon} {cfg.label}
          </span>
        )}
      </div>

      {/* Right — status + settings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            className="status-dot"
            style={{ background: backendOnline ? 'var(--glow-second)' : 'var(--glow-warm)' }}
          />
          <span className="font-outfit hide-mobile" style={{
            fontSize: '0.75rem',
            color: backendOnline ? 'var(--glow-second)' : 'var(--glow-warm)',
            letterSpacing: '0.05em',
          }}>
            {backendOnline ? 'AI Active' : 'Offline'}
          </span>
        </div>

        {/* Level Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '4px' }}>
          <span className="hide-mobile" style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'Outfit, sans-serif' }}>Level:</span>
          <select 
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
            className="level-select"
          >
            <option value="General">General / All</option>
            <option value="Grade 1-10">Grade 1-10</option>
            <option value="High School">High School</option>
            <option value="BTech">BTech / Undergrad</option>
            <option value="MTech">MTech / Postgrad</option>
            <option value="PhD">PhD / Research</option>
          </select>
        </div>

        {/* Settings */}
        <button
          id="settings-btn"
          className="btn btn-ghost"
          onClick={onSettings}
          style={{ padding: '6px', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>

        {/* Profile Button */}
        <button
          className="btn btn-ghost"
          onClick={onProfile}
          style={{ padding: '6px', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </button>
      </div>
    </header>
  );
}

export { SUBJECT_CONFIG };
