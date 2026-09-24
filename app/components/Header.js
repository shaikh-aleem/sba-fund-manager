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
        >
          ⏻
        </button>
      )}
    </header>
  );
}