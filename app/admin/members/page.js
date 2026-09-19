'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function MembersList() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Edit modal
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: '', mobile: '', email: '', address: '' });

  // Reset password modal
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
    const { data } = await supabase
      .from('members')
      .select('*')
      .order('member_code', { ascending: true });
    setMembers(data || []);
    setLoading(false);
  };

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 5000);
  };

  const deactivateMember = async (id, name) => {
    if (!confirm(`Deactivate ${name}? They won't be able to login.`)) return;
    const { error } = await supabase.from('members').update({ status: 'inactive' }).eq('id', id);
    if (error) return showMsg('error', 'Failed: ' + error.message);
    showMsg('success', `✅ ${name} deactivated`);
    loadMembers();
  };

  const reactivateMember = async (id, name) => {
    if (!confirm(`Reactivate ${name}?`)) return;
    const { error } = await supabase.from('members').update({ status: 'active' }).eq('id', id);
    if (error) return showMsg('error', 'Failed: ' + error.message);
    showMsg('success', `✅ ${name} reactivated`);
    loadMembers();
  };

  const deleteMember = async (id, name) => {
    if (user.role !== 'super_admin') {
      return showMsg('error', '❌ Only Super Admin can permanently delete members');
    }
    if (!confirm(`⚠️ PERMANENTLY DELETE ${name}?\n\nThis will remove ALL their contributions, loans, and EMI records.\n\nThis CANNOT be undone.`)) return;
    if (!confirm(`Are you absolutely sure? Last chance.`)) return;
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) return showMsg('error', 'Failed: ' + error.message);
    showMsg('success', `🗑️ ${name} permanently deleted`);
    loadMembers();
  };

  const openEdit = (m) => {
    setEditing(m);
    setEditForm({
      full_name: m.full_name || '',
      mobile: m.mobile || '',
      email: m.email || '',
      address: m.address || '',
    });
  };

  const saveEdit = async () => {
    if (!editForm.full_name || !editForm.mobile) {
      return showMsg('error', 'Name and mobile are required');
    }
    const { error } = await supabase
      .from('members')
      .update({
        full_name: editForm.full_name,
        mobile: editForm.mobile,
        email: editForm.email || null,
        address: editForm.address || null,
      })
      .eq('id', editing.id);
    if (error) return showMsg('error', 'Failed: ' + error.message);
    showMsg('success', `✅ ${editForm.full_name} updated`);
    setEditing(null);
    loadMembers();
  };

  // ---- RESET PASSWORD ----
  const openResetPassword = (m) => {
    setResetting(m);
    // Generate a random temp password like "sba@4821"
    const random = Math.floor(1000 + Math.random() * 9000);
    setNewPassword(`sba@${random}`);
  };

  const confirmResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      return showMsg('error', 'Password must be at least 6 characters');
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: resetting.id,
          new_password: newPassword,
          performed_by: user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');

      showMsg('success', `🔑 Password reset for ${resetting.full_name}. New password: ${newPassword}`);
      setResetting(null);
      setNewPassword('');
    } catch (err) {
      showMsg('error', 'Failed: ' + err.message);
    }
  };

  const filtered = members.filter(m => {
    const matchesSearch =
      m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.mobile?.includes(search) ||
      m.member_code?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || m.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className="center">Loading...</div>;
  if (!user) return null;

  return (
    <>
      <header className="header">
        <div className="logo">
          <div className="logo-icon">SBA</div>
          <h1>Members</h1>
        </div>
        <div className="nav-links">
          <a href="/admin">← Admin Home</a>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '24px' }}>
        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        <div className="card">
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <input
              className="input"
              placeholder="🔍 Search name, mobile, or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: '1 1 300px' }}
            />
            <select
              className="input"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ flex: '0 0 180px' }}
            >
              <option value="all">All Members</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

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
                {filtered.map(m => (
                  <tr key={m.id}>
                    <td><strong>{m.member_code}</strong></td>
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
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {m.status === 'pending' && (
                          <button
                            className="btn btn-primary"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                            onClick={() => reactivateMember(m.id, m.full_name)}
                          >
                            Approve
                          </button>
                        )}

                        {m.status === 'active' && m.role === 'member' && (
                          <>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '5px 10px', fontSize: '12px' }}
                              onClick={() => openEdit(m)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '5px 10px', fontSize: '12px', color: '#2563eb', borderColor: '#2563eb' }}
                              onClick={() => openResetPassword(m)}
                            >
                              🔑 Reset PW
                            </button>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '5px 10px', fontSize: '12px', color: 'var(--warning)', borderColor: 'var(--warning)' }}
                              onClick={() => deactivateMember(m.id, m.full_name)}
                            >
                              Deactivate
                            </button>
                          </>
                        )}

                        {(m.status === 'inactive' || m.status === 'rejected') && m.role === 'member' && (
                          <>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '5px 10px', fontSize: '12px', color: 'var(--success)', borderColor: 'var(--success)' }}
                              onClick={() => reactivateMember(m.id, m.full_name)}
                            >
                              Reactivate
                            </button>
                            {user.role === 'super_admin' && (
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '5px 10px', fontSize: '12px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                onClick={() => deleteMember(m.id, m.full_name)}
                              >
                                🗑️ Delete
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-light)' }}>
            Showing {filtered.length} of {members.length} members
          </p>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', zIndex: 1000,
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '20px' }}>
              Edit Member — {editing.member_code}
            </h3>
            <div className="form-group">
              <label className="label">Full Name</label>
              <input className="input" type="text"
                value={editForm.full_name}
                onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="label">Mobile</label>
              <input className="input" type="tel"
                value={editForm.mobile}
                onChange={e => setEditForm({ ...editForm, mobile: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="label">Email (optional)</label>
              <input className="input" type="email"
                value={editForm.email}
                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="label">Address (optional)</label>
              <input className="input" type="text"
                value={editForm.address}
                onChange={e => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveEdit}>
                Save Changes
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetting && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', zIndex: 1000,
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '8px' }}>
              🔑 Reset Password
            </h3>
            <p style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '20px' }}>
              For <strong>{resetting.full_name}</strong> ({resetting.member_code})
            </p>

            <div className="alert alert-info" style={{ fontSize: '13px' }}>
              💡 A temporary password has been generated below. Share it with the member via phone/WhatsApp. They should change it after first login.
            </div>

            <div className="form-group">
              <label className="label">New Password</label>
              <input
                className="input"
                type="text"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirmResetPassword}>
                Reset Password
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setResetting(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}