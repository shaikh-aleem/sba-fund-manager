'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/app/components/BottomNav';

export default function MembersList() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: '', mobile: '', email: '', address: '' });

  const [resetting, setResetting] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('sba_user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'admin' && u.role !== 'super_admin') { router.push('/dashboard'); return; }
    setUser(u);
    loadMembers();
  }, []);

  const loadMembers = async () => {
    const { data } = await supabase.from('members').select('*').order('member_code');
    setMembers(data || []);
    setLoading(false);
  };

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 5000);
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const canManage = (target) => isSuperAdmin || target.role === 'member';

  const deactivateMember = async (id, name) => {
    if (!confirm(`Deactivate ${name}?`)) return;
    const { error } = await supabase.from('members').update({ status: 'inactive' }).eq('id', id);
    if (error) return showMsg('error', 'Failed: ' + error.message);
    showMsg('success', `✅ ${name} deactivated`);
    loadMembers();
  };

  const reactivateMember = async (id, name) => {
    if (!confirm(`Activate ${name}?`)) return;
    const { error } = await supabase.from('members').update({ status: 'active' }).eq('id', id);
    if (error) return showMsg('error', 'Failed: ' + error.message);
    showMsg('success', `✅ ${name} activated`);
    loadMembers();
  };

  const deleteMember = async (id, name) => {
    if (!isSuperAdmin) return showMsg('error', 'Only Super Admin can delete.');
    if (id === user.id) return showMsg('error', "You can't delete yourself.");
    if (!confirm(`⚠️ PERMANENTLY DELETE ${name}?\n\nThis removes ALL their data. Cannot be undone.`)) return;
    if (!confirm('Are you absolutely sure? Last chance.')) return;

    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) return showMsg('error', 'Failed: ' + error.message);
    showMsg('success', `🗑️ ${name} permanently deleted`);
    loadMembers();
  };

  const openEdit = (m) => {
    setEditing(m);
    setEditForm({ full_name: m.full_name || '', mobile: m.mobile || '', email: m.email || '', address: m.address || '' });
  };

  const saveEdit = async () => {
    if (!editForm.full_name || !editForm.mobile) return showMsg('error', 'Name and mobile required');
    const { error } = await supabase.from('members').update({
      full_name: editForm.full_name,
      mobile: editForm.mobile,
      email: editForm.email || null,
      address: editForm.address || null,
    }).eq('id', editing.id);
    if (error) return showMsg('error', 'Failed: ' + error.message);
    showMsg('success', `✅ ${editForm.full_name} updated`);
    setEditing(null);
    loadMembers();
  };

  const openResetPassword = (m) => {
    setResetting(m);
    setNewPassword(`sba@${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const confirmResetPassword = async () => {
    if (newPassword.length < 6) return showMsg('error', 'Password must be 6+ characters');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: resetting.id, new_password: newPassword, performed_by: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      showMsg('success', `🔑 Password reset for ${resetting.full_name}. New: ${newPassword}`);
      setResetting(null);
    } catch (err) {
      showMsg('error', 'Failed: ' + err.message);
    }
  };

  const filtered = members.filter(m => {
    const s = m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
              m.mobile?.includes(search) ||
              m.member_code?.toLowerCase().includes(search.toLowerCase());
    const f = filter === 'all' || m.status === filter;
    return s && f;
  });

  const statusCount = (status) => members.filter(m => m.status === status).length;

  if (loading) return <div className="center">Loading...</div>;
  if (!user) return null;

  // Action buttons component
  const ActionButtons = ({ m }) => {
    const isSelf = m.id === user.id;
    const manageable = canManage(m) && !isSelf;

    if (!manageable) {
      return <span style={{ fontSize: 12, color: '#999' }}>{isSelf ? '—' : '🔒 Locked'}</span>;
    }

    return (
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {m.status === 'pending' && (
          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px', minHeight: 'auto' }} onClick={() => reactivateMember(m.id, m.full_name)}>✓ Approve</button>
        )}
        {m.status === 'active' && (
          <>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', minHeight: 'auto' }} onClick={() => openEdit(m)}>✏️ Edit</button>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', minHeight: 'auto', color: '#2563eb', borderColor: '#2563eb' }} onClick={() => openResetPassword(m)}>🔑 Reset</button>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', minHeight: 'auto', color: 'var(--warning)', borderColor: 'var(--warning)' }} onClick={() => deactivateMember(m.id, m.full_name)}>⏸ Deactivate</button>
          </>
        )}
        {(m.status === 'inactive' || m.status === 'rejected') && (
          <>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', minHeight: 'auto', color: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => reactivateMember(m.id, m.full_name)}>▶ Activate</button>
            {isSuperAdmin && (
              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', minHeight: 'auto', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => deleteMember(m.id, m.full_name)}>🗑 Delete</button>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">SBA</div>
          <div className="logo-text">
            <div className="logo-title">Members</div>
            <div className="logo-subtitle">Manage community</div>
          </div>
        </div>
        <div className="nav-links">
          <a href="/change-password">🔑 Change My Password</a>
          <a href="/admin">← Admin Home</a>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '20px' }}>
        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        {/* SEARCH + FILTER */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <input
              className="input"
              placeholder="🔍 Search name, mobile, or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: '1 1 240px' }}
            />
            <select
              className="input"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ flex: '0 0 160px' }}
            >
              <option value="all">All ({members.length})</option>
              <option value="active">Active ({statusCount('active')})</option>
              <option value="pending">Pending ({statusCount('pending')})</option>
              <option value="inactive">Inactive ({statusCount('inactive')})</option>
              <option value="rejected">Rejected ({statusCount('rejected')})</option>
            </select>
          </div>

          {/* STATS PILLS */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span className="badge badge-primary">👥 {members.length} Total</span>
            <span className="badge badge-success">● {statusCount('active')} Active</span>
            {statusCount('pending') > 0 && (
              <span className="badge badge-warning">⏳ {statusCount('pending')} Pending</span>
            )}
            {statusCount('inactive') > 0 && (
              <span className="badge badge-danger">◼ {statusCount('inactive')} Inactive</span>
            )}
          </div>
        </div>

        {/* MEMBER LIST */}
        <div style={{ marginTop: '16px' }}>
          {filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
              <p style={{ color: 'var(--text-light)' }}>
                {search || filter !== 'all' ? 'No members match your search.' : 'No members yet.'}
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE (hidden on mobile) */}
              <div className="card desktop-only" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Mobile</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(m => {
                        const isSelf = m.id === user.id;
                        return (
                          <tr key={m.id}>
                            <td>
                              <strong>{m.member_code}</strong>
                              {isSelf && <span style={{ marginLeft: 6, fontSize: 11, color: '#888' }}>(you)</span>}
                            </td>
                            <td>{m.full_name}</td>
                            <td>{m.mobile}</td>
                            <td>
                              <span className={`badge ${m.role === 'super_admin' ? 'badge-danger' : m.role === 'admin' ? 'badge-warning' : 'badge-info'}`}>
                                {m.role}
                              </span>
                            </td>
                            <td>
                              <span className={`badge badge-${m.status === 'active' ? 'success' : m.status === 'pending' ? 'warning' : 'danger'}`}>
                                {m.status}
                              </span>
                            </td>
                            <td><ActionButtons m={m} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MOBILE CARDS (hidden on desktop) */}
              <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filtered.map(m => {
                  const isSelf = m.id === user.id;
                  const initials = m.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';
                  return (
                    <div key={m.id} className="card" style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'var(--primary-soft)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '16px',
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '2px' }}>
                            {m.full_name} {isSelf && <span style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>(you)</span>}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                            {m.member_code} • 📱 {m.mobile}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        <span className={`badge ${m.role === 'super_admin' ? 'badge-danger' : m.role === 'admin' ? 'badge-warning' : 'badge-info'}`}>
                          {m.role}
                        </span>
                        <span className={`badge badge-${m.status === 'active' ? 'success' : m.status === 'pending' ? 'warning' : 'danger'}`}>
                          {m.status}
                        </span>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                        <ActionButtons m={m} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-light)', textAlign: 'center' }}>
          Showing {filtered.length} of {members.length} members
        </p>
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', margin: 0 }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '20px' }}>
              ✏️ Edit Member
            </h3>
            <p style={{ color: 'var(--text-light)', fontSize: '13px', marginBottom: '16px' }}>
              {editing.member_code}
            </p>
            <div className="form-group"><label className="label">Full Name</label><input className="input" value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} /></div>
            <div className="form-group"><label className="label">Mobile</label><input className="input" value={editForm.mobile} onChange={e => setEditForm({ ...editForm, mobile: e.target.value })} /></div>
            <div className="form-group"><label className="label">Email</label><input className="input" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} /></div>
            <div className="form-group"><label className="label">Address</label><input className="input" value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} /></div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveEdit}>Save Changes</button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetting && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', margin: 0 }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '8px' }}>🔑 Reset Password</h3>
            <p style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '20px' }}>
              For <strong>{resetting.full_name}</strong> ({resetting.member_code})
            </p>
            <div className="alert alert-info" style={{ fontSize: '13px' }}>
              💡 Share this temporary password with the member. They should change it after login.
            </div>
            <div className="form-group">
              <label className="label">New Password</label>
              <input className="input" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirmResetPassword}>Reset Password</button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setResetting(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAV */}
      <BottomNav role={user.role} />
    </>
  );
}