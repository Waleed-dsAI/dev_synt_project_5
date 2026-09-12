'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

export default function Chat() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function startNewChat() {
    setSessionId(null);
    setMessages([]);
    setError(null);
  }

  async function handleSend(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setInput('');
    setError(null);
    setMessages((m) => [...m, { role: 'user', content: question, timestamp: new Date().toISOString() }]);
    setLoading(true);

    try {
      const res = await api.sendMessage(sessionId, question);
      setSessionId(res.session_id);
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: res.answer, sources: res.sources, timestamp: res.timestamp },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 96px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <p className="eyebrow">Chat</p>
          <h1 style={{ fontSize: 26 }}>Ask the archive</h1>
        </div>
        <button
          onClick={startNewChat}
          style={{
            background: 'none',
            border: '1px solid var(--line)',
            padding: '7px 14px',
            fontSize: 13,
          }}
        >
          New chat
        </button>
      </div>

      <hr className="hairline" style={{ marginBottom: 0 }} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0' }}>
        {messages.length === 0 && (
          <p style={{ color: 'var(--ink-soft)' }}>
            Ask a question about the uploaded documents — answers are grounded only in
            what's been indexed, with sources shown below each response.
          </p>
        )}

        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}

        {loading && (
          <div style={{ color: 'var(--ink-soft)', fontSize: 14, padding: '8px 0' }}>Thinking…</div>
        )}

        {error && (
          <div style={{ color: 'var(--brick)', fontSize: 13.5, padding: '8px 0' }}>
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What are the pet policies for the downtown listings?"
          style={{
            flex: 1,
            padding: '12px 14px',
            border: '1px solid var(--line)',
            background: 'var(--paper)',
            fontFamily: 'var(--font-body)',
            fontSize: 14.5,
            color: 'var(--ink)',
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            background: 'var(--ink)',
            color: 'var(--paper)',
            border: 'none',
            padding: '0 22px',
            fontSize: 14,
            opacity: loading || !input.trim() ? 0.5 : 1,
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 18,
      }}
    >
      <div style={{ maxWidth: '72%' }}>
        <div
          style={{
            background: isUser ? 'var(--sand)' : 'transparent',
            borderLeft: isUser ? 'none' : '2px solid var(--brass)',
            padding: isUser ? '10px 14px' : '2px 0 2px 14px',
            fontSize: 14.5,
            lineHeight: 1.55,
            whiteSpace: 'pre-wrap',
          }}
        >
          {msg.content}
        </div>

        {msg.sources && msg.sources.length > 0 && (
          <div style={{ marginTop: 6, paddingLeft: 14, fontSize: 12.5, color: 'var(--ink-soft)' }}>
            {msg.sources.map((s, i) => (
              <span key={s.chunk_id}>
                {i > 0 && ' · '}
                {s.document_name}
                {s.page_number ? ` — Page ${s.page_number}` : ''}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
