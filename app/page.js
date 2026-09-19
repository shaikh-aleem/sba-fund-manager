'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('sba_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    const { data } = await supabase.from('fund_summary').select('*').single();
    setSummary(data);
  };

  const handleLogout = () => {
    localStorage.removeItem('sba_user');
    setUser(null);
  };

  return (
    <>
      <header className="header">
        <div className="logo">
          <div className="logo-icon">SBA</div>
          <h1>SBA Fund Manager</h1>
        </div>
        <div className="nav-links">
          {user ? (
            <>
              <a href="/dashboard">Dashboard</a>
              {(user.role === 'admin' || user.role === 'super_admin') && (
                <a href="/admin">Admin</a>
              )}
              <a onClick={handleLogout} style={{ cursor: 'pointer' }}>
                Logout
              </a>
            </>
          ) : (
            <a href="/login">Login / Register</a>
          )}
        </div>
      </header>

      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <h1 style={{ fontSize: '36px', color: 'var(--primary)', marginBottom: '12px' }}>
            Interest-Free Community Fund
          </h1>
          <p style={{ color: 'var(--text-light)', maxWidth: '600px', margin: '0 auto 30px' }}>
            A transparent, Shariah-compliant platform for community mutual support.
            Contribute ₹500/month. Build a collective fund. Support members in need.
          </p>
          <a href={user ? '/dashboard' : '/login'} className="btn btn-primary">
            {user ? 'Go to Dashboard' : 'Login / Register'}
          </a>
        </div>

        <div className="grid grid-3" style={{ marginTop: '30px' }}>
          <div className="stat-card">
            <div className="stat-label">Active Members</div>
            <div className="stat-value">{summary?.total_active_members || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Fund</div>
            <div className="stat-value">
              ₹{Number(summary?.current_fund_balance || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Loans Outstanding</div>
            <div className="stat-value">
              ₹{Number(summary?.total_outstanding || 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: '30px' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '16px' }}>How It Works</h2>
          <div className="grid grid-2">
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>1. Monthly Contribution</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
                Every member contributes ₹500 on the 1st–10th of each month.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>2. Collective Fund</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
                All contributions form a shared reserve — 10% always retained.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>3. Interest-Free Loans</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
                After 1 year, members in need can request interest-free loans.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>4. EMI Repayment</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
                Flexible EMI schedule — no interest, only principal return.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}