import React from 'react';
import { ShieldCheck, User as UserIcon, LogOut, History, Cpu, Shield, Briefcase } from 'lucide-react';

export default function Navbar({ user, onLogout, activeTab, setActiveTab, isAdmin = false }) {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 40px',
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Brand Header */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: isAdmin ? 'default' : 'pointer' }}
        onClick={() => !isAdmin && setActiveTab('dashboard')}
      >
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: isAdmin
            ? 'linear-gradient(135deg, #7c3aed 0%, #6366F1 100%)'
            : 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isAdmin
            ? '0 0 15px rgba(124, 58, 237, 0.5)'
            : '0 0 15px rgba(99, 102, 241, 0.4)'
        }}>
          {isAdmin ? <Shield size={22} color="#ffffff" /> : <Cpu size={24} color="#ffffff" />}
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Placement Failure Analyzer
          </h1>
          <p style={{ fontSize: '0.75rem', color: isAdmin ? '#a78bfa' : 'var(--text-muted)', fontWeight: 500 }}>
            {isAdmin ? 'Admin Control Panel' : 'ATS Engine & Skill Gap AI Platform'}
          </p>
        </div>
      </div>

      {/* Navigation Links — hidden for admin */}
      {user && !isAdmin && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <button
            className={`btn-secondary ${activeTab === 'dashboard' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            style={{
              border: 'none',
              background: activeTab === 'dashboard' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'dashboard' ? '#fff' : 'var(--text-muted)'
            }}
          >
            Dashboard
          </button>
          <button
            className={`btn-secondary ${activeTab === 'history' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('history')}
            style={{
              border: 'none',
              background: activeTab === 'history' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'history' ? '#fff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <History size={16} />
            Analysis History
          </button>
          <button
            className={`btn-secondary ${activeTab === 'career' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('career')}
            style={{ border: 'none', background: activeTab === 'career' ? 'var(--primary)' : 'transparent', color: activeTab === 'career' ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Briefcase size={16} /> Career Center
          </button>
        </div>
      )}

      {/* User Controls */}
      <div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: isAdmin ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.05)',
              padding: '6px 14px',
              borderRadius: '20px',
              border: isAdmin ? '1px solid rgba(167,139,250,0.3)' : '1px solid var(--border-color)'
            }}>
              {isAdmin
                ? <Shield size={16} color="#a78bfa" />
                : <UserIcon size={16} color="var(--accent-cyan)" />
              }
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f3f4f6' }}>{user.name}</span>
              {isAdmin && (
                <span style={{ fontSize: '0.7rem', background: 'rgba(167,139,250,0.2)', color: '#c4b5fd', padding: '1px 7px', borderRadius: '10px', fontWeight: 700 }}>
                  ADMIN
                </span>
              )}
            </div>
            <button className="btn-secondary" onClick={onLogout} title="Logout" style={{ padding: '8px 12px' }}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="badge badge-info" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            <ShieldCheck size={16} />
            <span>Secure Authentication Active</span>
          </div>
        )}
      </div>
    </nav>
  );
}
