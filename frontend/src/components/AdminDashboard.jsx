import React, { useEffect, useState } from 'react';
import {
  Users, Mail, Phone, Calendar, FileText, Briefcase,
  ShieldCheck, LogOut, ChevronDown, ChevronUp, Search,
  BookOpen, Award
} from 'lucide-react';

export default function AdminDashboard({ token, onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || 'Failed to fetch users');
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const filtered = data
    ? data.users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <div style={styles.centeredBox}>
        <div style={styles.spinner} />
        <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontWeight: 600 }}>
          Loading admin panel…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centeredBox}>
        <p style={{ color: '#f87171' }}>Access Denied: {error}</p>
        <button className="btn-secondary" onClick={onLogout} style={{ marginTop: '16px' }}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={styles.iconBox}>
            <ShieldCheck size={26} color="#a5b4fc" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Admin Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
              Manage all registered users and their placement data
            </p>
          </div>
        </div>
        <button
          className="btn-secondary"
          onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <StatCard
          icon={<Users size={20} color="#818cf8" />}
          label="Total Users"
          value={data.total_users}
          color="rgba(99,102,241,0.15)"
        />
        <StatCard
          icon={<FileText size={20} color="#34d399" />}
          label="Resumes Uploaded"
          value={filtered.reduce((s, u) => s + (u.resume_count || 0), 0)}
          color="rgba(52,211,153,0.1)"
        />
        <StatCard
          icon={<Briefcase size={20} color="#f59e0b" />}
          label="Users with Resumes"
          value={filtered.filter((u) => u.resume_count > 0).length}
          color="rgba(245,158,11,0.1)"
        />
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search
          size={18}
          color="var(--text-dim)"
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={{ paddingLeft: '42px', width: '100%' }}
        />
      </div>

      {/* User Cards */}
      {filtered.length === 0 ? (
        <div style={{ ...styles.centeredBox, minHeight: '180px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No users found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map((user) => (
            <div key={user.id} className="glass-card" style={{ padding: '20px 24px', borderRadius: '16px' }}>
              {/* Row top */}
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => toggleExpand(user.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ ...styles.avatar, background: avatarColor(user.name) }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ color: '#f3f4f6', fontWeight: 700, margin: 0, fontSize: '1rem' }}>
                      {user.name}
                    </p>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} /> {user.email}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={badgeStyle(user.resume_count > 0 ? 'green' : 'gray')}>
                    {user.resume_count} Resume{user.resume_count !== 1 ? 's' : ''}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {formatDate(user.registered_at)}
                  </span>
                  {expanded[user.id] ? (
                    <ChevronUp size={18} color="var(--text-muted)" />
                  ) : (
                    <ChevronDown size={18} color="var(--text-muted)" />
                  )}
                </div>
              </div>

              {/* Expanded Detail */}
              {expanded[user.id] && (
                <div style={{ marginTop: '18px', paddingTop: '18px', borderTop: '1px solid var(--border-color)' }}>
                  {user.parsed_info ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <InfoRow icon={<Phone size={14} />} label="Phone" value={user.parsed_info.phone || '—'} />
                      <InfoRow icon={<Mail size={14} />} label="Resume Email" value={user.parsed_info.email || '—'} />
                      <InfoRow icon={<FileText size={14} />} label="Latest Resume" value={user.latest_resume || '—'} />
                      <InfoRow icon={<Calendar size={14} />} label="Uploaded On" value={formatDate(user.resume_uploaded_at)} />

                      {user.parsed_info.skills?.length > 0 && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <p style={styles.sectionLabel}><Award size={13} style={{ marginRight: '4px' }} /> Skills</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                            {user.parsed_info.skills.map((s, i) => (
                              <span key={i} style={styles.skillTag}>{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {user.parsed_info.education?.length > 0 && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <p style={styles.sectionLabel}><BookOpen size={13} style={{ marginRight: '4px' }} /> Education</p>
                          <ul style={{ margin: '6px 0 0', padding: '0 0 0 18px', color: 'var(--text-muted)', fontSize: '0.83rem' }}>
                            {user.parsed_info.education.map((e, i) => (
                              <li key={i}>{typeof e === 'object' ? JSON.stringify(e) : e}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {user.resume_count > 0 ? 'Resume uploaded but not parsed yet.' : 'No resume uploaded yet.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({ icon, label, value, color }) {
  return (
    <div className="glass-card" style={{ padding: '18px 20px', borderRadius: '14px', background: color }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        {icon}
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>{label}</span>
      </div>
      <p style={{ color: '#f3f4f6', fontSize: '2rem', fontWeight: 800, margin: 0 }}>{value}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
      <span style={{ color: 'var(--text-dim)', marginTop: '2px' }}>{icon}</span>
      <div>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>{label}</p>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#e2e8f0' }}>{value}</p>
      </div>
    </div>
  );
}

/* ── Helpers ── */

function formatDate(dateStr) {
  if (!dateStr || dateStr === 'None') return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

function avatarColor(name) {
  const colors = [
    'linear-gradient(135deg,#6366f1,#818cf8)',
    'linear-gradient(135deg,#06b6d4,#22d3ee)',
    'linear-gradient(135deg,#10b981,#34d399)',
    'linear-gradient(135deg,#f59e0b,#fbbf24)',
    'linear-gradient(135deg,#ef4444,#f87171)',
    'linear-gradient(135deg,#8b5cf6,#a78bfa)',
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

function badgeStyle(type) {
  const map = {
    green: { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' },
    gray:  { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-dim)' },
  };
  return {
    ...map[type],
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 600,
  };
}

/* ── Inline styles ── */
const styles = {
  centeredBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  iconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(6,182,212,0.2))',
    border: '1px solid rgba(99,102,241,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 800,
    fontSize: '1.1rem',
    flexShrink: 0,
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid rgba(99,102,241,0.2)',
    borderTop: '3px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  sectionLabel: {
    margin: 0,
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--text-dim)',
    display: 'flex',
    alignItems: 'center',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  skillTag: {
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.3)',
    color: '#a5b4fc',
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '0.78rem',
    fontWeight: 600,
  },
};
