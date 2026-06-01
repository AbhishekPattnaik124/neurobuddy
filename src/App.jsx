import { useState, useCallback, useEffect } from 'react';
import { ParticleCanvas } from './components/ParticleCanvas';
import { CustomCursor } from './components/CustomCursor';
import { AuroraBackground } from './components/AuroraBackground';
import { Header } from './components/Header';
import { Sidebar, MobileTabBar } from './components/Sidebar';
import { ChatPanel } from './components/ChatPanel';
import { QuizPanel } from './components/QuizPanel';
import { SummarizerPanel } from './components/SummarizerPanel';
import { FlashcardsPanel } from './components/FlashcardsPanel';
import { ProgressPanel } from './components/ProgressPanel';
import { SettingsModal } from './components/SettingsModal';
import { DashboardPanel } from './components/DashboardPanel';
import { MindMapPanel } from './components/MindMapPanel';
import { ArxivPanel } from './components/ArxivPanel';
import { StoryModePanel } from './components/StoryModePanel';
import { CodePairPanel } from './components/CodePairPanel';
import { Toast } from './components/Toast';
import { useToast } from './hooks/useToast';
import { checkHealth } from './utils/api';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { AuthPage } from './components/AuthPage';
import { UserProfile } from './components/UserProfile';
import { PrivacyPolicy, TermsOfService } from './components/LegalPages';

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return mobile;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

function MainApp() {
  const [active, setActive] = useState('dashboard');
  const [subject, setSubject] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [educationLevel, setEducationLevel] = useState(
    () => localStorage.getItem('NeuroBuddy_edu_level') || 'General'
  );
  const { toasts, addToast, removeToast } = useToast();
  const isMobile = useIsMobile();
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    localStorage.setItem('NeuroBuddy_edu_level', educationLevel);
  }, [educationLevel]);

  // Check backend on mount
  useEffect(() => {
    checkHealth().then(h => {
      const ok = h?.status === 'ok' && h?.key_set;
      setBackendOnline(ok);
      if (!ok) {
        addToast('Backend not detected — open Setup to get started.', 'info', 6000);
        setTimeout(() => setShowSettings(true), 1200);
      }
    });
  }, [addToast]);

  const handleSubjectDetected = useCallback((s) => {
    if (s && s !== 'General') setSubject(s);
  }, []);

  const handlePanelChange = useCallback((panel) => {
    setActive(panel);
    setSubject(null);
  }, []);

  const panelProps = {
    addToast,
    onSubjectDetected: handleSubjectDetected,
    educationLevel,
  };

  if (isLoading) {
    return (
      <>
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-void)', zIndex: -1 }} />
        <AuroraBackground />
        <ParticleCanvas />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>
          Loading NeuroBuddy AI...
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-void)', zIndex: -1 }} />
        <AuroraBackground />
        <ParticleCanvas />
        <AuthPage />
      </>
    );
  }

  return (
    <>
      {/* Layered background */}
      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-void)', zIndex: -1 }} />
      <AuroraBackground />
      <ParticleCanvas />
      <CustomCursor />

      {/* App shell */}
      <div
        className="load-bg"
        style={{
          position: 'relative', zIndex: 10,
          display: 'flex', flexDirection: 'column',
          height: '100vh', width: '100vw', overflow: 'hidden',
        }}
      >
        {/* Fixed header */}
        <Header
          subject={subject}
          backendOnline={backendOnline}
          onSettings={() => setShowSettings(true)}
          onProfile={() => setShowProfile(true)}
          educationLevel={educationLevel}
          setEducationLevel={setEducationLevel}
        />

        {/* Below header */}
        <div style={{
          display: 'flex',
          flex: 1,
          paddingTop: 'var(--header-h)',
          paddingBottom: isMobile ? 'calc(64px + env(safe-area-inset-bottom, 0px))' : 0,
          overflow: 'hidden',
        }}>
          {/* Sidebar (desktop) */}
          {!isMobile && (
            <Sidebar active={active} onChange={handlePanelChange} educationLevel={educationLevel} onLegalClick={setActive} />
          )}

          {/* Main panel */}
          <main
            key={active}
            className="load-main"
            style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            {active === 'dashboard'  && <DashboardPanel  {...panelProps} active={active} onChange={handlePanelChange} educationLevel={educationLevel} />}
            {active === 'chat'       && <ChatPanel       {...panelProps} />}
            {active === 'quiz'       && <QuizPanel       {...panelProps} />}
            {active === 'summarizer' && <SummarizerPanel {...panelProps} />}
            {active === 'flashcards' && <FlashcardsPanel {...panelProps} />}
            {active === 'mindmap'    && <MindMapPanel    {...panelProps} />}
            {active === 'arxiv'      && <ArxivPanel      {...panelProps} />}
            {active === 'storymode'  && <StoryModePanel  {...panelProps} />}
            {active === 'code-pair'  && <CodePairPanel   {...panelProps} />}
            {active === 'progress'   && <ProgressPanel />}
            {active === 'privacy'    && <PrivacyPolicy onBack={() => setActive('dashboard')} />}
            {active === 'terms'      && <TermsOfService onBack={() => setActive('dashboard')} />}
          </main>
        </div>

        {/* Mobile bottom tab bar */}
        {isMobile && <MobileTabBar active={active} onChange={handlePanelChange} educationLevel={educationLevel} onLegalClick={setActive} />}
      </div>

      {/* Profile modal */}
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}

      {/* Settings modal */}
      {showSettings && <SettingsModal onClose={() => {
        setShowSettings(false);
        checkHealth().then(h => setBackendOnline(h?.status === 'ok' && h?.key_set));
      }} />}

      {/* Toasts */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  );
}
