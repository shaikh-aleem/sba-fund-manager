'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/app/components/BottomNav';
import StatCard from '@/app/components/StatCard';
import TransactionItem from '@/app/components/TransactionItem';

export default function AdminHome() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [pending, setPending] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
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
    const [sumRes, pendRes, contribRes, loanRes] = await Promise.all([
      supabase.from('fund_summary').select('*').single(),
      supabase.from('members').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('contributions').select('*, members(full_name, member_code)').order('created_at', { ascending: false }).limit(4),
      supabase.from('loans').select('*, members(full_name, member_code)').order('created_at', { ascending: false }).limit(3),
    ]);

    setSummary(sumRes.data);
    setPending(pendRes.data || []);

    // Merge contributions + loans into recent transactions
    const contribTxns = (contribRes.data || []).map(c => ({
      id: `c-${c.id}`,
      type: 'in',
      icon: '↓',
      title: 'Member Contribution',
      subtitle: `${c.members?.member_code || ''} - ${c.members?.full_name || 'Member'}`,
      amount: `+ ₹${Number(c.amount).toLocaleString('en-IN')}`,
      date: new Date(c.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      rawDate: new Date(c.created_at),
    }));

    const loanTxns = (loanRes.data || []).map(l => ({
      id: `l-${l.id}`,
      type: 'out',
      icon: '↑',
      title: 'Loan Disbursement',
      subtitle: `${l.members?.member_code || ''} - ${l.members?.full_name || 'Member'}`,
      amount: `- ₹${Number(l.amount).toLocaleString('en-IN')}`,
      date: new Date(l.given_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      rawDate: new Date(l.created_at),
    }));

    const allTxns = [...contribTxns, ...loanTxns]
      .sort((a, b) => b.rawDate - a.rawDate)
      .slice(0, 6);

    setRecentTxns(allTxns);
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

  const isSuper = user.role === 'super_admin';
  const totalFund = Number(summary?.current_fund_balance || 0);
  const reserve = Math.round(totalFund * 0.1);
  const available = totalFund - reserve;

  return (
    <>
      <header className="header">
        <div className="logo">
          <div className="logo-icon">SBA</div>
          <div className="logo-text">
            <div className="logo-title">SBA Fund</div>
            <div className="logo-subtitle">Admin Panel</div>
          </div>
        </div>
        <div className="nav-links">
          <a href="/dashboard">My Dashboard</a>
          <a href="/admin/members">Members</a>
          <a href="/admin/collect">Collect</a>
          <a href="/admin/loans">Loans</a>
          <a href="/change-password">Password</a>
          <a onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</a>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '20px' }}>
        {/* WELCOME */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '2px' }}>
            Welcome back
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.5px' }}>
            {user.full_name}
          </h1>
          <div style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px' }}>
            <span className="badge badge-gold">
              {isSuper ? '★ Super Admin' : 'Admin'}
            </span>
          </div>
        </div>

        {/* HERO — TOTAL FUND */}
        <div
          style={{
            background: 'var(--primary-gradient)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            color: 'white',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>💰</span>
                <div style={{ fontSize: '12px', opacity: 0.85, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Total Community Fund
                </div>
              </div>
              <div style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.1 }}>
                ₹{totalFund.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '6px' }}>
                Contributions from all members
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '32px', marginBottom: '4px' }}>👥</div>
              <div style={{ fontSize: '20px', fontWeight: 800 }}>
                {summary?.total_active_members || 0}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>Members</div>
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-4" style={{ marginBottom: '20px' }}>
          <StatCard
            label="Reserve (10%)"
            value={`₹${reserve.toLocaleString('en-IN')}`}
            sub="For member safety"
            icon="🛡️"
            variant="gold"
            compact
          />
          <StatCard
            label="Available Fund"
            value={`₹${available.toLocaleString('en-IN')}`}
            sub="For loans"
            icon="💵"
            compact
          />
          <StatCard
            label="Active Loans"
            value={summary?.total_outstanding ? Math.ceil(Number(summary.total_outstanding) / 5000) : 0}
            sub={`₹${Number(summary?.total_outstanding || 0).toLocaleString('en-IN')}`}
            icon="📊"
            variant="danger"
            compact
          />
          <StatCard
            label="Pending"
            value={summary?.pending_registrations || 0}
            sub="Approvals"
            icon="⏳"
            variant={pending.length > 0 ? 'danger' : 'success'}
            compact
          />
        </div>

        {/* COLLECTION WINDOW BANNER */}
        <div
          style={{
            background: 'var(--gold-soft)',
            border: '1px solid var(--gold)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontSize: '28px' }}>📅</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#8a6d0f', marginBottom: '2px' }}>
              Next Collection Window
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-dark)' }}>
              1st – 10th of every month
            </div>
          </div>
          <a
            href="/admin/collect"
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px', minHeight: 'auto' }}
          >
            Collect →
          </a>
        </div>

        {/* QUICK ACTIONS */}
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '12px' }}>
          Quick Actions
        </h3>
        <div className="grid grid-4" style={{ marginBottom: '24px' }}>
          <a href="/admin/collect" className="quick-action">
            <div className="icon">💰</div>
            <div>Collect</div>
          </a>
          <a href="/admin/loans" className="quick-action">
            <div className="icon">💵</div>
            <div>Give Loan</div>
          </a>
          <a href="/admin/members" className="quick-action">
            <div className="icon">👥</div>
            <div>Members</div>
          </a>
          <a href="/dashboard" className="quick-action">
            <div className="icon">📊</div>
            <div>Reports</div>
          </a>
        </div>

        {/* PENDING APPROVALS */}
        {pending.length > 0 && (
          <div className="card" style={{ marginBottom: '16px', borderLeft: '4px solid var(--warning)' }}>
            <div className="flex-between mb-md">
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--warning)' }}>
                ⏳ Pending Approvals ({pending.length})
              </h3>
            </div>
            {pending.map(p => (
              <div
                key={p.id}
                className="txn-row"
                style={{ flexWrap: 'wrap' }}
              >
                <div className="txn-icon gold">👤</div>
                <div className="txn-info">
                  <div className="txn-title">{p.full_name}</div>
                  <div className="txn-sub">
                    📱 {p.mobile} • Applied {new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: '12px', minHeight: 'auto' }}
                    onClick={() => approveMember(p.id)}
                  >
                    ✓ Approve
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px', minHeight: 'auto', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                    onClick={() => rejectMember(p.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RECENT TRANSACTIONS */}
        <div className="card">
          <div className="flex-between mb-md">
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>
              Recent Transactions
            </h3>
            <a href="/admin/members" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              View All →
            </a>
          </div>

          {recentTxns.length === 0 ? (
            <p style={{ color: 'var(--text-light)', fontSize: '14px', padding: '20px 0', textAlign: 'center' }}>
              No transactions yet. Start by collecting contributions.
            </p>
          ) : (
            <div>
              {recentTxns.map(t => (
                <TransactionItem
                  key={t.id}
                  type={t.type}
                  icon={t.icon}
                  title={t.title}
                  subtitle={t.subtitle}
                  amount={t.amount}
                  date={t.date}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <BottomNav role={user.role} />
    </>
  );
}