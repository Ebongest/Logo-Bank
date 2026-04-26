# Logo Bank — Deployment Guide

## Stack
- **Frontend**: React + Vite
- **AI**: Anthropic Claude API
- **Database**: Supabase
- **Hosting**: Vercel
- **Source**: GitHub

---

## Step 1 — Supabase Setup

1. Go to https://supabase.com → open project `jhvwbvokhjdifilbsxpa`
2. Click **SQL Editor** → paste the contents of `supabase-setup.sql` → click **Run**
3. Go to **Settings → API** → copy your **anon public key**

---

## Step 2 — GitHub

```bash
# In Terminal (Mac)
cd ~/Desktop
git clone https://github.com/YOUR_USERNAME/logo-bank  # or create new repo
cp -r /path/to/logobank/* logo-bank/
cd logo-bank

# Create .env from example
cp .env.example .env
# Edit .env with your keys

git add .
git commit -m "🚀 Initial Logo Bank deploy"
git push origin main
```

Or create a new repo:
```bash
cd ~/Desktop/logobank
git init
git add .
git commit -m "🚀 Logo Bank — initial commit"
# Create repo at github.com/new, then:
git remote add origin https://github.com/YOUR_USERNAME/logo-bank.git
git push -u origin main
```

---

## Step 3 — Vercel Deploy

1. Go to https://vercel.com → **Add New Project**
2. Import your GitHub repo `logo-bank`
3. Framework: **Vite** (auto-detected)
4. Add **Environment Variables**:
   ```
   VITE_SUPABASE_URL      = https://jhvwbvokhjdifilbsxpa.supabase.co
   VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
   VITE_ANTHROPIC_KEY     = your_anthropic_api_key
   ```
5. Click **Deploy** → your app goes live at `logo-bank.vercel.app`

---

## Local Development

```bash
cd logobank
npm install
cp .env.example .env   # add your keys
npm run dev            # http://localhost:5173
```

---

## Notes
- The Anthropic API key must be kept **server-side** in production (use Vercel Edge Functions or a proxy). For demo purposes it can be in .env during dev.
- To add auth, enable Supabase Auth and update RLS policies to `auth.uid() = user_id`.
