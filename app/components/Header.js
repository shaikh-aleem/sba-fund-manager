'use client';

import Link from 'next/link';

export default function Header({
  title = 'SBA Fund',
  subtitle = 'Sharia Brotherhood Aurangabad',
  user,
  showNav = false,
  currentPath = '',
}) {
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const navLinks = isAdmin
    ? [
        { href: '/admin', label: 'Admin' },
        { href: '/admin/members', label: 'Members' },
        { href: '/admin/collect', label: 'Collect' },
        { href: '/admin/loans', label: 'Loans' },
        { href: '/dashboard', label: 'My Dashboard' },
        { href: '/change-password', label: 'Password' },
      ]
    : [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/change-password', label: 'Password' },
      ];

  const handleLogout = () => {
    localStorage.removeItem('sba_user');
    window.location.href = '/';
  };

  return (
    <header className="header">
      {/* LOGO */}
      <Link href={isAdmin ? '/admin' : '/dashboard'} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="logo">
          {/* Full logo on desktop */}
          <img
            src="/logo-full.png"
            alt="SBA"
            className="logo-img-full"
            style={{ height: '40px', width: 'auto', display: 'block' }}
          />
          {/* Icon only on mobile */}
          <img
            src="/logo-icon.png"
            alt="SBA"
            className="logo-img-icon"
            style={{ height: '36px', width: '36px', display: 'none' }}
          />
        </div>
      </Link>

      {/* NAV LINKS (desktop only) */}
      {showNav && (
        <div className="nav-links">
          {navLinks.map(link => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
          <a onClick={handleLogout} style={{ cursor: 'pointer' }}>
            Logout
          </a>
        </div>
      )}

      {/* CSS to switch logo based on screen size */}
      <style jsx>{`
        @media (max-width: 768px) {
          .logo-img-full { display: none !important; }
          .logo-img-icon { display: block !important; }
        }
      `}</style>
    </header>
  );
}