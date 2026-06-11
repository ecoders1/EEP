# Exit Exam Ethiopia 🎓

> Ethiopia's premier university graduation exit exam preparation platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwind-css)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-green?logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-black?logo=vercel)](https://vercel.com)

## ✨ Features

### Screen 1 — Welcome / Login
- 🎨 **Modern glassmorphism UI** with animated gradient backgrounds
- 🌗 **Dark & Light mode** with system preference detection
- 🔐 **Multiple auth methods**: Email/Password, Phone OTP, Google OAuth, Telegram OTP
- 👤 **Guest access** for browsing without an account
- 🇪🇹 **Ethiopian flag accent** and bilingual branding (English + Amharic)
- 🎓 **Custom graduation SVG illustration** with animated elements

### Screen 2 — Home Dashboard
- 👋 **Personalized welcome** with student profile, GPA, and stats
- 🔍 **Smart search** across departments and exams
- 📊 **Progress statistics** with animated progress bars
- 📚 **Department browser** with 8 featured faculties
- 📝 **Recent exams** with scores and difficulty badges
- 🔔 **Notifications panel** with unread badge count
- 👤 **Profile card** with quick settings dropdown
- 📱 **Mobile-first** with bottom navigation

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom glassmorphism |
| Auth | Supabase Auth |
| Database | Supabase (PostgreSQL + RLS) |
| Deployment | Vercel |
| CI/CD | GitHub Actions |

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/your-org/exit-exam-ethiopia.git
cd exit-exam-ethiopia
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `src/lib/supabase/schema.sql` in the SQL Editor
3. Copy your project URL and anon key

### 3. Configure environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 Deploy to Vercel

```bash
npx vercel
```

Or connect your GitHub repo in the [Vercel dashboard](https://vercel.com/new).

Add environment variables in Vercel Project Settings → Environment Variables.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Auth gate (Login ↔ Dashboard)
│   └── globals.css         # Global styles + glassmorphism
├── components/
│   ├── auth/
│   │   └── LoginPage.tsx   # Screen 1: Welcome / Login
│   ├── dashboard/
│   │   └── DashboardPage.tsx  # Screen 2: Home Dashboard
│   └── ui/                 # Reusable components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Badge.tsx
│       ├── Card.tsx
│       ├── Avatar.tsx
│       └── ProgressBar.tsx
├── contexts/
│   ├── AuthContext.tsx      # Auth state + login methods
│   └── ThemeContext.tsx     # Dark/light mode
└── lib/
    ├── utils.ts             # Helper functions
    ├── supabase.ts          # Supabase client + types
    └── supabase/
        └── schema.sql       # Full DB schema with RLS
```

## 🎨 Design System

- **Primary**: Violet-600 / Indigo-600 gradient
- **Glassmorphism**: `backdrop-blur-xl` + semi-transparent backgrounds
- **Ethiopian accent**: Green (#078930), Yellow (#FCDD09), Red (#DA121A) flag stripe
- **Animations**: Float, shimmer, pulse-glow, fade-up, gradient-shift

## 📱 Responsive Breakpoints

| Breakpoint | Screen |
|-----------|--------|
| `xs` | 375px (iPhone SE) |
| `sm` | 640px |
| `md` | 768px (iPad) |
| `lg` | 1024px |
| `xl` | 1280px |

## 🔒 Security

- Row Level Security (RLS) on all Supabase tables
- Content Security Policy headers via `vercel.json`
- Input validation on all auth forms
- Secure token handling via Supabase Auth

## 📄 License

MIT © Exit Exam Ethiopia
