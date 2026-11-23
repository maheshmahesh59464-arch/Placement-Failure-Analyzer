import React from 'react';
import { CheckCircle, XCircle, Layers, ArrowRight } from 'lucide-react';

export default function SkillGapView({ matchedSkills = [], missingSkills = [] }) {
  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(168, 85, 247, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-purple)'
          }}>
            <Layers size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Step 9 & 10: Skill Gap Analysis</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Comparison of Candidate Skills vs Job Requirements</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Matched Skills List */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '14px',
          padding: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 700, fontSize: '0.95rem' }}>
              <CheckCircle size={18} />
              <span>Matched Skills</span>
            </div>
            <span className="badge badge-success">{matchedSkills.length} Verified</span>
          </div>

          {matchedSkills.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {matchedSkills.map((skill, index) => (
                <span key={index} className="badge badge-success" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  <CheckCircle size={14} />
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', italic: 'true' }}>
              No overlapping technical skills detected yet.
            </p>
          )}
        </div>

        {/* Missing Skills List */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '14px',
          padding: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: 700, fontSize: '0.95rem' }}>
              <XCircle size={18} />
              <span>Missing Required Skills</span>
            </div>
            <span className="badge badge-danger">{missingSkills.length} Gaps Found</span>
          </div>

          {missingSkills.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {missingSkills.map((skill, index) => (
                <span key={index} className="badge badge-danger" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  <XCircle size={14} />
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 600 }}>
              🎉 Perfect Skill Match! Resume contains all required skills.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
