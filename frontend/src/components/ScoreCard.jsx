import React from 'react';

export default function ScoreCard({ title, score, subtitle, color, stepLabel }) {
  const normalizedScore = Math.max(0, Math.min(100, score || 0));
  const strokeDashoffset = 283 - (283 * normalizedScore) / 100;

  return (
    <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Background radial glow */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: color,
        filter: 'blur(50px)',
        opacity: 0.2,
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <span className="badge badge-info" style={{ fontSize: '0.75rem', marginBottom: '6px' }}>
            {stepLabel}
          </span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{title}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{subtitle}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px 0' }}>
        <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="130" height="130" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="8"
            />
            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
            />
          </svg>
          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
              {Math.round(normalizedScore)}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>%</span>
          </div>
        </div>
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '10px 14px',
        textAlign: 'center',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: normalizedScore >= 80 ? '#34d399' : normalizedScore >= 60 ? '#fbbf24' : '#f87171'
      }}>
        {normalizedScore >= 80 ? 'Excellent Match Tier' : normalizedScore >= 60 ? 'Moderate Preparation Tier' : 'Needs Actionable Upskilling'}
      </div>
    </div>
  );
}
