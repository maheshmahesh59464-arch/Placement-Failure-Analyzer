import React, { useState } from 'react';
import { UserPlus, LogIn, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

export default function AuthModal({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Administrator credentials are verified only by the backend.
      // No privileged email/password is embedded in the browser bundle.
      if (!isRegister) {
        const adminRes = await fetch('/api/auth/admin-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        if (adminRes.ok) {
          const adminData = await adminRes.json();
          if (adminData.is_admin) {
            onLoginSuccess(adminData.user, adminData.access_token, true);
            return;
          }
        }
      }

      // ── Normal user flow ──
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      if (isRegister) {
        setSuccess('Registration Successful! Please log in with your credentials.');
        setIsRegister(false);
        setFormData({ name: '', email: formData.email, password: '' });
      } else {
        localStorage.setItem('token', data.access_token);
        onLoginSuccess(data.user, data.access_token, false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '440px',
      margin: '60px auto',
      padding: '36px',
      borderRadius: '24px'
    }} className="glass-card">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto'
        }}>
          {isRegister ? <UserPlus size={28} color="var(--primary)" /> : <LogIn size={28} color="var(--accent-cyan)" />}
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {isRegister
            ? 'Create your account to unlock placement analysis'
            : 'Sign in to access your resumes, JD matching & history'}
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          padding: '12px 16px',
          borderRadius: '10px',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          padding: '12px 16px',
          borderRadius: '10px',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px'
        }}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {isRegister && (
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                name="name"
                required={isRegister}
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
            Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="email"
              name="email"
              required
              placeholder="candidate@example.com"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              style={{ paddingLeft: '42px' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              style={{ paddingLeft: '42px' }}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: '10px', height: '46px' }}
          disabled={loading}
        >
          {loading ? 'Processing...' : isRegister ? 'Complete Registration' : 'Login to Account'}
        </button>
      </form>

      {/* Switcher */}
      <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {isRegister ? 'Already registered?' : "Don't have an account yet?"}{' '}
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegister ? 'Sign In Here' : 'Register Account'}
          </button>
        </p>
      </div>
    </div>
  );
}
