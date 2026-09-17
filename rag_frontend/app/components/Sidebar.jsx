'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', label: 'Dashboard' },
  { href: '/documents', label: 'Documents' },
  { href: '/chat', label: 'Chat' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        background: 'var(--ink)',
        color: 'var(--paper)',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ marginBottom: 48 }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 21,
            fontWeight: 500,
            letterSpacing: '0.01em',
          }}
        >
         DocsChat
        </div>
        <div style={{ fontSize: 12.5, color: '#a8b0a6', marginTop: 2 }}>
          Document intelligence
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                textDecoration: 'none',
                color: active ? 'var(--paper)' : '#a8b0a6',
                fontSize: 14.5,
                padding: '9px 10px',
                borderLeft: active ? '2px solid var(--brass-soft)' : '2px solid transparent',
                background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
                transition: 'color 0.15s ease',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      </div>
    </aside>
  );
}
