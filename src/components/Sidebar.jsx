
const NAV = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    levels: ['General', 'Grade 1-10', 'High School', 'BTech', 'MTech', 'PhD'],
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ),
  },
  {
    id: 'chat',
    label: 'Chat Explain',
    levels: ['General', 'Grade 1-10', 'High School', 'BTech', 'MTech', 'PhD'],
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.03 2 11c0 2.5 1.1 4.8 2.9 6.4L4 21l3.9-1.3C9.2 20.5 10.6 21 12 21c5.52 0 10-4.03 10-9s-4.48-9-10-9z"/>
        <path d="M8 11h.01M12 11h.01M16 11h.01"/>
      </svg>
    ),
  },
  {
    id: 'quiz',
    label: 'Quiz Me',
    levels: ['General', 'Grade 1-10', 'High School', 'BTech', 'MTech', 'PhD'],
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    id: 'summarizer',
    label: 'Summarize',
    levels: ['General', 'High School', 'BTech', 'MTech', 'PhD'],
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        <line x1="10" y1="9" x2="8" y2="9"/>
      </svg>
    ),
  },
  {
    id: 'flashcards',
    label: 'Flashcards',
    levels: ['General', 'Grade 1-10', 'High School', 'BTech', 'MTech', 'PhD'],
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="14" rx="2"/>
        <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
  },
  {
    id: 'mindmap',
    label: 'Mind Maps',
    levels: ['General', 'High School', 'BTech', 'MTech', 'PhD'],
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M3 12h5" />
        <path d="M16 12h5" />
        <path d="M12 3v5" />
        <path d="M12 16v5" />
      </svg>
    ),
  },
  {
    id: 'arxiv',
    label: 'ArXiv Papers',
    levels: ['MTech', 'PhD'],
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  {
    id: 'storymode',
    label: 'Story Mode',
    levels: ['Grade 1-10'],
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    id: 'code-pair',
    label: 'Code Pair',
    levels: ['BTech', 'MTech', 'PhD'],
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
  },
  {
    id: 'progress',
    label: 'My Progress',
    levels: ['General', 'Grade 1-10', 'High School', 'BTech', 'MTech', 'PhD'],
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
        <path d="M2 20h20"/>
      </svg>
    ),
  },
];

export function Sidebar({ active, onChange, educationLevel = 'General', onLegalClick }) {
  const visibleNav = NAV.filter(item => item.levels.includes(educationLevel) || educationLevel === 'General');

  return (
    <aside
      className="load-sidebar"
      style={{
        width: 'var(--sidebar-w)',
        flexShrink: 0,
        height: '100%',
        paddingTop: 'var(--header-h)',
        background: 'rgba(10,31,61,0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(0,229,255,0.15)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        overflowY: 'auto',
      }}
    >
      {/* Brand */}
      <div style={{
        padding: '24px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid rgba(0,229,255,0.03)'
      }}>
        <div style={{
          width: '36px', height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--glow-primary) 0%, var(--glow-second) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem',
          boxShadow: '0 4px 16px rgba(0,229,255,0.2)'
        }}>📚</div>
        <span className="font-syne" style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>
          StudyBuddy
        </span>
      </div>

      {/* Nav items */}
      <nav style={{ padding: '16px 0', flex: 1 }}>
        <div style={{ padding: '8px 12px 12px', marginBottom: '4px' }}>
          <span style={{
            fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--text-dim)',
            fontFamily: 'Outfit, sans-serif',
          }}>
            Features
          </span>
        </div>

        {visibleNav.map(item => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`nav-item ${active === item.id ? 'active' : ''}`}
            onClick={() => onChange(item.id)}
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
          >
            {item.icon}
            <span style={{ fontFamily: 'Outfit, sans-serif' }}>{item.label}</span>
            {active === item.id && (
              <span style={{
                marginLeft: 'auto', width: '6px', height: '6px',
                borderRadius: '50%', background: 'var(--glow-primary)',
                boxShadow: '0 0 8px var(--glow-primary)',
                flexShrink: 0,
              }} />
            )}
          </button>
        ))}
      </nav>

      {/* Bottom branding and legal */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(0,229,255,0.06)',
        fontSize: '0.7rem',
        color: 'var(--text-dim)',
        fontFamily: 'Outfit, sans-serif',
        lineHeight: 1.5,
      }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <button 
            onClick={() => onLegalClick('privacy')} 
            style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Privacy
          </button>
          <span>&middot;</span>
          <button 
            onClick={() => onLegalClick('terms')} 
            style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Terms
          </button>
        </div>
        <div style={{ color: 'var(--glow-primary)', fontSize: '0.65rem', marginBottom: '2px' }}>
          gemini-2.5-flash
        </div>
        <div>StudyBuddy AI v2.0</div>
      </div>
    </aside>
  );
}

/* Mobile bottom tab bar */
export function MobileTabBar({ active, onChange, educationLevel = 'General', onLegalClick }) {
  const visibleNav = NAV.filter(item => item.levels.includes(educationLevel) || educationLevel === 'General');
  
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: '64px',
      background: 'rgba(4,13,26,0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(0,229,255,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      zIndex: 100,
      padding: '0 8px',
    }}>
      {visibleNav.map(item => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: active === item.id ? 'var(--glow-primary)' : 'var(--text-muted)',
            padding: '8px 12px', borderRadius: '10px',
            transition: 'color 0.2s',
          }}
        >
          <span style={{
            width: '20px', height: '20px',
            filter: active === item.id ? 'drop-shadow(0 0 6px var(--glow-primary))' : 'none',
          }}>
            {item.icon}
          </span>
          <span style={{ fontSize: '0.6rem', fontFamily: 'Outfit, sans-serif' }}>
            {item.label.split(' ')[0]}
          </span>
        </button>
      ))}
    </nav>
  );
}
