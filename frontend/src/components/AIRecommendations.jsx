import React from 'react';
import { Lightbulb, BookOpen, Code2, Award, ArrowUpRight, Target } from 'lucide-react';

export default function AIRecommendations({ recommendations }) {
  if (!recommendations) return null;

  const {
    readiness_status,
    action_advice,
    key_focus_areas = [],
    recommended_courses = [],
    recommended_projects = [],
    recommended_certifications = []
  } = recommendations;

  return (
    <div className="glass-card" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--warning)'
          }}>
            <Lightbulb size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Career Improvement Recommendations</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Suggested actions based on detected job requirements and resume evidence</p>
          </div>
        </div>
      </div>

      {/* Action Advice Card */}
      <div style={{
        background: 'rgba(99, 102, 241, 0.08)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: '14px',
        padding: '18px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a5b4fc', fontWeight: 700, marginBottom: '6px' }}>
          <Target size={18} />
          <span>{readiness_status}</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#e0e7ff', lineHeight: 1.5 }}>
          {action_advice}
        </p>
      </div>

      {/* Recommended Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        
        {/* Recommended Courses */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '14px' }}>
            <BookOpen size={18} />
            <span>Recommended Courses</span>
          </div>
          {recommended_courses.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recommended_courses.map((item, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>{item.skill}</span>
                  <div style={{ fontSize: '0.85rem', color: '#f3f4f6', fontWeight: 600 }}>{item.title}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.825rem', color: 'var(--text-dim)' }}>No additional course prerequisites identified.</p>
          )}
        </div>

        {/* Portfolio Project Ideas */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '14px' }}>
            <Code2 size={18} />
            <span>Targeted Portfolio Projects</span>
          </div>
          {recommended_projects.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recommended_projects.map((item, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>{item.skill} Project</span>
                  <div style={{ fontSize: '0.85rem', color: '#f3f4f6', fontWeight: 600 }}>{item.title}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.825rem', color: 'var(--text-dim)' }}>Current portfolio project suite aligns well.</p>
          )}
        </div>

        {/* Certifications */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-purple)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '14px' }}>
            <Award size={18} />
            <span>Valuable Certifications</span>
          </div>
          {recommended_certifications.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recommended_certifications.map((item, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem', marginBottom: '4px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>{item.skill}</span>
                  <div style={{ fontSize: '0.85rem', color: '#f3f4f6', fontWeight: 600 }}>{item.title}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.825rem', color: 'var(--text-dim)' }}>Certifications optional for current readiness level.</p>
          )}
        </div>

      </div>
    </div>
  );
}
