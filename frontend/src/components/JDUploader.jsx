import React, { useState } from 'react';
import { Briefcase, CheckCircle2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

export default function JDUploader({ token, currentJD, onJDUploaded }) {
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAnalyzeJD = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) {
      setError('Please paste or type a Job Description text.');
      return;
    }

    setAnalyzing(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch('/api/jd/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title || undefined,
          raw_text: rawText
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Job Description analysis failed');
      }

      setSuccessMsg('Step 7 & 8 Completed: JD Requirements Analyzed!');
      onJDUploaded(data);
      setRawText('');
      setTitle('');
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(6, 182, 212, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-cyan)'
          }}>
            <Briefcase size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Step 7 - 8: Job Description (JD)</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Role Skill & Qualification Parser</p>
          </div>
        </div>
        {currentJD && (
          <span className="badge badge-info">
            <CheckCircle2 size={14} /> JD Analyzed
          </span>
        )}
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleAnalyzeJD} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <input
            type="text"
            placeholder="Target Job Title (e.g. Full Stack Developer / AI Engineer)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
            style={{ fontSize: '0.875rem' }}
          />
        </div>

        <div>
          <textarea
            placeholder="Paste Job Description text here (Required skills, responsibilities, experience criteria)..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className="form-input"
            rows={5}
            style={{ resize: 'vertical', fontSize: '0.85rem', fontFamily: 'inherit' }}
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}
          disabled={analyzing}
        >
          {analyzing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Analyzing JD Skill Requirements...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Analyze Job Description</span>
            </>
          )}
        </button>
      </form>

      {currentJD && (
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
            Extracted JD Target Requirements:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>Target Role</span>
              <strong style={{ color: '#fff' }}>{currentJD.title}</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>Required Tech Stack</span>
              <strong style={{ color: 'var(--accent-cyan)' }}>{currentJD.required_skills?.length || 0} Skills Required</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
