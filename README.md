# Folio — AI Resume Builder

A production-ready resume builder with Google auth, Stripe subscriptions, and Claude AI features.

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Auth | Supabase (Google OAuth) |
| Database | Supabase (Postgres) |
| Payments | Stripe (monthly subscription) |
| AI | Anthropic Claude (claude-sonnet-4-20250514) |
| PDF Export | react-to-print |

## Features

**Free:**
- Resume editor (personal info, experience, education, skills)
- Classic template
- Live preview

**Pro ($12/month, 7-day free trial):**
- AI-powered bullet point generation
- AI professional summary writing
- Cover letter builder
- Resume score & ATS analysis
- 3 additional templates (Modern, Executive, Creative)
- PDF export

---

## Setup

### 1. Clone & install

```bash
git clone <your-repo>
cd folio
npm install
cp .env.example .env
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run `supabase-setup.sql`
3. Go to **Authentication → Providers → Google** and enable it
   - You'll need a Google Cloud OAuth client ID ([guide](https://supabase.com/docs/guides/auth/social-login/auth-google))
4. Copy your project URL and anon key from **Settings → API**

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Stripe

1. Create an account at [stripe.com](https://stripe.com)
2. In the Stripe Dashboard:
   - Create a **Product** called "Folio Pro"
   - Create a **Price**: $12/month recurring, with a **7-day free trial**
   - Copy the Price ID (starts with `price_`)
3. Copy your publishable key from **Developers → API keys**

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PRO_PRICE_ID=price_...
```

4. Set up the webhook (for subscription status updates):
   - Go to **Developers → Webhooks → Add endpoint**
   - URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `checkout.session.completed`
   - Deploy the Edge Function (see `supabase-setup.sql` for the code)

### 4. Anthropic API

1. Get your API key from [console.anthropic.com](https://console.anthropic.com)
2. For development: add to `.env`

```env
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

> ⚠️ **Production note**: Never expose your Anthropic API key in a frontend build.
> Instead, proxy AI calls through a Supabase Edge Function that reads the key
> from `ANTHROPIC_API_KEY` server-side environment variable.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
src/
├── components/
│   ├── paywall/
│   │   └── PaywallModal.tsx      # Upgrade modal + ProGate wrapper
│   └── resume/
│       ├── EditorForm.tsx         # Left panel form inputs
│       ├── ResumePreview.tsx      # Live resume preview (printable)
│       ├── ScorePanel.tsx         # AI resume scoring
│       ├── CoverLetterBuilder.tsx # AI cover letter generator
│       └── TemplatesPanel.tsx     # Template picker
├── hooks/
│   ├── useAuth.tsx                # Auth context + Google sign-in
│   └── useResume.ts              # Resume state + autosave
├── lib/
│   ├── supabase.ts               # Supabase client + DB helpers
│   ├── stripe.ts                 # Stripe checkout + portal
│   └── ai.ts                     # Anthropic API calls
├── pages/
│   ├── LandingPage.tsx           # Marketing + sign-in page
│   └── EditorPage.tsx            # Main editor app
├── types/
│   └── index.ts                  # TypeScript interfaces
├── App.tsx                        # Router
├── main.tsx                       # Entry point
└── index.css                      # Tailwind + global styles
```

---

## Deployment

### Lovable
1. Push to GitHub
2. Import in Lovable — it auto-detects Vite + React
3. Add your environment variables in Lovable's settings

### Vercel / Netlify
```bash
npm run build
# Deploy the dist/ folder
# Add env vars in your hosting dashboard
```

---

## Adding More Templates

1. Add a new `TemplateId` in `src/types/index.ts`
2. Add it to `TEMPLATES` in `TemplatesPanel.tsx`
3. Render it conditionally in `ResumePreview.tsx` based on `resume.template`

## Customizing Pro Features

The `isPro` boolean comes from `useAuth()`. To add a new gated feature:

```tsx
const { isPro } = useAuth()

// Option 1: Full page gate
if (!isPro) return <ProGate feature="my_feature" ... />

// Option 2: Inline button
<button onClick={() => { if (!isPro) { onShowPaywall('my_feature'); return } doThing() }}>
```

---

## License

MIT
