'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/app/components/BottomNav';
import Header from '@/app/components/Header';

export default function LoansPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('give');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const [loanForm, setLoanForm] = useState({
    member_id: '', amount: '', purpose: '', emi_amount: '', total_emis: '',
  });

  const [emiForm, setEmiForm] = useState({ loan_id: '', amount: '' });

  useEffect(() => {
    const stored = localStorage.getItem('sba_user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'admin' && u.role !== 'super_admin') { router.push('/dashboard'); return; }
    setUser(u);
    loadData();
  }, []);

  const loadData = async () => {
    const [memRes, loanRes, sumRes] = await Promise.all([
      supabase.from('members').select('id, full_name, member_code').eq('status', 'active').order('member_code'),
      supabase.from('loans').select('*, members(full_name, member_code)').order('given_date', { ascending: false }),
      supabase.from('fund_summary').select('*').single(),
    ]);
    setMembers(memRes.data || []);
    setLoans(loanRes.data || []);
    setSummary(sumRes.data);
    setLoading(false);
  };

  const handleGiveLoan = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ type: '', text: '' });

    const fund = Number(summary?.current_fund_balance || 0);
    const amount = Number(loanForm.amount);
    const maxAllowed = fund * 0.9;

    if (amount > maxAllowed) {
      setMsg({ type: 'error', text: `❌ Max loan allowed: ₹${maxAllowed.toLocaleString('en-IN')} (must keep 10% reserve)` });
      setSubmitting(false);
      return;
    }

    const loan_code = `LOAN-${Date.now()}`;

    const { error } = await supabase.from('loans').insert({
      loan_code,
      member_id: loanForm.member_id,
      amount,
      purpose: loanForm.purpose,
      emi_amount: Number(loanForm.emi_amount),
      total_emis: Number(loanForm.total_emis),
      outstanding: amount,
      given_by: user.id,
      status: 'active',
    });

    if (error) {
      setMsg({ type: 'error', text: 'Failed: ' + error.message });
    } else {
      setMsg({ type: 'success', text: `✅ Loan ${loan_code} given successfully` });
      setLoanForm({ member_id: '', amount: '', purpose: '', emi_amount: '', total_emis: '' });
      loadData();
    }
    setSubmitting(false);
  };

  const handleReceiveEmi = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ type: '', text: '' });

    const loan = loans.find(l => l.id === emiForm.loan_id);
    if (!loan) { setSubmitting(false); return; }

    const amount = Number(emiForm.amount);
    const receipt_no = `EMI-${Date.now()}`;
    const emi_number = loan.paid_emis + 1;

    const { error: emiErr } = await supabase.from('emi_payments').insert({
      loan_id: loan.id,
      member_id: loan.member_id,
      emi_number,
      amount,
      receipt_no,
      received_by: user.id,
    });

    if (emiErr) {
      setMsg({ type: 'error', text: 'Failed: ' + emiErr.message });
      setSubmitting(false);
      return;
    }

    const newOutstanding = Math.max(0, Number(loan.outstanding) - amount);
    const newPaid = loan.paid_emis + 1;
    const newStatus = newOutstanding <= 0 ? 'completed' : 'active';

    await supabase.from('loans').update({
      outstanding: newOutstanding,
      paid_emis: newPaid,
      status: newStatus,
    }).eq('id', loan.id);

    setMsg({ type: 'success', text: `✅ EMI #${emi_number} received • ₹${amount.toLocaleString('en-IN')}` });
    setEmiForm({ loan_id: '', amount: '' });
    loadData();
    setSubmitting(false);
  };

  if (loading) return <div className="center">Loading...</div>;
  if (!user) return null;

  const activeLoans = loans.filter(l => l.status === 'active');
  const maxLoan = Number(summary?.current_fund_balance || 0) * 0.9;

  return (
    <>
      <Header user={user} showNav={true} />

      <div className="container" style={{ paddingTop: '20px', maxWidth: '900px' }}>
        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        <div className="card" style={{ background: 'linear-gradient(135deg, #0d5c3f, #1a7a55)', color: 'white' }}>
          <div className="stat-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Maximum Loan Allowed (keeping 10% reserve)</div>
          <div className="stat-value" style={{ color: 'white' }}>₹{maxLoan.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '6px' }}>
            Current Fund: ₹{Number(summary?.current_fund_balance || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="tabs" style={{ maxWidth: '400px', marginBottom: '20px' }}>
          <button className={`tab ${tab === 'give' ? 'active' : ''}`} onClick={() => setTab('give')}>
            Give Loan
          </button>
          <button className={`tab ${tab === 'emi' ? 'active' : ''}`} onClick={() => setTab('emi')}>
            Receive EMI
          </button>
        </div>

        {tab === 'give' && (
          <div className="card">
            <h3 style={{ color: 'var(--primary)', marginBottom: '20px' }}>💵 New Loan</h3>
            <form onSubmit={handleGiveLoan}>
              <div className="form-group">
                <label className="label">Member *</label>
                <select className="input" value={loanForm.member_id}
                  onChange={e => setLoanForm({ ...loanForm, member_id: e.target.value })} required>
                  <option value="">-- Select Member --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.member_code} — {m.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Loan Amount (₹) * (Max ₹{maxLoan.toLocaleString('en-IN')})</label>
                <input className="input" type="number" min="1" max={maxLoan}
                  value={loanForm.amount}
                  onChange={e => setLoanForm({ ...loanForm, amount: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="label">Purpose</label>
                <input className="input" type="text" placeholder="Reason for loan"
                  value={loanForm.purpose}
                  onChange={e => setLoanForm({ ...loanForm, purpose: e.target.value })} />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="label">EMI Amount (₹) *</label>
                  <input className="input" type="number" min="1"
                    value={loanForm.emi_amount}
                    onChange={e => setLoanForm({ ...loanForm, emi_amount: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="label">Number of EMIs *</label>
                  <input className="input" type="number" min="1"
                    value={loanForm.total_emis}
                    onChange={e => setLoanForm({ ...loanForm, total_emis: e.target.value })} required />
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Processing...' : 'Give Loan'}
              </button>
            </form>
          </div>
        )}

        {tab === 'emi' && (
          <div className="card">
            <h3 style={{ color: 'var(--primary)', marginBottom: '20px' }}>📥 Receive EMI</h3>
            {activeLoans.length === 0 ? (
              <p style={{ color: 'var(--text-light)' }}>No active loans to collect EMI from.</p>
            ) : (
              <form onSubmit={handleReceiveEmi}>
                <div className="form-group">
                  <label className="label">Active Loan *</label>
                  <select className="input" value={emiForm.loan_id}
                    onChange={e => {
                      const l = loans.find(x => x.id === e.target.value);
                      setEmiForm({ loan_id: e.target.value, amount: l?.emi_amount || '' });
                    }} required>
                    <option value="">-- Select Loan --</option>
                    {activeLoans.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.members?.full_name} — ₹{Number(l.outstanding).toLocaleString('en-IN')} left • EMI #{l.paid_emis + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">EMI Amount Received (₹) *</label>
                  <input className="input" type="number" min="1"
                    value={emiForm.amount}
                    onChange={e => setEmiForm({ ...emiForm, amount: e.target.value })} required />
                </div>

                <button className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                  {submitting ? 'Recording...' : 'Record EMI Payment'}
                </button>
              </form>
            )}
          </div>
        )}

        <div className="card">
          <h3 style={{ color: 'var(--primary)', marginBottom: '16px' }}>All Loans</h3>
          {loans.length === 0 ? (
            <p style={{ color: 'var(--text-light)' }}>No loans yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr><th>Code</th><th>Member</th><th>Amount</th><th>Outstanding</th><th>EMI</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {loans.map(l => (
                    <tr key={l.id}>
                      <td>{l.loan_code}</td>
                      <td>{l.members?.full_name}<br /><small style={{ color: 'var(--text-light)' }}>{l.members?.member_code}</small></td>
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
          )}
        </div>
      </div>

      <BottomNav role={user.role} />
    </>
  );
}