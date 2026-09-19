'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminHome() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('sba_user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'admin' && u.role !== 'super_admin') { router.push('/dashboard'); return; }
    setUser(u);
    loadData();
  }, []);

  const loadData = async () => {
    const [sumRes, pendRes] = await Promise.all([
      supabase.from('fund_summary').select('*').single(),
      supabase.from('members').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
    ]);
    setSummary(sumRes.data);
    setPending(pendRes.data || []);
    setLoading(false);
  };

  const approveMember = async (id) => {
    if (!confirm('Approve this member?')) return;
    await supabase.from('members').update({ status: 'active' }).eq('id', id);
    loadData();
  };

  const rejectMember = async (id) => {
    if (!confirm('Reject this registration?')) return;
    await supabase.from('members').update({ status: 'rejected' }).eq('id', id);
    loadData();
  };

  const handleLogout = () => {
    localStorage.removeItem('sba_user');
    router.push('/');
  };

  if (loading) return <div className="center">Loading...</div>;
  if (!user) return null;

  return (
    <>
      <header className="header">
        <div className="logo">
          <div className="logo-icon">SBA</div>
          <h1>Admin Panel</h1>
        </div>
        <div className="nav-links">
          <a href="/dashboard">My Dashboard</a>
          <a href="/admin/members">Members</a>
          <a href="/admin/collect">Collect</a>
          <a href="/admin/loans">Loans</a>
          <a onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</a>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '24px' }}>
        <div className="card">
          <h2 style={{ color: 'var(--primary)', marginBottom: '4px' }}>
            Welcome, {user.full_name}
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
            Role: <strong>{user.role === 'super_admin' ? 'Super Admin' : 'Admin'}</strong>
          </p>
        </div>

        <div className="grid grid-3">
          <div className="stat-card">
            <div className="stat-label">Active Members</div>
            <div className="stat-value">{summary?.total_active_members || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Collected</div>
            <div className="stat-value">₹{Number(summary?.total_collected || 0).toLocaleString('en-IN')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Current Fund</div>
            <div className="stat-value">₹{Number(summary?.current_fund_balance || 0).toLocaleString('en-IN')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Loans Given</div>
            <div className="stat-value">₹{Number(summary?.total_loans_given || 0).toLocaleString('en-IN')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">EMI Received</div>
            <div className="stat-value">₹{Number(summary?.total_emi_received || 0).toLocaleString('en-IN')}</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: 'var(--warning)' }}>
            <div className="stat-label">Pending Registrations</div>
            <div className="stat-value">{summary?.pending_registrations || 0}</div>
          </div>
        </div>

        {pending.length > 0 && (
          <div className="card" style={{ marginTop: '24px' }}>
            <h3 style={{ color: 'var(--warning)', marginBottom: '16px' }}>
              ⏳ Pending Member Approvals ({pending.length})
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Applied</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.full_name}</strong></td>
                      <td>{p.mobile}</td>
                      <td>{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                      <td>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '6px 14px', fontSize: '13px', marginRight: '6px' }}
                          onClick={() => approveMember(p.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '13px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                          onClick={() => rejectMember(p.id)}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="card" style={{ marginTop: '24px' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '16px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href="/admin/collect" className="btn btn-primary">💰 Collect Contribution</a>
            <a href="/admin/loans" className="btn btn-primary">💵 Give Loan</a>
            <a href="/admin/members" className="btn btn-secondary">👥 Manage Members</a>
          </div>
        </div>
      </div>
    </>
  );
}