'use client';

export default function Header({ user, showNav = false, logo = '/logo-white.png' }) {
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const handleLogout = () => {
    localStorage.removeItem('sba_user');
    window.location.href = '/';
  };

  const navLinks = isAdmin
    ? [
        { href: '/admin', label: 'Admin' },
        { href: '/admin/members', label: 'Members' },
        { href: '/admin/collect', label: 'Collect' },
        { href: '/admin/loans', label: 'Loans' },
        { href: '/admin/contributions', label: 'History' },
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/change-password', label: 'Password' },
      ]
    : [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/change-password', label: 'Password' },
      ];

  return (
    <header className="app-header">
      <a href={isAdmin ? '/admin' : '/dashboard'} className="app-header-logo">
        <img src={logo} alt="Sharia Brotherhood Aurangabad" />
      </a>

      {showNav && (
        <nav className="app-header-nav">
          {navLinks.map(link => (
            <a key={link.href} href={link.href} className="app-header-link">
              {link.label}
            </a>
          ))}
          <a onClick={handleLogout} className="app-header-link" style={{ cursor: 'pointer' }}>
            Logout
          </a>
        </nav>
      )}

      {user && (
  <button
    onClick={handleLogout}
    className="app-header-logout-mobile"
    aria-label="Logout"
    title="Logout"
  >
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  </button>
)}
    </header>
  );
}