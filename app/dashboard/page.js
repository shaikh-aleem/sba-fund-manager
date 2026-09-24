'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/app/components/BottomNav';
import StatCard from '@/app/components/StatCard';
import TransactionItem from '@/app/components/TransactionItem';
import Header from '@/app/components/Header';

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

  if (loading) return <div className="center">Loading...</div>;
  if (!user) return null;

  const totalPaid = myContributions.reduce((s, c) => s + Number(c.amount || 0), 0);
  const activeLoan = myLoans.find(l => l.status === 'active');
  const reserve = Math.round(totalPaid * 0.1);
  const isAdmin = user.role === 'admin' || user.role === 'super_admin';

  const recentContributions = myContributions.slice(0, 3);

  return (
    <>
      <Header user={user} showNav={true} />

      <div className="container" style={{ paddingTop: '20px' }}>
        {/* WELCOME */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '2px' }}>
            Assalamu Alaikum
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.5px' }}>
            {user.full_name}
          </h1>
          <div style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px' }}>
            <span className="badge badge-primary" style={{ marginRight: '6px' }}>{user.member_code}</span>
            {isAdmin && <span className="badge badge-gold">{user.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>}
          </div>
        </div>

        {/* HERO — MONTHLY CONTRIBUTION */}
        <div
          style={{
            background: 'var(--primary-gradient)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            color: 'white',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', position: 'relative', zIndex: 2 }}>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.8, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
                Monthly Contribution
              </div>
              <div style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.1 }}>
                ₹500
              </div>
              <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '4px' }}>
                Small contribution, big support
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '32px', marginBottom: '4px' }}>📅</div>
              <div style={{ fontSize: '12px', opacity: 0.85, fontWeight: 600 }}>
                1st – 10th
              </div>
              <div style={{ fontSize: '11px', opacity: 0.7 }}>
                Every month
              </div>
            </div>
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              fontSize: '13px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <span>Contact admin to pay your contribution</span>
            <span style={{ fontSize: '18px' }}>→</span>
          </div>
        </div>

        {/* YOUR STATS */}
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '12px' }}>
          Your Account
        </h3>
                <div className="grid grid-4" style={{ marginBottom: '24px' }}>
          <StatCard
            label="Total Paid"
            value={`₹${totalPaid.toLocaleString('en-IN')}`}
            sub="Since joining"
            variant="primary"
          />
          <StatCard
            label="Reserve (10%)"
            value={`₹${reserve.toLocaleString('en-IN')}`}
            sub="For member safety"
            variant="gold"
          />
          <StatCard
            label="My Loans"
            value={activeLoan ? `₹${Number(activeLoan.outstanding).toLocaleString('en-IN')}` : '₹0'}
            sub={activeLoan ? 'Outstanding' : 'No active loan'}
            variant={activeLoan ? 'danger' : 'success'}
          />
          <StatCard
            label="Months Paid"
            value={myContributions.length}
            sub="Total contributions"
            variant="success"
          />
        </div>

        {/* FUND OVERVIEW */}
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '12px' }}>
          Community Fund
        </h3>
                <div className="grid grid-3" style={{ marginBottom: '24px' }}>
          <StatCard
            label="Total Fund"
            value={`₹${Number(summary?.current_fund_balance || 0).toLocaleString('en-IN')}`}
            sub="Live balance"
          />
          <StatCard
            label="Active Members"
            value={summary?.total_active_members || 0}
            sub="Contributing now"
          />
          <StatCard
            label="Loans Out"
            value={`₹${Number(summary?.total_outstanding || 0).toLocaleString('en-IN')}`}
            sub="Being repaid"
          />
        </div>

        {/* QUICK ACTIONS */}
        import { HomeIcon, HistoryIcon, LoanIcon, ProfileIcon } from '@/app/components/Icons';
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '12px' }}>
          Quick Actions
        </h3>
               <div className="grid grid-4" style={{ marginBottom: '24px' }}>
          <a href="/dashboard#contributions" className="quick-action">
            <HistoryIcon size={28} className="quick-action-svg" />
            <div>History</div>
          </a>
          <a href="/dashboard#loans" className="quick-action">
            <LoanIcon size={28} className="quick-action-svg" />
            <div>My Loans</div>
          </a>
          <a href="/change-password" className="quick-action">
            <ProfileIcon size={28} className="quick-action-svg" />
            <div>Password</div>
          </a>
          {isAdmin && (
            <a href="/admin" className="quick-action">
              <HomeIcon size={28} className="quick-action-svg" />
              <div>Admin</div>
            </a>
          )}
        </div>

        {/* RECENT CONTRIBUTIONS */}
        <div className="card" id="contributions">
          <div className="flex-between mb-md">
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>
              Recent Contributions
            </h3>
            <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}>
              {myContributions.length} total
            </span>
          </div>

          {recentContributions.length === 0 ? (
            <p style={{ color: 'var(--text-light)', fontSize: '14px', padding: '20px 0', textAlign: 'center' }}>
              No contributions yet. Pay your first ₹500 to admin to get started.
            </p>
          ) : (
            <div>
              {recentContributions.map(c => (
                <TransactionItem
                  key={c.id}
                  type="in"
                  icon="✓"
                  title="Monthly Contribution"
                  subtitle={`${c.receipt_no || 'Receipt'} • ${c.month}`}
                  amount={`+ ₹${Number(c.amount).toLocaleString('en-IN')}`}
                  date={new Date(c.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                />
              ))}
            </div>
          )}
        </div>

        {/* LOANS */}
        {myLoans.length > 0 && (
          <div className="card" id="loans" style={{ marginTop: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '16px' }}>
              My Loans
            </h3>
            {myLoans.map(l => (
              <TransactionItem
                key={l.id}
                type={l.status === 'active' ? 'out' : 'gold'}
                icon={l.status === 'active' ? '💵' : '✓'}
                title={`Loan ${l.loan_code}`}
                subtitle={`${l.paid_emis}/${l.total_emis} EMIs paid`}
                amount={`₹${Number(l.outstanding).toLocaleString('en-IN')} left`}
                date={new Date(l.given_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav role={user.role} />
    </>
  );
}