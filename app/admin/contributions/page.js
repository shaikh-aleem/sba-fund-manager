'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/app/components/BottomNav';
import Header from '@/app/components/Header';

export default function ContributionsHistory() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [deleting, setDeleting] = useState(null);
  const [reason, setReason] = useState('');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sba_user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'admin' && u.role !== 'super_admin') { router.push('/dashboard'); return; }
    setUser(u);
    loadContributions();
  }, []);

  const loadContributions = async () => {
    const { data } = await supabase
      .from('contributions')
      .select('*, members(full_name, member_code, mobile)')
      .order('created_at', { ascending: false });
    setContributions(data || []);
    setLoading(false);
  };

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 5000);
  };

  const isSuperAdmin = user?.role === 'super_admin';

  const openDelete = (c) => {
    if (!isSuperAdmin) {
      return showMsg('error', 'Only Super Admin can delete contributions.');
    }
    setDeleting(c);
    setReason('');
    setConfirming(false);
  };

  const confirmDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    if (!reason.trim()) {
      return showMsg('error', 'Please enter a reason');
    }

    const { error } = await supabase
      .from('contributions')
      .delete()
      .eq('id', deleting.id);

    if (error) {
      showMsg('error', 'Failed: ' + error.message);
      setDeleting(null);
      return;
    }

    showMsg('success', `🗑️ Deleted ₹${deleting.amount} contribution from ${deleting.members?.full_name || 'member'}`);
    setDeleting(null);
    setReason('');
    setConfirming(false);
    loadContributions();
  };

  const filtered = contributions.filter(c => {
    const s = search.toLowerCase();
    return (
      c.members?.full_name?.toLowerCase().includes(s) ||
      c.members?.member_code?.toLowerCase().includes(s) ||
      c.members?.mobile?.includes(s) ||
      c.receipt_no?.toLowerCase().includes(s) ||
      c.month?.includes(s)
    );
  });

  const totalAmount = filtered.reduce((sum, c) => sum + Number(c.amount || 0), 0);

  if (loading) return <div className="center">Loading...</div>;
  if (!user) return null;

  return (
    <>
      <Header user={user} showNav={true} />

      <div className="container" style={{ paddingTop: '20px' }}>
        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        {/* HEADER */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.5px' }}>
            📜 Contribution History
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px' }}>
            All contributions recorded in the system
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-2" style={{ marginBottom: '20px' }}>
          <div className="stat-card primary">
            <div className="stat-label">Total Contributions</div>
            <div className="stat-value">{contributions.length}</div>
          </div>
          <div className="stat-card gold">
            <div className="stat-label">Total Amount</div>
            <div className="stat-value">₹{contributions.reduce((s, c) => s + Number(c.amount || 0), 0).toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
          <input
            className="input"
            placeholder="🔍 Search by member, receipt, month, or mobile..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <p style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-light)' }}>
              Showing {filtered.length} results • Total: ₹{totalAmount.toLocaleString('en-IN')}
            </p>
          )}
        </div>

        {/* LIST */}
        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <p style={{ color: 'var(--text-light)' }}>
              {search ? 'No contributions match your search.' : 'No contributions yet.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(c => (
              <div key={c.id} className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="badge badge-success">✓ Paid</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: 500 }}>
                        {c.month}
                      </span>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '2px' }}>
                      {c.members?.full_name || 'Unknown Member'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                      {c.members?.member_code} • 📱 {c.members?.mobile}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '6px' }}>
                      {c.receipt_no} • {new Date(c.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {c.payment_mode && ` • ${c.payment_mode}`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px' }}>
                      ₹{Number(c.amount).toLocaleString('en-IN')}
                    </div>
                    {isSuperAdmin && (
                      <button
                        onClick={() => openDelete(c)}
                        className="btn btn-secondary"
                        style={{
                          marginTop: '8px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          minHeight: 'auto',
                          color: 'var(--danger)',
                          borderColor: 'var(--danger)',
                        }}
                      >
                        🗑 Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleting && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1000,
          backdropFilter: 'blur(4px)',
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', margin: 0 }}>
            <h3 style={{ color: 'var(--danger)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ Delete Contribution
            </h3>

            <div
              style={{
                background: 'var(--danger-soft)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '18px',
              }}
            >
              <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                <strong>Member:</strong> {deleting.members?.full_name}
              </div>
              <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                <strong>Amount:</strong> ₹{Number(deleting.amount).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                <strong>Month:</strong> {deleting.month}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                Receipt: {deleting.receipt_no}
              </div>
            </div>

            <div className="form-group">
              <label className="label">Reason for deletion *</label>
              <input
                className="input"
                type="text"
                placeholder="e.g., Wrong entry, Refund given, Member left"
                value={reason}
                onChange={e => setReason(e.target.value)}
                autoFocus
              />
            </div>

            {confirming && (
              <div className="alert alert-error" style={{ marginTop: '16px', fontSize: '13px' }}>
                ⚠️ This will <strong>permanently delete</strong> the contribution and reduce Total Fund by ₹{Number(deleting.amount).toLocaleString('en-IN')}. This cannot be undone.
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => { setDeleting(null); setReason(''); setConfirming(false); }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{
                  flex: 1,
                  background: 'var(--danger)',
                  backgroundImage: 'none',
                }}
                onClick={confirmDelete}
                disabled={!reason.trim()}
              >
                {confirming ? 'Yes, Delete Permanently' : 'Continue →'}
              </button>
            </div>

            {!reason.trim() && (
              <p style={{ fontSize: '12px', color: 'var(--text-light)', textAlign: 'center', marginTop: '10px' }}>
                Enter a reason to continue
              </p>
            )}
          </div>
        </div>
      )}

      <BottomNav role={user.role} />
    </>
  );
}