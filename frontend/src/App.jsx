import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import AnalysisHistory from './components/AnalysisHistory';
import AdminDashboard from './components/AdminDashboard';
import CareerCenter from './components/CareerCenter';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      // Restore the administrator session through a protected API, not hardcoded profile data.
      fetch('/api/auth/admin/me', { headers: { 'Authorization': `Bearer ${adminToken}` } })
        .then(async (response) => {
          if (!response.ok) throw new Error('Administrator session expired');
          const adminUser = await response.json();
          setUser(adminUser);
          setToken(adminToken);
          setIsAdmin(true);
        })
        .catch(() => { localStorage.removeItem('adminToken'); })
        .finally(() => setInitializing(false));
    } else if (token) {
      fetchUserProfile(token);
    } else {
      setInitializing(false);
    }
  }, []);

  const fetchUserProfile = async (jwtToken) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error('Auth check error:', err);
      handleLogout();
    } finally {
      setInitializing(false);
    }
  };

  const handleLoginSuccess = (userData, jwtToken, adminFlag = false) => {
    setUser(userData);
    setToken(jwtToken);
    setIsAdmin(adminFlag);
    if (adminFlag) {
      localStorage.setItem('adminToken', jwtToken);
    } else {
      localStorage.setItem('token', jwtToken);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    setIsAdmin(false);
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
  };

  if (initializing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-muted)' }}>
        <p style={{ fontWeight: 600 }}>Initializing Placement Failure Analyzer...</p>
      </div>
    );
  }

  // ── Admin view (hidden from regular users, no nav tabs shown) ──
  if (user && isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar
          user={user}
          onLogout={handleLogout}
          activeTab={null}
          setActiveTab={() => {}}
          isAdmin={true}
        />
        <main style={{ flex: 1, paddingBottom: '60px' }}>
          <AdminDashboard token={token} onLogout={handleLogout} />
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={false}
      />

      <main style={{ flex: 1, paddingBottom: '60px' }}>
        {!user ? (
          <AuthModal onLoginSuccess={handleLoginSuccess} />
        ) : activeTab === 'dashboard' ? (
          <Dashboard token={token} />
        ) : activeTab === 'career' ? (
          <CareerCenter token={token} />
        ) : (
          <AnalysisHistory token={token} />
        )}
      </main>
    </div>
  );
}
