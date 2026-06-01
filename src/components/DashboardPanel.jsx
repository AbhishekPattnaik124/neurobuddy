import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { AiCoachCard } from './AiCoachCard';
const TOOLS = [
  { id: 'chat', title: 'Chat & Explain', desc: 'Ask questions and get detailed, tailored explanations.', icon: '💬', levels: ['General', 'Grade 1-10', 'High School', 'BTech', 'MTech', 'PhD'] },
  { id: 'quiz', title: 'Quiz Generator', desc: 'Test your knowledge with AI-generated multiple choice questions.', icon: '🎯', levels: ['General', 'Grade 1-10', 'High School', 'BTech', 'MTech', 'PhD'] },
  { id: 'summarizer', title: 'Summarizer', desc: 'Paste long text to get key points, TLDR, and definitions.', icon: '📝', levels: ['General', 'High School', 'BTech', 'MTech', 'PhD'] },
  { id: 'flashcards', title: 'Flashcards', desc: 'Generate flashcards to test deep understanding of a topic.', icon: '🃏', levels: ['General', 'Grade 1-10', 'High School', 'BTech', 'MTech', 'PhD'] },
  { id: 'mindmap', title: 'Mind Maps', desc: 'Generate visual mermaid mindmaps to organize concepts.', icon: '🧠', levels: ['General', 'High School', 'BTech', 'MTech', 'PhD'] },
  { id: 'progress', title: 'Progress Tracking', desc: 'View your quiz scores and study history.', icon: '📈', levels: ['General', 'Grade 1-10', 'High School', 'BTech', 'MTech', 'PhD'] },
  // Future tools placeholders:
  { id: 'code-pair', title: 'Code Pair Programmer', desc: 'Upload code for debugging and pair programming.', icon: '💻', levels: ['BTech', 'MTech', 'PhD'], isComingSoon: false },
  { id: 'arxiv', title: 'ArXiv Paper Summarizer', desc: 'Search and summarize real scientific research papers.', icon: '🔬', levels: ['MTech', 'PhD'], isComingSoon: false },
  { id: 'storymode', title: 'StoryMode AI', desc: 'Learn complex topics through interactive stories.', icon: '📖', levels: ['Grade 1-10'], isComingSoon: false },
];

export function DashboardPanel({ onChange, educationLevel }) {
  const visibleTools = TOOLS.filter(t => t.levels.includes(educationLevel) || educationLevel === 'General');
  const { user } = useAuthContext();
  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Student';

  return (
    <div style={{ padding: '32px', overflowY: 'auto', height: '100%' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 className="font-syne" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '8px' }}>
          Welcome back, <span style={{ color: 'var(--glow-primary)' }}>{firstName}</span>! 🔥
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '32px', fontFamily: 'Outfit, sans-serif' }}>
          Ready to learn? You're using tools tailored for <strong style={{ color: 'var(--glow-second)' }}>{educationLevel}</strong> level.
        </p>

        <AiCoachCard />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {visibleTools.map(tool => (
            <div
              key={tool.id}
              onClick={() => !tool.isComingSoon && onChange(tool.id)}
              className="glass panel-enter"
              style={{
                padding: '24px',
                borderRadius: '16px',
                cursor: tool.isComingSoon ? 'not-allowed' : 'pointer',
                opacity: tool.isComingSoon ? 0.6 : 1,
                border: '1px solid rgba(0,229,255,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                if (!tool.isComingSoon) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,229,255,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!tool.isComingSoon) {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '2rem' }}>{tool.icon}</div>
                {tool.isComingSoon && (
                  <span style={{
                    fontSize: '0.65rem', padding: '4px 8px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)'
                  }}>
                    Coming Soon
                  </span>
                )}
              </div>
              <h3 className="font-syne" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-bright)', margin: 0 }}>
                {tool.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', margin: 0, fontFamily: 'Outfit, sans-serif', lineHeight: 1.5 }}>
                {tool.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
