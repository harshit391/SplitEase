<p align="center">
  <img src="public/logo.png" alt="SplitEase Logo" width="120" height="120" />
</p>

<h1 align="center">SplitEase</h1>

<p align="center">
  <strong>Split bills, not friendships.</strong>
</p>

<p align="center">
  A modern expense splitting app with offline-first architecture, Supabase backend, and real-time sync.
  <br />
  Track who paid what, split costs fairly, settle up with minimal transactions, and share trips with friends.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#usage">Usage</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Features

### Core
- **Trip Management** — Create trips, add friends, and organize expenses by category
- **Smart Settlements** — Greedy algorithm minimizes the number of transactions needed to settle up
- **Explainable Calculations** — Step-by-step breakdowns of how settlements are computed
- **Flexible Splitting** — Split items among any subset of friends
- **Default Payer** — Set a default payer per trip to speed up data entry
- **Exclude Groups** — Temporarily exclude expense groups from settlement calculations

### Quick Entry (Template Syntax)
- **Bulk Add Expenses** — Type a text template to create an expense group with all items in one go
- **Item Quick Entry** — Bulk-add multiple items to an existing expense group via text
- **Simple Syntax** — `500 for all paid by Rahul on Burgers.`
- **Smart Parsing** — Supports "all" keyword, comma-separated friends, case-insensitive matching
- **Group Tax/Discount** — Add `tax is 5%` or `discount is 10rs` lines at the end
- **Live Preview** — See parsed results and validation errors as you type

### Tax & Discount
- **Group-Level Tax/Discount** — Apply tax or discount to an entire expense group (percentage or fixed value)
- **Per-Item Tax/Discount** — Toggle to set individual tax and discount on each item within a group
- **Proportional Distribution** — Tax and discount are distributed fairly based on each person's share

### Authentication & Sharing
- **Google Sign-In** — One-click authentication via Google OAuth (powered by Supabase Auth)
- **Private Sharing** — Share trips with specific Google accounts for view-only access
- **Public Links** — Generate shareable links that anyone with a Google account can view
- **Save Trips** — Bookmark shared trips from others to your homepage
- **View-Only Mode** — Shared users can view all data but cannot edit

### Sync & Offline
- **Offline-First** — All data stored locally in IndexedDB; works without internet
- **Background Sync** — Changes sync to Supabase automatically when online
- **Conflict Resolution** — Last-write-wins strategy with safety guards against data loss
- **Sync Status** — Real-time indicator showing synced, syncing, offline, or error states
- **Offline Banner** — Visual notification when working offline

### Export & Sharing
- **JSON Export/Import** — Back up and restore trips as JSON files
- **Summary CSV** — Export per-person totals by expense group
- **Detailed CSV** — Itemized breakdown with tax/discount per person
- **WhatsApp Format** — Copy settlements in a chat-ready format
- **Google Sheets Copy** — Tab-separated format for pasting into spreadsheets

### UI/UX
- **Modern Dark UI** — Sleek dark SaaS design with purple gradient accents
- **Smooth Animations** — Page transitions, card hovers, and list stagger effects via Framer Motion
- **Responsive** — Works on desktop, tablet, and mobile

## Tech Stack

| Category | Technologies |
|----------|-------------|
| Framework | [Next.js 16](https://nextjs.org/) with App Router |
| Language | [TypeScript](https://www.typescriptlang.org/) (strict mode) |
| Backend | [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS) |
| Local DB | [Dexie.js](https://dexie.org/) (IndexedDB wrapper) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| UI Components | [Shadcn UI](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| State (UI) | [Zustand](https://zustand-demo.pmnd.rs/) |
| State (Async) | [TanStack Query v5](https://tanstack.com/query) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Icons | [Lucide React](https://lucide.dev/) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- A [Supabase](https://supabase.com/) project (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/splitease.git
cd splitease
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com/)
2. Go to **SQL Editor** and run `supabase-complete-schema.sql` to create all tables, indexes, RLS policies, and triggers
3. If you want the "Save Trip" feature, also run `supabase-saved-trips-migration.sql`
4. Enable **Google OAuth** under Authentication → Providers → Google in the Supabase Dashboard
5. Copy your Project URL and anon key

### 3. Configure Environment

```bash
cp env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Usage

### 1. Sign In
Click "Continue with Google" to authenticate. Your trips sync across devices.

### 2. Create a Trip
Click "Create New Trip", enter a name (e.g., "Goa Vacation"), and add your friends' names.

### 3. Add Expenses
Create expense groups (e.g., "Hotel", "Food", "Transport") and add individual items with:
- Item name and amount
- Who paid
- Who should split the cost
- Optional: tax and discount (group-level or per-item)

**Quick Entry mode** — Switch to the "Quick Entry" tab in the Add Expense or Add Item dialog and type:
```
McDonald's
500 for all paid by Rahul on Burgers.
200 for Amit, Priya paid by Amit on Fries.
tax is 5%
discount is 10rs
```
This creates the entire expense group with items and tax/discount in one shot.

### 4. View Settlements
The app automatically calculates:
- **Net Balance** — How much each person paid vs. what they owe
- **Settlements** — Minimum transactions needed to settle up
- **Step-by-step explanation** — Understand exactly how settlements were calculated

### 5. Share with Friends
- Click **Share** on any trip
- Add specific Google emails for private view-only access
- Or enable a public link that anyone with a Google account can view
- Viewers can **Save** shared trips to their homepage

### 6. Export
- Copy settlements for WhatsApp with one click
- Export as JSON for backup, or as CSV for detailed breakdowns
- Import trips from JSON on any device

## Architecture

### Hybrid Offline-First + Cloud Sync

```
UI Components
  → React Query Hooks (useTrips, useExpenseGroups, useItems)
    → Unified Repository (local-first orchestrator)
      ├── Local Repository (Dexie/IndexedDB — instant reads/writes)
      └── Background Sync → Supabase (PostgreSQL with RLS)
```

- **Reads** always come from local IndexedDB for instant response
- **Writes** go to local first, then sync to Supabase in background (debounced)
- **On app load / back online** — full sync (push pending, pull remote changes)
- **Conflict resolution** — last-write-wins based on `updated_at` timestamps

### Project Structure

```
splitease/
├── app/                        # Next.js App Router pages
│   ├── page.tsx               # Home page (trip list + saved trips)
│   ├── [tripId]/page.tsx      # Trip detail page (owner view)
│   ├── auth/                  # Authentication
│   │   ├── page.tsx           # Google sign-in page
│   │   └── callback/route.ts  # OAuth callback handler
│   └── shared/[code]/page.tsx # Shared trip view (read-only)
├── components/                 # Shared components
│   ├── ui/                    # Shadcn UI components
│   ├── auth-provider.tsx      # Auth context (useAuth)
│   ├── sync-provider.tsx      # Sync context (useSync)
│   ├── share-trip-dialog.tsx  # Trip sharing dialog
│   ├── user-menu.tsx          # Header user avatar + sign out
│   ├── sync-status-badge.tsx  # Sync state indicator
│   ├── offline-banner.tsx     # Offline notification
│   └── migration-dialog.tsx   # First-login data migration
├── features/                   # Feature modules
│   ├── trips/                 # Trip CRUD + hooks + schemas
│   ├── expenses/              # Expense groups + tax/discount
│   ├── items/                 # Line items
│   ├── settlements/           # Settlement calculations display
│   └── summary/               # Stats, spending grid, summary table
├── database/                   # Data layer
│   ├── db.ts                  # Dexie schema (v2 with sync fields)
│   ├── local.repository.ts    # IndexedDB CRUD operations
│   ├── supabase.repository.ts # Supabase CRUD + sharing + saved trips
│   ├── unified.repository.ts  # Local-first orchestrator with background sync
│   ├── repository.interface.ts# ITripsRepository interface
│   └── mappers.ts             # DB ↔ app type converters
├── services/                   # Business logic
│   ├── settlement.service.ts  # Settlement algorithm + tax/discount calc
│   ├── export.service.ts      # CSV, JSON, WhatsApp export
│   └── template-parser.ts     # Quick Entry template parser
├── lib/                        # Shared utilities
│   ├── supabase/              # Supabase client (browser, server, middleware)
│   ├── sync/                  # Sync engine (push, pull, fullSync)
│   ├── animations.ts          # Framer Motion variants
│   └── query-client.tsx       # TanStack Query provider
├── hooks/                      # Custom hooks
│   └── useRepository.ts       # Returns unified repository with auth context
├── store/                      # Zustand UI state
├── types/                      # TypeScript type definitions
├── utils/                      # Helper functions (currency, dates, IDs)
├── middleware.ts               # Auth session refresh + route protection
├── supabase-complete-schema.sql      # Full DB schema (run for fresh setup)
└── supabase-saved-trips-migration.sql # Saved trips table migration
```

### Database Schema (Supabase)

```
profiles        — Auto-created on signup (id, email, display_name, avatar_url)
trips           — User's trips (id, user_id, name, friends[], ...)
expense_groups  — Categories within trips (tax/discount config)
items           — Line items (amount, paidBy, splitAmong[], per-item tax/discount)
trip_shares     — Sharing config (private email shares + public link codes)
saved_trips     — Bookmarked shared trips (user_id + trip_id)
```

All tables have Row Level Security (RLS) policies enforcing:
- Owners have full CRUD access to their trips and related data
- Viewers (via private share or public link) have read-only access
- Users can only manage their own saved trips

### Settlement Algorithm

1. **Calculate Net Balances** — For each person: `Paid - Should Pay = Net`
2. **Identify Debtors & Creditors** — Negative net = owes money, Positive = should receive
3. **Greedy Matching** — Match largest debtor with largest creditor, settle the minimum of both amounts
4. **Repeat** — Continue until all balances are zero

This ensures the fewest possible transactions to settle everyone up.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Supabase](https://supabase.com/) for the backend platform
- [Shadcn UI](https://ui.shadcn.com/) for the component library
- [Dexie.js](https://dexie.org/) for making IndexedDB a joy to work with

---

<p align="center">
  Made with care for splitting bills fairly
</p>
