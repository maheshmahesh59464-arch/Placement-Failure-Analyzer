import React, { useEffect, useState } from 'react';
import { History, Calendar, FileText, CheckCircle, XCircle, ArrowUpRight, Loader2 } from 'lucide-react';

export default function AnalysisHistory({ token }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to fetch history');
      setHistory(data.history || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
      <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <History size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Step 15: Analysis History & Progress Tracker</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Review past resume-to-role compatibility reports and track changes over time</p>
            </div>
          </div>
          <span className="badge badge-info" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            {history.length} Analysis Runs Logged
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Loader2 size={32} className="animate-spin" color="var(--primary)" />
            <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading analysis history from database...</p>
          </div>
        ) : error ? (
          <div style={{ color: '#f87171', padding: '16px' }}>{error}</div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>No prior analysis history found.</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Upload a resume and job description to run your first evaluation.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {history.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setSelectedReport(selectedReport?.id === item.id ? null : item)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                      {item.jd_title}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileText size={14} /> {item.resume_filename}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} /> {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>COMPATIBILITY</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: item.ats_score >= 70 ? '#34d399' : '#fbbf24' }}>
                      {item.ats_score}%
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>LEGACY SIGNAL INDEX</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: item.readiness_score >= 70 ? '#38bdf8' : '#f87171' }}>
                      {item.readiness_score}%
                    </div>
                  </div>

                  <span className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                    {selectedReport?.id === item.id ? 'Hide Details' : 'View Full Summary'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Report Inspector */}
      {selectedReport && (
        <div className="glass-card" style={{ padding: '24px', border: '1px solid var(--primary)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
            Historical Report Details #{selectedReport.id} - {selectedReport.jd_title}
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>{selectedReport.summary}</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '14px', borderRadius: '10px' }}>
              <strong style={{ color: '#34d399', fontSize: '0.85rem' }}>Matched Skills:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {selectedReport.matched_skills.map((s, i) => (
                  <span key={i} className="badge badge-success">{s}</span>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '14px', borderRadius: '10px' }}>
              <strong style={{ color: '#f87171', fontSize: '0.85rem' }}>Missing Skills:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {selectedReport.missing_skills.map((s, i) => (
                  <span key={i} className="badge badge-danger">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
