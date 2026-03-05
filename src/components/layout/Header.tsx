'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/calendar', label: 'カレンダー', icon: '📅' },
  { href: '/events/new', label: '予定を追加', icon: '➕' },
  { href: '/spots', label: 'おでかけスポット', icon: '🗺️' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/calendar" className="flex items-center gap-2">
            <span className="text-2xl">👨‍👩‍👧‍👦</span>
            <span className="text-xl font-bold text-gray-800">家族スケジュール</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
