'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [myContributions, setMyContributions] = useState([]);
  const [myLoans, setMyLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('sba_user');
    if (!stored) {
      router.push('/login');
      return;
    }
    const u = JSON.parse(stored);
    setUser(u);
    loadData(u.id);
  }, []);

  const loadData = async (userId) => {
    const [sumRes, contribRes, loanRes] = await Promise.all([
      supabase.from('fund_summary').select('*').single(),
      supabase.from('contributions').select('*').eq('member_id', userId).order('payment_date', { ascending: false }),
      supabase.from('loans').select('*').eq('member_id', userId).order('given_date', { ascending: false }),
    ]);
    setSummary(sumRes.data);
    setMyContributions(contribRes.data || []);
    setMyLoans(loanRes.data || []);
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('sba_user');
    router.push('/');
  };

  if (loading) return <div className="center">Loading...</div>;
  if (!user) return null;

  const totalPaid = myContributions.reduce((s, c) => s + Number(c.amount || 0), 0);
  const activeLoan = myLoans.find(l => l.status === 'active');

  return (
    <>
      <header className="header">
        <div className="logo">
          <div className="logo-icon">SBA</div>
          <h1>Dashboard</h1>
        </div>
        <div className="nav-links">
          {(user.role === 'admin' || user.role === 'super_admin') && (
            <a href="/admin">Admin Panel</a>
          )}
          <a onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</a>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '24px' }}>
        <div className="card">
          <h2 style={{ color: 'var(--primary)', marginBottom: '4px' }}>
            Assalamu Alaikum, {user.full_name}
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
            Member Code: <strong>{user.member_code}</strong> • Mobile: {user.mobile}
          </p>
        </div>

        <h3 style={{ marginBottom: '12px', color: 'var(--primary)' }}>Your Account</h3>
        <div className="grid grid-3">
          <div className="stat-card">
            <div className="stat-label">Total Contributed</div>
            <div className="stat-value">₹{totalPaid.toLocaleString('en-IN')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Monthly Due</div>
            <div className="stat-value">₹500</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: activeLoan ? 'var(--warning)' : 'var(--success)' }}>
            <div className="stat-label">Loan Status</div>
            <div className="stat-value" style={{ fontSize: '18px' }}>
              {activeLoan ? `₹${Number(activeLoan.outstanding).toLocaleString('en-IN')} due` : 'No active loan'}
            </div>
          </div>
          <div className="nav-links">
  {(user.role === 'admin' || user.role === 'super_admin') && (
    <a href="/admin">Admin Panel</a>
  )}
  <a href="/change-password">Change Password</a>   {/* ← ADD */}
  <a onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</a>
</div>
        </div>

        <h3 style={{ margin: '24px 0 12px', color: 'var(--primary)' }}>Fund Overview</h3>
        <div className="grid grid-3">
          <div className="stat-card">
            <div className="stat-label">Total Fund</div>
            <div className="stat-value">₹{Number(summary?.current_fund_balance || 0).toLocaleString('en-IN')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Members</div>
            <div className="stat-value">{summary?.total_active_members || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Loans Outstanding</div>
            <div className="stat-value">₹{Number(summary?.total_outstanding || 0).toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="card" style={{ marginTop: '24px' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '16px' }}>My Contribution History</h3>
          {myContributions.length === 0 ? (
            <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>No contributions recorded yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Receipt</th>
                    <th>Month</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {myContributions.map(c => (
                    <tr key={c.id}>
                      <td>{c.receipt_no || '-'}</td>
                      <td>{c.month}</td>
                      <td>₹{Number(c.amount).toLocaleString('en-IN')}</td>
                      <td>{new Date(c.payment_date).toLocaleDateString('en-IN')}</td>
                      <td>{c.payment_mode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {myLoans.length > 0 && (
          <div className="card" style={{ marginTop: '24px' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '16px' }}>My Loans</h3>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Loan ID</th>
                    <th>Amount</th>
                    <th>Outstanding</th>
                    <th>EMI Paid</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myLoans.map(l => (
                    <tr key={l.id}>
                      <td>{l.loan_code}</td>
                      <td>₹{Number(l.amount).toLocaleString('en-IN')}</td>
                      <td>₹{Number(l.outstanding).toLocaleString('en-IN')}</td>
                      <td>{l.paid_emis}/{l.total_emis}</td>
                      <td>
                        <span className={`badge badge-${l.status === 'active' ? 'warning' : 'success'}`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}