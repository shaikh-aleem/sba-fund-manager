'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form
  const [loginMobile, setLoginMobile] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: loginMobile, password: loginPassword }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('sba_user', JSON.stringify(data.user));
      router.push(data.user.role === 'admin' || data.user.role === 'super_admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: regName,
          mobile: regMobile,
          email: regEmail,
          password: regPassword,
          address: regAddress,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setSuccess('Registration submitted! Please wait for admin approval. You will be notified once approved.');
      setRegName(''); setRegMobile(''); setRegEmail(''); setRegPassword(''); setRegAddress('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center">
      <div className="auth-box">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '60px', height: '60px', background: 'var(--primary)',
            borderRadius: '12px', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'var(--gold)', fontSize: '22px', fontWeight: '700'
          }}>SBA</div>
        </div>
        <h1>SBA Fund Manager</h1>
        <p className="subtitle">Interest-Free Community Fund</p>

        <div className="tabs">
          <button
            className={`tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
          >
            Login
          </button>
          <button
            className={`tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
          >
            Register
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="label">Mobile Number</label>
              <input
                className="input" type="tel" placeholder="10-digit mobile"
                value={loginMobile}
                onChange={(e) => setLoginMobile(e.target.value)}
                required maxLength="10"
              />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input
                className="input" type="password" placeholder="Your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="label">Full Name</label>
              <input
                className="input" type="text" placeholder="Your full name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Mobile Number</label>
              <input
                className="input" type="tel" placeholder="10-digit mobile"
                value={regMobile}
                onChange={(e) => setRegMobile(e.target.value)}
                required maxLength="10"
              />
            </div>
            <div className="form-group">
              <label className="label">Email (optional)</label>
              <input
                className="input" type="email" placeholder="you@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label">Address (optional)</label>
              <input
                className="input" type="text" placeholder="Your address"
                value={regAddress}
                onChange={(e) => setRegAddress(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input
                className="input" type="password" placeholder="Min 6 characters"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required minLength="6"
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Submitting...' : 'Register'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '14px', fontSize: '13px', color: 'var(--text-light)' }}>
              Registration requires admin approval.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}