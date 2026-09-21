'use client';

import Link from 'next/link';

export default function Header({
  user,
  showNav = false,
}) {
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
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/change-password', label: 'Password' },
      ]
    : [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/change-password', label: 'Password' },
      ];

  return (
    <header className="app-header">
      {/* LOGO */}
      <Link
        href={isAdmin ? '/admin' : '/dashboard'}
        className="app-header-logo"
      >
        {/* Full logo on desktop */}
        <img
          src="/logo-full.png"
          alt="Sharia Brotherhood Aurangabad"
          className="app-logo-full"
        />
        {/* Icon-only on mobile */}
        <img
          src="/logo-icon.png"
          alt="SBA"
          className="app-logo-icon"
        />
      </Link>

      {/* NAV LINKS (desktop only) */}
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
    </header>
  );
}