'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../lib/api';

const STATUS_COLOR = {
  processed: 'var(--teal)',
  processing: 'var(--brass)',
  failed: 'var(--brick)',
};

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileInput = useRef(null);

  const refresh = useCallback(() => {
    api
      .listDocuments()
      .then(setDocs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
    // Poll every 3s so "processing" flips to "processed" without a manual refresh
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [refresh]);

  async function handleFiles(files) {
    setError(null);
    for (const file of files) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['pdf', 'docx', 'txt'].includes(ext)) {
        setError(`"${file.name}" isn't a supported format. Use PDF, DOCX, or TXT.`);
        continue;
      }
      setUploading(true);
      try {
        await api.uploadDocument(file);
      } catch (e) {
        setError(e.message);
      } finally {
        setUploading(false);
      }
    }
    refresh();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this document and its indexed chunks?')) return;
    await api.deleteDocument(id);
    refresh();
  }

  async function handleReprocess(id) {
    await api.reprocessDocument(id);
    refresh();
  }

  return (
    <div>
      <p className="eyebrow">Documents</p>
      <h1 style={{ fontSize: 30, marginBottom: 8 }}>Manage the archive</h1>
      <p style={{ color: 'var(--ink-soft)', maxWidth: 520 }}>
        PDF, DOCX, and TXT are supported. Each upload is extracted, chunked, embedded, and indexed automatically.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(Array.from(e.dataTransfer.files));
        }}
        onClick={() => fileInput.current?.click()}
        style={{
          marginTop: 28,
          border: `1.5px dashed ${dragOver ? 'var(--brass)' : 'var(--line)'}`,
          background: dragOver ? 'var(--sand)' : 'transparent',
          padding: '32px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.15s ease, background 0.15s ease',
        }}
      >
        <input
          ref={fileInput}
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(Array.from(e.target.files))}
        />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 4 }}>
          {uploading ? 'Uploading…' : 'Drop files here, or click to browse'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>PDF · DOCX · TXT</div>
      </div>

      {error && (
        <p style={{ color: 'var(--brick)', fontSize: 13.5, marginTop: 12 }}>{error}</p>
      )}

      <hr className="hairline" />

      {loading ? (
        <p className="mono">Loading documents…</p>
      ) : docs.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)' }}>No documents uploaded yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', fontSize: 12.5, color: 'var(--ink-soft)' }}>
              <th style={{ fontWeight: 500, paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
                Name
              </th>
              <th style={{ fontWeight: 500, paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
                Status
              </th>
              <th style={{ fontWeight: 500, paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
                Chunks
              </th>
              <th style={{ fontWeight: 500, paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
                Pages
              </th>
              <th style={{ borderBottom: '1px solid var(--line)' }}></th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr key={doc.id} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '12px 0', maxWidth: 260 }}>
                  {doc.filename}
                  {doc.status === 'failed' && doc.error_message && (
                    <div style={{ fontSize: 12, color: 'var(--brick)', marginTop: 2 }}>
                      {doc.error_message}
                    </div>
                  )}
                </td>
                <td>
                  <span
                    style={{
                      fontSize: 13,
                      color: STATUS_COLOR[doc.status],
                      display: 'inline-flex',
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
                      }}
                    />
                    {doc.status}
                  </span>
                </td>
                <td className="mono">{doc.num_chunks || '—'}</td>
                <td className="mono">{doc.num_pages ?? '—'}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button
                    onClick={() => handleReprocess(doc.id)}
                    style={buttonStyle}
                  >
                    Reprocess
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    style={{ ...buttonStyle, color: 'var(--brick)', marginLeft: 6 }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const buttonStyle = {
  background: 'none',
  border: '1px solid var(--line)',
  padding: '5px 11px',
  fontSize: 12.5,
  color: 'var(--ink)',
};
