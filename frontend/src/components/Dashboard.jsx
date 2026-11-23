import React, { useState, useEffect } from 'react';
import ResumeUploader from './ResumeUploader';
import JDUploader from './JDUploader';
import ScoreCard from './ScoreCard';
import SkillGapView from './SkillGapView';
import AIRecommendations from './AIRecommendations';
import { Play, Sparkles, AlertCircle, FileCheck, Layers, Award, Loader2 } from 'lucide-react';

export default function Dashboard({ token }) {
  const [currentResume, setCurrentResume] = useState(null);
  const [currentJD, setCurrentJD] = useState(null);
  const [analysisReport, setAnalysisReport] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLatestData();
  }, []);

  const fetchLatestData = async () => {
    try {
      // Fetch latest resume
      const res1 = await fetch('/api/resume/latest', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res1.ok) {
        const d1 = await res1.json();
        if (d1.resume) setCurrentResume(d1.resume);
      }

      // Fetch latest JD
      const res2 = await fetch('/api/jd/latest', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res2.ok) {
        const d2 = await res2.json();
        if (d2.jd) setCurrentJD(d2.jd);
      }

      // Fetch latest analysis
      const res3 = await fetch('/api/analysis/latest', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res3.ok) {
        const d3 = await res3.json();
        if (d3.report) setAnalysisReport(d3.report);
      }
    } catch (err) {
      console.error("Error loading dashboard state:", err);
    }
  };

  const handleRunAnalysis = async () => {
    if (!currentResume) {
      setError('Please upload a PDF Resume first (Step 3).');
      return;
    }
    if (!currentJD) {
      setError('Please upload or enter a Job Description first (Step 7).');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const response = await fetch('/api/analysis/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resume_id: currentResume.id,
          jd_id: currentJD.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Analysis execution failed');
      }

      setAnalysisReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '30px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Top Banner / Stepper Info */}
      <div className="glass-card" style={{ padding: '24px 30px', background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              Step 14: Interactive Placement Evaluation Dashboard
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Complete end-to-end ATS parsing, skill gap analysis, readiness scoring & AI course roadmap.
            </p>
          </div>

          <button
            className="btn-primary"
            onClick={handleRunAnalysis}
            disabled={analyzing}
            style={{
              padding: '14px 28px',
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
              boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)'
            }}
          >
            {analyzing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Running Full 15-Step Pipeline...</span>
              </>
            ) : (
              <>
                <Play size={20} />
                <span>Execute Complete Analysis</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '16px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Inputs Grid (Resume + JD Uploaders) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <ResumeUploader
          token={token}
          currentResume={currentResume}
          onResumeUploaded={(data) => {
            setCurrentResume({
              id: data.resume_id,
              filename: data.filename,
              parsed_info: data.parsed_info
            });
          }}
        />

        <JDUploader
          token={token}
          currentJD={currentJD}
          onJDUploaded={(data) => {
            setCurrentJD({
              id: data.jd_id,
              title: data.title,
              required_skills: data.required_skills
            });
          }}
        />
      </div>

      {/* Analysis Output Section */}
      {analysisReport && (
        <>
          {/* Scores Overview (Steps 11 & 12) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <ScoreCard
              title="Resume-to-Job Compatibility"
              score={analysisReport.ats_score}
              subtitle="Estimated compatibility based on extracted resume evidence"
              color="#06B6D4"
              stepLabel="Step 11 Engine"
            />

            <ScoreCard
              title="Legacy Resume Signal Index"
              score={analysisReport.readiness_score}
              subtitle={analysisReport.readiness_note || "Legacy resume-only proxy; not a practical ability assessment."}
              color="#6366F1"
              stepLabel="Step 12 Index"
            />
          </div>

          {analysisReport.score_breakdown && (
            <section className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 800 }}>Why this compatibility score?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '6px 0 16px' }}>Scoring version {analysisReport.scoring_version || '2.0'} · Matching method: {analysisReport.matching_method || 'rule-based'}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12 }}>
                {Object.entries(analysisReport.score_breakdown).filter(([key, value]) => key !== 'available_weight' && value !== null).map(([key, value]) => (
                  <div key={key} style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,.04)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{key.replaceAll('_', ' ')}</div>
                    <strong style={{ color: '#fff', fontSize: 20 }}>{Number(value).toFixed(1)}</strong>
                  </div>
                ))}
              </div>
              {analysisReport.limitations?.map(note => <p key={note} style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>• {note}</p>)}
            </section>
          )}
          {analysisReport.evidence?.length > 0 && (
            <section className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 800 }}>Requirement evidence</h3>
              <div style={{ display: 'grid', gap: 9, marginTop: 14 }}>
                {analysisReport.evidence.map((item, index) => <div key={`${item.requirement}-${index}`} style={{ padding: 12, borderRadius: 9, background: 'rgba(255,255,255,.035)' }}>
                  <strong style={{ color: '#fff' }}>{item.requirement}</strong>
                  <span style={{ color: item.status === 'matched' ? '#34d399' : '#fbbf24', marginLeft: 10, fontSize: 12 }}>{item.status.replace('_', ' ')}</span>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{item.evidence}</p>
                </div>)}
              </div>
            </section>
          )}

          {/* Skill Gap Analysis (Steps 9 & 10) */}
          <SkillGapView
            matchedSkills={analysisReport.matched_skills}
            missingSkills={analysisReport.missing_skills}
          />

          {/* AI Recommendations (Step 13) */}
          <AIRecommendations
            recommendations={analysisReport.recommendations}
          />
        </>
      )}

    </div>
  );
}
