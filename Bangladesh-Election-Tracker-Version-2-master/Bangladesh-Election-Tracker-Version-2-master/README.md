# Bangladesh Live Election Tracker 🗳️

Real-time election results and seat counting for Bangladesh parliamentary elections.
Built with Next.js 14, Firebase, TypeScript, and Tailwind CSS — optimized for performance and security.

> **⚠️ IMPORTANT - Before Using This Repository:**
>
> This repository does NOT include sensitive credentials. You MUST:
>
> 1. Create your own Firebase project
> 2. Set up your own environment variables
> 3. Configure your own admin authentication
> 4. Never commit `.env.local` or any files with real credentials
>
> See setup instructions below for details.

## Features

### 📊 Core Dashboard Features

- **Live Results Display** with real-time updates and "LIVE" indicator
- **Alliance Aggregation System** - 3 main groups (BNP-led, Jamaat-led, Others)
- **60+ Political Parties** fully supported with auto-aggregation
- **Seat Counter Visualization** - Horizontal stacked bar with majority line
- **Expandable Alliance Cards** showing party-level breakdowns
- **Key Metrics Display** - Total seats, declared, majority threshold, avg turnout
- **Party Performance Table** - Seats won, leading, votes, percentages

### 🗺️ Interactive Map

- **Full-screen Leaflet Map** with pan and zoom controls
- **Constituency-level Coloring** based on winner party
- **Hover Tooltips** - Winner, votes, margin, turnout
- **Click Navigation** to constituency detail pages
- **Dynamic Updates** - Real-time color changes as results come in
- **Status Indicators** - Full color (completed), 50% opacity (leading), gray (pending)

### 📋 Constituency Features

- **Searchable List** of all 300 constituencies
- **Status Filters** - All, Completed, Partial, Pending
- **Detailed Pages** - Full candidate list, vote breakdown, winner highlights
- **Victory Margin & Turnout** statistics
- **Alliance Context** display (e.g., "BNP (BNP Alliance)")

### 🎨 UI/UX Features

- **Dark Mode Support** with system preference detection
- **Manual Theme Toggle** in header
- **Modern Gradient Design** on cards and backgrounds
- **Smooth Animations** - Hover effects, transitions, scale transforms
- **Responsive Design** - Mobile-first approach for all screen sizes
- **Loading States** - Skeletons and spinners
- **Party Color Indicators** with symbols (emojis)

### 📰 News System

- **Slug-based URLs** - SEO-friendly article links (/news/article-slug)
- **Markdown Support** - Bold/italic formatting in articles
- **XSS Protection** - Content sanitization prevents script injection
- **Responsive Article Layout** - Mobile-optimized reading experience

### ⚡ Performance & Technical

- **Real-time Updates** - Firestore `onSnapshot` listeners with optimized subscriptions
- **Infinite Scroll** - ConstituencyList virtualization (loads 30 items at a time)
- **React.memo** - Memoized components prevent unnecessary re-renders
- **Optimized Hooks** - Fixed duplicate subscriptions and memory leaks
- **Code Splitting** - Dynamic imports and lazy loading
- **Pre-aggregated Data** - Server-side summary calculations
- **SWC Minification** - Faster builds with Next.js 14
- **Package Import Optimization** - Tree-shaking for @heroicons/react

### 🔐 Security & Hardening

- **Firestore Security Rules** with field-level validation (vote counts, status enums)
- **Content Security Policy (CSP)** - Prevents XSS attacks
- **HTTP Security Headers** - HSTS, X-Frame-Options, X-Content-Type-Options
- **Input Validation & Sanitization** - Vote count validation (0-10M), HTML stripping
- **XSS Prevention** - News content sanitized, script tags stripped

### 📊 Data Management

- **60+ Registered Parties** with alliance assignments
- **Alliance Definitions** - BNP-led (4 parties), Jamaat-led (4 parties), Others (50+)
- **300 Constituencies** across 8 divisions and 64 districts
- **Automatic Aggregation** - Party votes → Alliance totals
- **GeoJSON Boundaries** for accurate mapping

## Tech Stack

| Layer     | Technology                        |
| --------- | --------------------------------- |
| Frontend  | Next.js 14 (App Router), React 18 |
| Styling   | Tailwind CSS                      |
| Map       | Leaflet + react-leaflet           |
| Backend   | Firebase Firestore                |
| Auth      | Firebase Authentication           |
| Hosting   | Vercel                            |
| Analytics | Cloudflare Web Analytics          |

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd bangladesh-election-tracker
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) → Create project
2. Enable **Firestore Database** (production mode)
3. Enable **Authentication** → Email/Password
4. Go to Project Settings → General → copy config values
5. Deploy Firestore rules:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

**Note:** The admin panel is accessible only via the secret URL `/admin9012` (not visible in navigation).

### 3. Create Admin User

1. In Firebase Auth console, create a user (email + password)
2. Note the user UID
3. In Firestore, create document: `adminUsers/{uid}`
   ```json
   {
     "email": "admin@example.com",
     "displayName": "Admin",
     "role": "admin",
     "createdAt": "2026-01-01T00:00:00Z"
   }
   ```

### 4. Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your Firebase config values
```

**Required variables:**

```env
# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Optional variables:**

```env
# Google Analytics (Optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Cloudflare Web Analytics (Optional)
NEXT_PUBLIC_CF_ANALYTICS_TOKEN=your_cloudflare_beacon_token
```

> **🔒 Security Note:**
>
> - Never commit `.env.local` to version control
> - All Firebase config values can be safely exposed (they're public by design)
> - Security is handled by Firebase Security Rules, not by hiding config
> - Use different Firebase projects for dev/staging/production

### 5. Run Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Routes:**

- `/` — Dashboard
- `/map` — Full map (currently disabled)
- `/news` — News articles listing
- `/news/[slug]` — Individual article pages
- `/constituency` — Constituency list with search/filters
- `/constituency/[id]` — Detailed constituency results

## Deployment

### Vercel (Recommended)

#### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### Step 2: Import to Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

#### Step 3: Add Environment Variables

In Vercel project settings → Environment Variables, add all variables from `.env.example`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_CF_ANALYTICS_TOKEN=your_cloudflare_beacon_token
```

**Important**: Make sure to add these variables for **Production**, **Preview**, and **Development** environments.

#### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Visit your production URL (e.g., `your-app.vercel.app`)

#### Vercel Configuration

The project includes `vercel.json` with:

- **Region**: Singapore (sin1) for Bangladesh users
- **Cache Headers**: Long-term caching for static assets
- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- **Framework**: Next.js auto-optimization

#### Continuous Deployment

Vercel automatically deploys:

- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches (pull requests)

### Cloudflare Analytics

1. Go to [Cloudflare Web Analytics](https://dash.cloudflare.com/?to=/:account/web-analytics)
2. Add your domain → get beacon token
3. Add `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` to Vercel environment variables

## Project Structure

```
app/
  page.tsx              → Main dashboard
  constituency/
    page.tsx            → Constituency list with infinite scroll
    [id]/page.tsx       → Individual constituency details
  news/
    page.tsx            → News articles listing
    [slug]/page.tsx     → Individual article with XSS protection
  map/page.tsx          → Interactive map (currently disabled)
  layout.tsx            → Root layout with security headers
  globals.css           → Global styles

components/
  Header.tsx            → Navigation with theme toggle
  ResultsSummary.tsx     → Metrics + seat counter + parliament visualization
  ParliamentSeats.tsx   → Parliament seat chart
  SeatCounter.tsx       → Party seat bar
  VoteBar.tsx           → Vote breakdown bars
  ElectionBanner.tsx    → Top banner with live indicator
  ConstituencyList.tsx  → Virtualized list with infinite scroll
  NewsCard.tsx          → Article preview cards
  NewsGrid.tsx          → Responsive article grid
  MapView.tsx           → Leaflet map (disabled)
  LoadingSpinner.tsx    → Loading states
  Footer.tsx            → Site footer

lib/
  firebase.ts           → Firebase init (singleton)
  firestore.ts          → Firestore CRUD + real-time listeners (optimized)
  news.ts               → News article operations
  validation.ts         → Input validation & XSS sanitization
  alliances.ts          → Party alliance calculations
  constants.ts          → App constants & configuration
  utils.ts              → Formatting & utility functions

hooks/
  useElectionData.ts    → Real-time data hooks

data/
  parties.ts            → Party definitions
  divisions.ts          → Division/District/Constituency hierarchy

types/
  index.ts              → TypeScript types

public/data/geojson/    → Map boundary + district data
```

## Firestore Collections

| Collection       | Purpose                                  |
| ---------------- | ---------------------------------------- |
| `parties`        | Party metadata (60+ parties)             |
| `constituencies` | 300 constituency records with candidates |
| `results`        | Vote tallies with field validation       |
| `summary`        | Real-time aggregated metrics             |
| `news`           | Articles with draft/published status     |

## GeoJSON

Replace placeholder files in `public/data/geojson/` with real Bangladesh constituency boundaries for production.
Recommended source: [GADM](https://gadm.org/download_country.html) or Bangladesh Election Commission.

## Performance & Security Features

### Performance Optimizations

- **Infinite Scroll**: ConstituencyList renders 30 items initially, loads more on scroll
- **React.memo**: Memoized components prevent cascading re-renders
- **Hook Optimization**: Fixed duplicate Firestore subscriptions in useSummary
- **Bundle Optimization**: Tree-shaking for @heroicons/react, SWC minification
- **Static Data**: Party/division definitions avoid Firestore reads
- **Lazy Loading**: Map component loaded on-demand (currently disabled)

### Security Hardening

- **Content Security Policy**: Strict CSP prevents XSS injection attacks
- **Input Validation**: Vote counts validated (0-10M range), HTML tags stripped
- **XSS Prevention**: News content sanitized, dangerous elements removed
- **Security Headers**: HSTS, X-Frame-Options, X-Content-Type-Options, Permissions-Policy
- **Firestore Rules**: Field-level validation on writes (types, ranges, auth checks)

## License

Mohammed Tayeb
