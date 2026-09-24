'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/app/components/Header';

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

  return (
    <>
      <Header user={user} showNav={false} />

      <div className="container" style={{ paddingTop: '30px' }}>
        {/* HERO */}
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            background: 'linear-gradient(135deg, #0d5c3f 0%, #1a7a55 100%)',
            color: 'white',
            border: 'none',
          }}
        >
          <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-1px' }}>
            Interest-Free Community Fund
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '600px', margin: '0 auto 30px', fontSize: '16px', lineHeight: 1.5 }}>
            A transparent, Shariah-compliant platform for community mutual support.
            Contribute ₹500/month. Build a collective fund. Support members in need.
          </p>
          <a href={user ? '/dashboard' : '/login'} className="btn btn-gold" style={{ padding: '14px 32px', fontSize: '16px' }}>
            {user ? 'Go to Dashboard →' : 'Login / Register →'}
          </a>
        </div>

        {/* LIVE STATS 
        <div className="grid grid-3" style={{ marginTop: '30px' }}>
          <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>👥</div>
            <div className="stat-label">Active Members</div>
            <div className="stat-value">{summary?.total_active_members || 0}</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>💰</div>
            <div className="stat-label">Total Fund</div>
            <div className="stat-value">₹{Number(summary?.current_fund_balance || 0).toLocaleString('en-IN')}</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>📊</div>
            <div className="stat-label">Loans Outstanding</div>
            <div className="stat-value">₹{Number(summary?.total_outstanding || 0).toLocaleString('en-IN')}</div>
          </div>
        </div>*/}

        {/* HOW IT WORKS */}
        <div className="card" style={{ marginTop: '30px' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '20px', fontSize: '22px' }}>How It Works</h2>
          <div className="grid grid-2">
            <div style={{ padding: '16px', background: 'var(--primary-soft)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--primary)' }}>1. Monthly Contribution</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
                Every member contributes ₹500 on the 1st–10th of each month.
              </p>
            </div>
            <div style={{ padding: '16px', background: 'var(--gold-soft)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '8px', color: '#8a6d0f' }}>2. Collective Fund</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
                All contributions form a shared reserve — 10% always retained for safety.
              </p>
            </div>
            <div style={{ padding: '16px', background: 'var(--primary-soft)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--primary)' }}>3. Interest-Free Loans</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
                After 1 year, members in need can request interest-free loans.
              </p>
            </div>
            <div style={{ padding: '16px', background: 'var(--gold-soft)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '8px', color: '#8a6d0f' }}>4. EMI Repayment</h3>
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