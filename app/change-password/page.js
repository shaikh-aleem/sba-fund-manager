'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChangePassword() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const stored = localStorage.getItem('sba_user');
    if (!stored) { router.push('/login'); return; }
    setUser(JSON.parse(stored));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (newPw.length < 6) {
      return setMsg({ type: 'error', text: 'New password must be at least 6 characters' });
    }
    if (newPw !== confirmPw) {
      return setMsg({ type: 'error', text: 'New passwords do not match' });
    }
    if (newPw === current) {
      return setMsg({ type: 'error', text: 'New password must be different from current' });
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          current_password: current,
          new_password: newPw,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      setMsg({ type: 'success', text: '✅ Password changed successfully!' });
      setCurrent(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => {
        router.push(user.role === 'member' ? '/dashboard' : '/admin');
      }, 1500);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <header className="header">
        <div className="logo">
          <div className="logo-icon">SBA</div>
          <h1>Change Password</h1>
        </div>
        <div className="nav-links">
          <a href={user.role === 'member' ? '/dashboard' : '/admin'}>← Back</a>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '40px', maxWidth: '500px' }}>
        <div className="card">
          <h2 style={{ color: 'var(--primary)', marginBottom: '6px' }}>Change Your Password</h2>
          <p style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '24px' }}>
            Logged in as <strong>{user.full_name}</strong> ({user.member_code})
          </p>

          {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Current Password *</label>
              <input
                className="input" type="password"
                value={current} onChange={e => setCurrent(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="label">New Password * (min 6 chars)</label>
              <input
                className="input" type="password"
                value={newPw} onChange={e => setNewPw(e.target.value)}
                required minLength="6"
              />
            </div>
            <div className="form-group">
              <label className="label">Confirm New Password *</label>
              <input
                className="input" type="password"
                value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                required minLength="6"
              />
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}