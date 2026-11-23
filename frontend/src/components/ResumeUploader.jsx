import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Cpu, Loader2 } from 'lucide-react';

export default function ResumeUploader({ token, currentResume, onResumeUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a valid PDF file (.pdf)');
        return;
      }
      setFile(selected);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF resume file first.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Resume upload failed');
      }

      setSuccessMsg('Step 3-6 Completed: PDF Parsed & Structured Data Saved!');
      onResumeUploaded(data);
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
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
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <FileText size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Step 3 - 6: Candidate Resume</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PDF Parsing & NLP Information Extraction</p>
          </div>
        </div>
        {currentResume && (
          <span className="badge badge-success">
            <CheckCircle2 size={14} /> Resume Loaded
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

      {/* Upload Zone */}
      <div style={{
        border: '2px dashed var(--border-color)',
        borderRadius: '14px',
        padding: '24px',
        textAlign: 'center',
        background: 'rgba(15, 23, 42, 0.5)',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }} onClick={() => document.getElementById('resumeFileInput').click()}>
        <input
          id="resumeFileInput"
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <UploadCloud size={38} color="var(--primary)" style={{ marginBottom: '8px' }} />
        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f3f4f6', marginBottom: '4px' }}>
          {file ? file.name : 'Click to Browse or Drag Resume PDF'}
        </p>
        <p style={{ fontSize: '0.775rem', color: 'var(--text-dim)' }}>Supports official candidate PDF format</p>
      </div>

      {file && (
        <button
          onClick={handleUpload}
          className="btn-primary"
          style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Parsing & Extracting Text...</span>
            </>
          ) : (
            <>
              <Cpu size={18} />
              <span>Upload & Parse Resume</span>
            </>
          )}
        </button>
      )}

      {/* Current Active Resume Details Card */}
      {currentResume && (
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
            Extracted Structured Profile:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>Name</span>
              <strong style={{ color: '#fff' }}>{currentResume.parsed_info?.name || 'Candidate'}</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>Extracted Skills</span>
              <strong style={{ color: 'var(--accent-cyan)' }}>{currentResume.parsed_info?.skills?.length || 0} Skills Detected</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
