'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function BottomNav({ role = 'member' }) {
  const pathname = usePathname();
  const isAdmin = role === 'admin' || role === 'super_admin';

  // Different tabs for admins vs members
  const tabs = isAdmin
    ? [
        { href: '/admin', icon: '🏠', label: 'Home' },
        { href: '/admin/collect', icon: '💰', label: 'Collect' },
        { href: '/admin/members', icon: '👥', label: 'Members' },
        { href: '/admin/loans', icon: '📊', label: 'Loans' },
        { href: '/dashboard', icon: '👤', label: 'Profile' },
      ]
    : [
        { href: '/dashboard', icon: '🏠', label: 'Home' },
        { href: '/dashboard#contributions', icon: '📋', label: 'History' },
        { href: '/change-password', icon: '🔑', label: 'Profile' },
      ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        // Determine if active
        const isActive =
          pathname === tab.href ||
          (tab.href !== '/dashboard' && tab.href !== '/admin' && pathname.startsWith(tab.href)) ||
          (tab.href === '/dashboard' && pathname === '/dashboard') ||
          (tab.href === '/admin' && pathname === '/admin');

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}