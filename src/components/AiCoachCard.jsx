import React, { useEffect, useState } from 'react';
import { getRecommendations } from '../utils/api';

export function AiCoachCard() {
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPlan = async () => {
    setLoading(true);
    const data = await getRecommendations();
    if (data?.plan) setPlan(data.plan);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  return (
    <div style={{
      padding: '24px', 
      background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(6, 182, 212, 0.1))',
      borderRadius: '16px',
      border: '1px solid rgba(79, 70, 229, 0.2)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      marginBottom: '30px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.5rem' }}>🤖</span> AI Study Coach
        </h3>
        <button onClick={fetchPlan} disabled={loading} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '20px' }}>
          {loading ? 'Thinking...' : 'Refresh'}
        </button>
      </div>
      <div style={{ color: 'var(--text-main)', lineHeight: '1.6', fontSize: '1.1rem', minHeight: '60px' }}>
        {loading ? (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', height: '100%' }}>
            <span className="dot-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="dot-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="dot-bounce" style={{ animationDelay: '0.4s' }}></span>
          </div>
        ) : (
          <p style={{ margin: 0, animation: 'fadeIn 0.5s ease' }}>{plan}</p>
        )}
      </div>
      <style>{`
        .dot-bounce {
          width: 8px; height: 8px; background: #4F46E5; border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
