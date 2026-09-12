# Frontend — Setup & Deploy

## Local development
```
npm install
cp .env.example .env.local
# edit .env.local: NEXT_PUBLIC_API_URL=http://localhost:8000 (your local FastAPI server)
npm run dev
```
Visit http://localhost:3000. Make sure the backend is running first (`uvicorn app.main:app --reload`).

## Deploying to Vercel

### Step 1 — deploy the backend first
**Vercel cannot host your FastAPI backend the way you built it.** Your backend writes
uploaded files to disk and stores the vector index locally (`storage/uploads`,
`storage/chroma`) — Vercel's serverless functions are stateless and don't persist
files between requests. Deploy the backend somewhere that keeps a real, persistent
server running instead — good free/cheap options:
- **Render** (render.com) — easiest, has a free tier, supports persistent disks
- **Railway** (railway.app)
- **Fly.io**

Whichever you use: set the `GEMINI_API_KEY` environment variable there (never commit
it), and note the public URL it gives you (e.g. `https://your-backend.onrender.com`).

### Step 2 — deploy this frontend to Vercel
1. Push this repo to GitHub (if not already).
2. Go to vercel.com → New Project → import your GitHub repo.
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` = your deployed backend URL from Step 1 (no trailing slash)
4. Deploy. Vercel auto-detects Next.js — no build config needed.

### Step 3 — CORS
Your backend's `app/main.py` currently allows all origins (`allow_origins=["*"]`), so
your deployed Vercel frontend will be able to reach it without any backend changes.
For a stricter production setup later, you'd restrict that to your exact Vercel URL.

## Pages
- `/` — Dashboard: live stats pulled from `/documents/stats/dashboard`
- `/documents` — upload (drag-drop or click), status table, delete, reprocess
- `/chat` — chatbot interface with sources shown under each answer

## Design notes
Warm paper background instead of a stock SaaS-dark theme, Fraunces for headings (fits
the real-estate/document-archive framing), hairline dividers instead of shadowed cards
for stats. Colors and fonts are all CSS variables in `app/globals.css` if you want to
adjust the palette.
