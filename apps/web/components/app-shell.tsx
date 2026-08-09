'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/crm/leads', label: 'CRM Leads', icon: '🤝' },
  { href: '/crm/customers', label: 'CRM Customers', icon: '👥' },
  { href: '/packages', label: 'Packages', icon: '🎒' },
  { href: '/sales/quotations', label: 'Quotations', icon: '🧾' },
  { href: '/bookings', label: 'Bookings', icon: '🛳️' },
  { href: '/operations/trips', label: 'Operations', icon: '🧭' },
  { href: '/finance/invoices', label: 'Finance', icon: '💳' },
  { href: '/reports', label: 'Reports', icon: '📈' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fb', color: '#0f172a' }}>
      <aside style={{ width: '250px', background: '#0f172a', color: 'white', padding: '24px 18px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <Link href="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '20px', fontWeight: 700, lineHeight: 1.3 }}>
          BATAM TRAVELLING
        </Link>
        <nav style={{ display: 'grid', gap: '6px' }}>
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none', color: active ? '#2dd4bf' : '#cbd5e1', background: active ? 'rgba(45,212,191,0.16)' : 'transparent', borderRadius: '10px', padding: '10px 12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ marginTop: 'auto', fontSize: '13px', color: '#94a3b8' }}>
          <div style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px', background: 'rgba(255,255,255,0.04)' }}>
            <div style={{ color: '#2dd4bf', fontWeight: 700 }}>Tenant: Batam Travelling</div>
            <div>Role: Tenant Owner</div>
          </div>
        </div>
      </aside>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
