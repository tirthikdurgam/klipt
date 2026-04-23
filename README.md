# klipt. 📎

![klipt banner](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Upstash](https://img.shields.io/badge/Upstash_Redis-00E676?style=for-the-badge&logo=redis&logoColor=white)

**klipt** is a lightning-fast, anonymous, and highly secure cloud clipboard. It allows developers and users to instantly share code snippets, logs, and text without the friction of creating an account. 

Live Demo: [klipt.qzz.io](https://klipt.qzz.io)

---

## Features

- **Frictionless Sharing:** No logins, no passwords, no onboarding. Just paste and share.
- **Auto-Syntax Highlighting:** Automatically formats code blocks for 9+ languages (JS, Python, SQL, etc.) using `highlight.js`.
- **Self-Destructing Clips:** Set clips to automatically expire anywhere from 1 hour to 30 days. 
- **"Coat Check" Deletion System:** A mathematically secure Creator Token system that allows the original creator to delete their clip without ever needing to create a user account.
- **Custom URLs:** Claim your own custom, readable links (e.g., `klipt.qzz.io/my-code`).
- **Raw View:** Instantly access the raw text output for easy `curl` commands or script imports.
- **Enterprise-Grade Rate Limiting:** Protected against bot spam and DDoS attacks via Upstash Redis edge middleware.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + UI Glassmorphism
- **Database:** Supabase (PostgreSQL)
- **Syntax Highlighting:** Highlight.js
- **Rate Limiting:** Upstash Redis
- **Deployment:** Vercel

---

## Security Architecture

Despite being an anonymous platform, klipt is built like a fortress:

1. **The Bouncer (Upstash Redis):** Next.js Edge Middleware intercepts every clip creation request. If an IP addresses exceeds 10 clips per minute, they are blocked before the request ever touches the database.
2. **The Coat Check (Creator Tokens):** Because there are no user accounts, when a clip is created, Supabase automatically mints a secure UUID `delete_token`. This token is passed back and stored silently in the creator's browser `localStorage`. Only the browser holding this exact token will see the "Delete" button.
3. **The Garbage Collector (pg_cron):** A scheduled Supabase cron job runs hourly to permanently wipe any expired clips from the database, ensuring zero data bloat.
4. **SQL Injection Proof:** All database interactions are handled via Supabase's PostgREST API using parameterized queries.

---

## Getting Started (Local Development)

If you want to run klipt locally, follow these steps:

### 1. Clone the repository
```bash
git clone [https://github.com/tirthikdurgam/klipt.git](https://github.com/tirthikdurgam/klipt.git)
cd klipt


### 2. Install dependencies
```bash
npm install
```

### 3. Set up your Environment Variables
Create a `.env.local` file in the root directory and add the following keys:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# Upstash Redis (For Rate Limiting)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup (Supabase SQL)
Run the following SQL in your Supabase SQL Editor to set up the table and garbage collector:

```sql
-- Create the clips table
CREATE TABLE public.clips (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  language text DEFAULT 'plaintext',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  view_count int4 DEFAULT 0,
  delete_token uuid DEFAULT gen_random_uuid()
);

-- Set up the Garbage Collector
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule(
  'cleanup-expired-clips', 
  '0 * * * *', 
  $$DELETE FROM public.clips WHERE expires_at < now();$$
);
```

### 5. Run the Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---
