'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/app/components/BottomNav';
import Header from '@/app/components/Header';

export default function CollectPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    member_id: '',
    amount: 500,
    month: new Date().toISOString().slice(0, 7),
    payment_mode: 'cash',
    reference_no: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('sba_user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'admin' && u.role !== 'super_admin') { router.push('/dashboard'); return; }
    setUser(u);
    loadData();
  }, []);

  const loadData = async () => {
    const [memRes, recRes] = await Promise.all([
      supabase.from('members').select('id, full_name, member_code, mobile').eq('status', 'active').order('member_code'),
      supabase.from('contributions').select('*, members(full_name, member_code)').order('created_at', { ascending: false }).limit(10),
    ]);
    setMembers(memRes.data || []);
    setRecent(recRes.data || []);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ type: '', text: '' });

    const receipt_no = `RCPT-${Date.now()}`;

    const { error } = await supabase.from('contributions').insert({
      member_id: form.member_id,
      amount: Number(form.amount),
      month: form.month,
      payment_mode: form.payment_mode,
      reference_no: form.reference_no || null,
      receipt_no,
      collected_by: user.id,
      status: 'verified',
    });

    if (error) {
      setMsg({ type: 'error', text: 'Failed: ' + error.message });
    } else {
      setMsg({ type: 'success', text: `✅ Recorded ₹${form.amount} • Receipt: ${receipt_no}` });
      setForm({ ...form, member_id: '', reference_no: '' });
      loadData();
    }
    setSubmitting(false);
  };

  if (loading) return <div className="center">Loading...</div>;
  if (!user) return null;

  return (
    <>
      <Header user={user} showNav={true} />

      <div className="container" style={{ paddingTop: '20px', maxWidth: '800px' }}>
        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        <div className="card">
          <h3 style={{ color: 'var(--primary)', marginBottom: '20px' }}>💰 Record New Payment</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Member *</label>
              <select
                className="input"
                value={form.member_id}
                onChange={e => setForm({ ...form, member_id: e.target.value })}
                required
              >
                <option value="">-- Select Member --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.member_code} — {m.full_name} ({m.mobile})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="label">Amount (₹) *</label>
                <input
                  className="input" type="number" min="1"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Month *</label>
                <input
                  className="input" type="month"
                  value={form.month}
                  onChange={e => setForm({ ...form, month: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="label">Payment Mode</label>
                <select
                  className="input"
                  value={form.payment_mode}
                  onChange={e => setForm({ ...form, payment_mode: e.target.value })}
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Reference No (optional)</label>
                <input
                  className="input" type="text" placeholder="UPI/Bank ref"
                  value={form.reference_no}
                  onChange={e => setForm({ ...form, reference_no: e.target.value })}
                />
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={submitting}>
              {submitting ? 'Recording...' : 'Record Payment'}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--primary)', marginBottom: '16px' }}>Recent Collections</h3>
          {recent.length === 0 ? (
            <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>No collections yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr><th>Member</th><th>Month</th><th>Amount</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {recent.map(c => (
                    <tr key={c.id}>
                      <td>{c.members?.full_name}<br /><small style={{ color: 'var(--text-light)' }}>{c.members?.member_code}</small></td>
                      <td>{c.month}</td>
                      <td>₹{Number(c.amount).toLocaleString('en-IN')}</td>
                      <td>{new Date(c.payment_date).toLocaleDateString('en-IN')}</td>
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