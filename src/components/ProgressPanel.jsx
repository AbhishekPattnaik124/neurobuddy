import { useEffect, useState } from 'react';
import { getQuizScores } from '../utils/api';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

function StatCard({ value, label, icon, color, delay }) {
  return (
    <div className="stat-card" style={{ animation: `fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both`, animationDelay: `${delay}ms`, padding: '20px', background: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{icon}</div>
      <div className="font-orbitron" style={{ fontSize: '2rem', fontWeight: 700, color, textShadow: `0 0 16px ${color}44`, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', letterSpacing: '0.04em' }}>
        {label}
      </div>
    </div>
  );
}

function getStreak(scores) {
  if (!scores.length) return 0;
  const days = new Set(scores.map(s => {
    const d = s.timestamp || s.date;
    return d ? new Date(d).toISOString().split('T')[0] : null;
  }).filter(Boolean));
  const sortedDays = [...days].sort().reverse();
  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);
  for (const day of sortedDays) {
    const d = new Date(day);
    const diff = Math.round((current - d) / (1000 * 60 * 60 * 24));
    if (diff <= 1) { streak++; current = d; }
    else break;
  }
  return streak;
}

export function ProgressPanel() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getQuizScores();
      setScores(data || []);
      setLoading(false);
    }
    loadData();
  }, []);

  const total = scores.length;
  const avg = total ? Math.round(scores.reduce((a, b) => a + (b.pct || Math.round((b.score / b.total) * 100)), 0) / total) : 0;
  const best = total ? Math.max(...scores.map(s => s.pct || Math.round((s.score / s.total) * 100))) : 0;
  const streak = getStreak(scores);

  // Radar chart data preparation
  const topicMap = {};
  scores.forEach(s => {
      const topic = s.topic.split(' ')[0]; // use first word for radar to keep it concise
      if (!topicMap[topic]) topicMap[topic] = { count: 0, sum: 0 };
      topicMap[topic].count += 1;
      topicMap[topic].sum += s.pct || Math.round((s.score / s.total) * 100);
  });
  const radarData = Object.keys(topicMap).map(topic => ({
      subject: topic,
      A: Math.round(topicMap[topic].sum / topicMap[topic].count),
      fullMark: 100
  })).slice(0, 6); // max 6 points on radar

  if (loading) return <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>Loading progress...</div>;

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '24px' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }} className="panel-enter">

        <div>
          <h2 className="font-syne" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-bright)', margin: 0 }}>My Progress</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontFamily: 'Outfit, sans-serif', marginTop: '4px' }}>
            {total ? `${total} quiz${total !== 1 ? 'zes' : ''} completed` : 'Complete your first quiz to see stats!'}
          </p>
        </div>

        {/* Stat cards */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          <StatCard value={total} label="Quizzes Taken" icon="📚" color="var(--glow-primary)" delay={0} />
          <StatCard value={`${avg}%`} label="Average Score" icon="📊" color="var(--glow-third)" delay={80} />
          <StatCard value={`${best}%`} label="Best Score" icon="🏆" color="var(--glow-yellow)" delay={160} />
          <StatCard value={streak} label={`Day Streak`} icon="🔥" color="var(--glow-warm)" delay={240} />
        </div>

        {/* Radar Chart */}
        {radarData.length > 2 && (
          <div className="glass" style={{ padding: '20px', background: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <p className="font-syne" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '16px', textAlign: 'center' }}>
              Subject Proficiency
            </p>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent history */}
        {total > 0 && (
          <div className="glass" style={{ padding: '20px', background: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <p className="font-syne" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '16px' }}>
              Recent Quizzes
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {scores.slice(0, 10).map((s, i) => {
                const pct = s.pct || Math.round((s.score / s.total) * 100);
                const color = pct >= 80 ? 'var(--glow-second)' : pct >= 60 ? 'var(--glow-primary)' : 'var(--glow-warm)';
                const date = (s.timestamp || s.date) ? new Date(s.timestamp || s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div style={{ width: '4px', height: '32px', borderRadius: '2px', background: color, boxShadow: `0 0 6px ${color}` }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', color: 'var(--text-bright)', fontWeight: 500, margin: 0 }}>{s.topic}</p>
                      <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.72rem', color: 'var(--text-dim)', margin: 0, marginTop: '2px' }}>{date}</p>
                    </div>
                    <div style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                      fontFamily: 'Orbitron, sans-serif',
                      background: `${color}15`, border: `1px solid ${color}40`, color,
                    }}>
                      {s.score}/{s.total}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {total === 0 && (
          <div className="glass" style={{ padding: '48px', textAlign: 'center', background: 'var(--bg-panel)', borderRadius: '12px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎯</div>
            <p className="font-syne" style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>No quizzes yet</p>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', fontFamily: 'Outfit, sans-serif' }}>
              Head to the Quiz tab and test yourself on any topic!
            </p>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
