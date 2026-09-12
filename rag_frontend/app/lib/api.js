/**
 * Every call to your FastAPI backend goes through here. If an endpoint's
 * path or shape ever changes on the backend, this is the only file to update.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {}
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // dashboard
  getStats: () => request('/documents/stats/dashboard'),

  // documents
  listDocuments: () => request('/documents'),
  getDocument: (id) => request(`/documents/${id}`),
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/documents/upload', { method: 'POST', body: formData });
  },
  deleteDocument: (id) => request(`/documents/${id}`, { method: 'DELETE' }),
  reprocessDocument: (id) => request(`/documents/${id}/reprocess`, { method: 'POST' }),

  // chat
  createSession: () => request('/chat/sessions', { method: 'POST' }),
  listSessions: () => request('/chat/sessions'),
  getSession: (id) => request(`/chat/sessions/${id}`),
  sendMessage: (sessionId, message) =>
    request('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, message }),
    }),
};
