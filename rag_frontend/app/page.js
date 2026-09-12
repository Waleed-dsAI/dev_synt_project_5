'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from './lib/api';

const STATUS_COLOR = {
  processed: 'var(--teal)',
  processing: 'var(--brass)',
  failed: 'var(--brick)',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.getStats(), api.listDocuments()])
      .then(([s, d]) => {
        setStats(s);
        setDocs(d.slice(0, 5));
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div>
        <p className="eyebrow">Dashboard</p>
        <h1>Can't reach the backend</h1>
        <p style={{ color: 'var(--ink-soft)', marginTop: 12 }}>
          {error}. Check that your FastAPI server is running and{' '}
          <span className="mono">NEXT_PUBLIC_API_URL</span> points at it.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow">Dashboard</p>
      <h1 style={{ fontSize: 30, marginBottom: 8 }}>Document knowledge base</h1>
      <p style={{ color: 'var(--ink-soft)', maxWidth: 520 }}>
        Upload property documents, then ask questions grounded only in what's been indexed.
      </p>

      <hr className="hairline" />

      {!stats ? (
        <p className="mono">Loading stats…</p>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 40 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 64, lineHeight: 1 }}>
              {stats.total_documents}
            </span>
            <span style={{ color: 'var(--ink-soft)', fontSize: 15 }}>
              document{stats.total_documents === 1 ? '' : 's'} in the archive
            </span>
          </div>

          <div style={{ display: 'flex' }}>
            <Stat label="Indexed chunks" value={stats.total_chunks} />
            <div className="hairline-v" style={{ margin: '0 28px' }} />
            <Stat label="Questions asked" value={stats.total_questions} />
            <div className="hairline-v" style={{ margin: '0 28px' }} />
            <Stat label="Processing" value={stats.processing} accent="var(--brass)" />
            <div className="hairline-v" style={{ margin: '0 28px' }} />
            <Stat label="Failed" value={stats.failed} accent={stats.failed > 0 ? 'var(--brick)' : undefined} />
          </div>
        </>
      )}

      <hr className="hairline" />

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 18 }}>Recent documents</h2>
        <Link href="/documents" style={{ fontSize: 13.5, color: 'var(--teal)' }}>
          View all
        </Link>
      </div>

      <div style={{ marginTop: 16 }}>
        {docs.length === 0 && (
          <p style={{ color: 'var(--ink-soft)' }}>
            Nothing uploaded yet. <Link href="/documents" style={{ color: 'var(--teal)' }}>Add your first document</Link>.
          </p>
        )}
        {docs.map((doc, i) => (
          <div
            key={doc.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderTop: i === 0 ? 'none' : '1px solid var(--line)',
            }}
          >
            <span>{doc.filename}</span>
            <span
              style={{
                fontSize: 13,
                color: STATUS_COLOR[doc.status],
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: STATUS_COLOR[doc.status],
                  display: 'inline-block',
                }}
              />
              {doc.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: accent }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>{label}</div>
    </div>
  );
}
