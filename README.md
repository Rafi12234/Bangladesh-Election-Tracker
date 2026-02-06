# Bangladesh Live Election Tracker 🗳️

Real-time election results and seat counting for Bangladesh parliamentary elections.
Built with Next.js, Firebase, Leaflet, and Tailwind CSS.

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

### 👮 Admin Panel
- **Secure Hidden Route** (`/admin9012`) with Firebase authentication
- **3-tier Cascade Selector** - Division → District → Constituency
- **All 60+ Parties** available for vote entry
- **Independent Candidate** option
- **MCQ-style Vote Entry** with real-time calculations
- **Edit Existing Results** with overwrite warning
- **Toggle Status** - Partial/Completed
- **Auto-calculation** - Total votes, winner, margin, percentages

### 🎨 UI/UX Features
- **Dark Mode Support** with system preference detection
- **Manual Theme Toggle** in header
- **Modern Gradient Design** on cards and backgrounds
- **Smooth Animations** - Hover effects, transitions, scale transforms
- **Responsive Design** - Mobile-first approach for all screen sizes
- **Loading States** - Skeletons and spinners
- **Party Color Indicators** with symbols (emojis)

### ⚡ Performance & Technical
- **Real-time Updates** - Firestore `onSnapshot` listeners
- **Lazy Loading** - Map component loaded on-demand
- **Code Splitting** - Dynamic imports for optimization
- **Pre-aggregated Data** - Server-side summary calculations
- **Canvas Rendering** - Leaflet optimization for many features
- **Efficient Queries** - Indexed Firestore reads

### 🔐 Security
- **Firebase Authentication** with email/password
- **Admin Whitelist** in Firestore
- **Role-based Access** (admin, data-entry)
- **Audit Trail** - updatedBy tracking
- **Protected Routes** with secure rules

### 📊 Data Management
- **60+ Registered Parties** with alliance assignments
- **Alliance Definitions** - BNP-led (4 parties), Jamaat-led (4 parties), Others (50+)
- **300 Constituencies** across 8 divisions and 64 districts
- **Automatic Aggregation** - Party votes → Alliance totals
- **GeoJSON Boundaries** for accurate mapping

## Tech Stack

| Layer      | Technology                      |
|------------|----------------------------------|
| Frontend   | Next.js 14 (App Router), React 18 |
| Styling    | Tailwind CSS                     |
| Map        | Leaflet + react-leaflet          |
| Backend    | Firebase Firestore               |
| Auth       | Firebase Authentication          |
| Hosting    | Vercel                           |
| Analytics  | Cloudflare Web Analytics         |

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

### 5. Run Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Routes:**
- `/` — Dashboard  
- `/map` — Full map
- `/admin9012` — Admin panel (hidden from navigation)
- `/constituency/[id]` — Details

## Deployment

### Vercel

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add all `NEXT_PUBLIC_*` env vars from `.env.example`
4. Deploy

### Cloudflare Analytics

1. Go to [Cloudflare Web Analytics](https://dash.cloudflare.com/?to=/:account/web-analytics)
2. Add your domain → get beacon token
3. Update token in `app/layout.tsx` or set `NEXT_PUBLIC_CF_ANALYTICS_TOKEN`

## Project Structure

```
app/
  page.tsx              → Main dashboard
  map/page.tsx          → Full interactive map
  constituency/[id]/    → Constituency detail
  admin9012/page.tsx    → Admin result entry (secret route)
  layout.tsx            → Root layout + analytics
  globals.css           → Global styles

components/
  Header.tsx            → Navigation
  ResultsSummary.tsx     → Metrics + seat counter
  SeatCounter.tsx        → Party seat bar
  VoteBar.tsx           → Vote breakdown bars
  MapView.tsx           → Leaflet map
  ConstituencyList.tsx  → Searchable constituency list
  AdminLogin.tsx        → Auth form
  AdminPanel.tsx        → Vote entry form
  LoadingSpinner.tsx    → Loading states

lib/
  firebase.ts           → Firebase init (singleton)
  firestore.ts          → All Firestore CRUD + listeners
  auth.ts               → Auth helpers
  constants.ts          → App constants
  utils.ts              → Formatting utilities

hooks/
  useAuth.ts            → Auth state hook
  useElectionData.ts    → Real-time data hooks

data/
  parties.ts            → Party definitions
  divisions.ts          → Division/District/Constituency hierarchy

types/
  index.ts              → TypeScript types

public/data/geojson/    → Map boundary + district data
```

## Firestore Collections

| Collection       | Purpose                        |
|------------------|--------------------------------|
| `parties`        | Party metadata                 |
| `constituencies` | 300 constituency records       |
| `candidates`     | Candidate per constituency     |
| `results`        | Vote tallies (keyed by constituency ID) |
| `summary`        | Aggregated seat counts         |
| `adminUsers`     | Admin access control           |

## GeoJSON

Replace placeholder files in `public/data/geojson/` with real Bangladesh constituency boundaries for production.
Recommended source: [GADM](https://gadm.org/download_country.html) or Bangladesh Election Commission.

## Performance Notes

- Map is lazy-loaded via `next/dynamic` (not in initial bundle)
- Firestore listeners provide real-time updates without polling
- Static party/division data avoids unnecessary reads
- `preferCanvas: true` on Leaflet for better rendering of many features
- Summary document is pre-aggregated to avoid client-side computation

## License

MIT
