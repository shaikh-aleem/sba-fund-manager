'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function MembersList() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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

  const filtered = members.filter(m =>
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.mobile?.includes(search) ||
    m.member_code?.toLowerCase().includes(search.toLowerCase())
  );

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
        <div className="card">
          <input
            className="input"
            placeholder="🔍 Search by name, mobile, or member code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: '20px' }}
          />

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
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
                    <td>{m.joining_date ? new Date(m.joining_date).toLocaleDateString('en-IN') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-light)' }}>
            Total: {filtered.length} members
          </p>
        </div>
      </div>
    </>
  );
}