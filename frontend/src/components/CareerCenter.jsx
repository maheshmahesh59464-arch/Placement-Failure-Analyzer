import React, { useEffect, useState } from 'react';
import { Briefcase, BookOpen, MessageSquare, Plus, RefreshCw, Trash2 } from 'lucide-react';

const API = '/api/career';
const headers = (token, json = false) => ({ Authorization: `Bearer ${token}`, ...(json ? { 'Content-Type': 'application/json' } : {}) });

export default function CareerCenter({ token }) {
  const [apps, setApps] = useState([]);
  const [roadmap, setRoadmap] = useState([]);
  const [progress, setProgress] = useState(null);
  const [overview, setOverview] = useState(null);
  const [goals, setGoals] = useState([]);
  const [goalSkill, setGoalSkill] = useState('');
  const [goalText, setGoalText] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [applicationNotes, setApplicationNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [interview, setInterview] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  async function load() {
    setError('');
    try {
      const [a, r, p, o, g] = await Promise.all([
        fetch(`${API}/applications`, { headers: headers(token) }),
        fetch(`${API}/roadmap`, { headers: headers(token) }),
        fetch(`${API}/progress`, { headers: headers(token) }),
        fetch(`${API}/analytics/overview`, { headers: headers(token) }),
        fetch(`${API}/goals`, { headers: headers(token) })
      ]);
      for (const response of [a, r, p, o, g]) if (!response.ok) throw new Error('Unable to load career workspace.');
      const [ad, rd, pd, od, gd] = await Promise.all([a.json(), r.json(), p.json(), o.json(), g.json()]);
      setApps(ad.applications || []); setRoadmap(rd.roadmap || []); setProgress(pd); setOverview(od); setGoals(gd.goals || []);
    } catch (e) { setError(e.message); }
  }
  useEffect(() => { load(); }, [token]);

  async function addApplication(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch(`${API}/applications`, { method: 'POST', headers: headers(token, true), body: JSON.stringify({ company, role_title: role, notes: applicationNotes || null }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.detail || 'Could not add application.');
      setCompany(''); setRole(''); setApplicationNotes(''); await load();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function updateStatus(id, status) {
    const response = await fetch(`${API}/applications/${id}`, { method: 'PATCH', headers: headers(token, true), body: JSON.stringify({ status }) });
    if (!response.ok) { setError('Could not update application status.'); return; } await load();
  }
  async function removeApplication(id) {
    const response = await fetch(`${API}/applications/${id}`, { method: 'DELETE', headers: headers(token) });
    if (!response.ok) { setError('Could not delete application.'); return; } await load();
  }
  async function startInterview() {
    setFeedback(null); setAnswer('');
    const response = await fetch(`${API}/interviews/start`, { method: 'POST', headers: headers(token, true), body: JSON.stringify({ role_title: role || 'Software Developer', topic: 'technical' }) });
    const data = await response.json(); if (response.ok) setInterview(data); else setError(data.detail || 'Could not start practice.');
  }
  async function submitAnswer() {
    if (!interview) return;
    const response = await fetch(`${API}/interviews/${interview.session_id}/answer`, { method: 'POST', headers: headers(token, true), body: JSON.stringify({ answer }) });
    const data = await response.json(); if (response.ok) setFeedback(data.feedback); else setError(data.detail || 'Could not evaluate answer.');
  }
  async function addGoal(e) {
    e.preventDefault();
    const response = await fetch(`${API}/goals`, { method: 'POST', headers: headers(token, true), body: JSON.stringify({ skill: goalSkill, goal: goalText }) });
    const data = await response.json(); if (!response.ok) { setError(data.detail || 'Could not create goal.'); return; }
    setGoalSkill(''); setGoalText(''); await load();
  }
  async function setGoalStatus(id, status) {
    const response = await fetch(`${API}/goals/${id}`, { method: 'PATCH', headers: headers(token, true), body: JSON.stringify({ status }) });
    if (!response.ok) { setError('Could not update learning goal.'); return; } await load();
  }

  return <div style={{ maxWidth: 1200, margin: '28px auto', padding: '0 24px', display: 'grid', gap: 22 }}>
    <section className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div><h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800 }}>Career Intelligence Workspace</h2><p style={{ color: 'var(--text-muted)' }}>Track applications, skill development and interview practice.</p></div>
        <button className="btn-secondary" onClick={load}><RefreshCw size={16}/> Refresh</button>
      </div>
      {error && <p role="alert" style={{ color: '#f87171', marginTop: 12 }}>{error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginTop: 20 }}>
        {[['Applications', overview?.applications_total ?? 0], ['Interviews', overview?.interviews_total ?? 0], ['Offers', overview?.offers_total ?? 0], ['Skills detected', progress?.skills_count ?? 0], ['Projects detected', progress?.projects_count ?? 0]].map(([label, value]) => <div key={label} style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,.045)' }}><div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{label}</div><strong style={{ color: '#fff', fontSize: 25 }}>{value}</strong></div>)}
      </div>
      {progress?.latest_compatibility != null && <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>Latest resume-to-role compatibility: <strong style={{ color: '#fff' }}>{progress.latest_compatibility}%</strong>. This is not a hiring probability.</p>}
      {overview?.rejection_insights && <div style={{ marginTop: 18, padding: 16, borderRadius: 12, background: 'rgba(255,255,255,.035)' }}>
        <strong style={{ color: '#fff' }}>Rejection insights from your notes</strong>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(135px,1fr))', gap: 10, marginTop: 12 }}>
          {Object.entries(overview.rejection_insights.note_based_category_counts || {}).map(([category, count]) => <div key={category}><div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{category.replace('_', ' ')}</div><strong style={{ color: '#fff', fontSize: 20 }}>{count}</strong></div>)}
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 10 }}>{overview.rejection_insights.disclaimer}</p>
      </div>}
    </section>

    <section className="glass-card" style={{ padding: 24 }}>
      <h3 style={{ color: '#fff', fontSize: '1.15rem', display: 'flex', gap: 8, alignItems: 'center' }}><Briefcase size={19}/> Job Application Tracker</h3>
      <form onSubmit={addApplication} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 10, margin: '18px 0' }}>
        <input aria-label="Company" placeholder="Company name" value={company} onChange={e => setCompany(e.target.value)} required />
        <input aria-label="Role title" placeholder="Job title" value={role} onChange={e => setRole(e.target.value)} required />
        <button className="btn-primary" disabled={busy}><Plus size={16}/> Add application</button>
      </form>
      {apps.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No applications tracked yet.</p> : <div style={{ display: 'grid', gap: 10 }}>{apps.map(item => <div key={item.id} style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', padding: 12, background: 'rgba(255,255,255,.035)', borderRadius: 10 }}>
        <div><strong style={{ color: '#fff' }}>{item.role_title}</strong><div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{item.company}</div></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><select aria-label={`Status for ${item.company}`} value={item.status} onChange={e => updateStatus(item.id, e.target.value)}>{['saved','applied','assessment','interview','rejected','offered','withdrawn'].map(s => <option key={s} value={s}>{s}</option>)}</select><button className="btn-secondary" aria-label={`Delete ${item.company}`} onClick={() => removeApplication(item.id)}><Trash2 size={15}/></button></div>
      </div>)}</div>}
    </section>

    <section className="glass-card" style={{ padding: 24 }}>
      <h3 style={{ color: '#fff', fontSize: '1.15rem', display: 'flex', gap: 8, alignItems: 'center' }}><BookOpen size={19}/> Personalized Skill Roadmap</h3>
      {roadmap.length === 0 ? <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>Run a resume and job-description analysis to generate a skill-gap roadmap.</p> : <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>{roadmap.map((item, i) => <div key={`${item.skill}-${i}`} style={{ padding: 14, background: 'rgba(255,255,255,.035)', borderRadius: 10 }}><strong style={{ color: '#fff' }}>{item.skill}</strong><p style={{ color: 'var(--text-muted)', marginTop: 5 }}>{item.learning_goal}</p><p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Portfolio: {item.project_idea}</p></div>)}</div>}
    </section>

    <section className="glass-card" style={{ padding: 24 }}>
      <h3 style={{ color: '#fff', fontSize: '1.15rem' }}>Learning Goals</h3>
      <form onSubmit={addGoal} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 10, margin: '16px 0' }}>
        <input aria-label="Skill to learn" placeholder="Skill (e.g. Docker)" value={goalSkill} onChange={e => setGoalSkill(e.target.value)} required />
        <input aria-label="Learning goal" placeholder="What will you achieve?" value={goalText} onChange={e => setGoalText(e.target.value)} required />
        <button className="btn-primary"><Plus size={16}/> Add learning goal</button>
      </form>
      {goals.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Create goals to track your learning progress.</p> : <div style={{ display: 'grid', gap: 9 }}>{goals.map(goal => <div key={goal.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap', padding: 12, background: 'rgba(255,255,255,.035)', borderRadius: 9 }}><div><strong style={{ color: '#fff' }}>{goal.skill}</strong><p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{goal.goal}</p></div><select aria-label={`Progress for ${goal.skill}`} value={goal.status} onChange={e => setGoalStatus(goal.id, e.target.value)}>{['planned','in_progress','completed','paused'].map(status => <option key={status} value={status}>{status.replace('_',' ')}</option>)}</select></div>)}</div>}
    </section>

    <section className="glass-card" style={{ padding: 24 }}>
      <h3 style={{ color: '#fff', fontSize: '1.15rem', display: 'flex', gap: 8, alignItems: 'center' }}><MessageSquare size={19}/> Interview Practice</h3>
      <p style={{ color: 'var(--text-muted)', margin: '8px 0 14px' }}>Practice structured technical answers. Feedback checks for examples, reasoning and outcomes; it is not an objective interview score.</p>
      <button className="btn-primary" onClick={startInterview}>Generate practice question</button>
      {interview && <div style={{ marginTop: 16 }}><strong style={{ color: '#fff' }}>{interview.question}</strong><textarea aria-label="Your interview answer" rows={5} value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Write your answer with context, actions and results..." style={{ width: '100%', marginTop: 12 }} /><button className="btn-primary" onClick={submitAnswer} disabled={answer.trim().length < 5}>Review my answer</button></div>}
      {feedback && <div style={{ marginTop: 14, color: '#d1d5db' }}><strong>Feedback</strong><p>Answer length: {feedback.answer_length_words} words</p><ul>{feedback.suggestions.map(x => <li key={x}>{x}</li>)}</ul><p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{feedback.disclaimer}</p></div>}
    </section>
  </div>;
}
