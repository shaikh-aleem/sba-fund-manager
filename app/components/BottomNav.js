'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { HomeIcon, MembersIcon, MoneyBagIcon, LoanIcon, ProfileIcon, HistoryIcon } from './Icons';

export default function BottomNav({ role = 'member' }) {
  const pathname = usePathname();
  const isAdmin = role === 'admin' || role === 'super_admin';

  const tabs = isAdmin
    ? [
        { href: '/admin', Icon: HomeIcon, label: 'Home' },
        { href: '/admin/collect', Icon: MoneyBagIcon, label: 'Collect' },
        { href: '/admin/members', Icon: MembersIcon, label: 'Members' },
        { href: '/admin/loans', Icon: LoanIcon, label: 'Loans' },
        { href: '/dashboard', Icon: ProfileIcon, label: 'Profile' },
      ]
    : [
        { href: '/dashboard', Icon: HomeIcon, label: 'Home' },
        { href: '/dashboard#contributions', Icon: HistoryIcon, label: 'History' },
        { href: '/change-password', Icon: ProfileIcon, label: 'Profile' },
      ];

  const isActive = (href) => {
    if (href === pathname) return true;
    if (href === '/admin' && pathname === '/admin') return true;
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href.includes('#') && pathname === href.split('#')[0]) return true;
    if (href !== '/admin' && href !== '/dashboard' && !href.includes('#') && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const active = isActive(tab.href);
        const Icon = tab.Icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
          >
            <Icon size={24} className="bottom-nav-svg" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}