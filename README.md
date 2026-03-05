<p align="center">
  <img src="public/logo.png" alt="SplitEase Logo" width="120" height="120" />
</p>

<h1 align="center">SplitEase</h1>

<p align="center">
  <strong>Split bills, not friendships.</strong>
</p>

<p align="center">
  A modern, offline-first expense splitting app for group trips and shared expenses.
  <br />
  Track who paid what, split costs fairly, and settle up with minimal transactions.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#usage">Usage</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Features

- **Trip Management** — Create trips, add friends, and organize expenses by category
- **Smart Settlements** — Algorithm minimizes the number of transactions needed to settle up
- **Explainable Calculations** — See exactly how settlements are calculated with step-by-step breakdowns
- **Tax Support** — Add tax percentages to expense groups with proportional distribution
- **Offline-First** — All data stored locally in your browser using IndexedDB
- **Import/Export** — Back up trips as JSON files and import them anytime
- **WhatsApp Ready** — Copy settlements in a format ready to share with friends
- **Dark/Light Mode** — Beautiful UI that adapts to your preference
- **Privacy Focused** — No accounts, no servers, your data stays on your device

## Tech Stack

| Category | Technologies |
|----------|-------------|
| Framework | [Next.js 16](https://nextjs.org/) with App Router |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| UI Components | [Shadcn UI](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| State Management | [Zustand](https://zustand-demo.pmnd.rs/) |
| Data Fetching | [TanStack Query](https://tanstack.com/query) |
| Database | [Dexie.js](https://dexie.org/) (IndexedDB) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Icons | [Lucide React](https://lucide.dev/) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/splitease.git

# Navigate to the project
cd splitease

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Usage

### 1. Create a Trip
Click "Create New Trip", enter a name (e.g., "Goa Vacation"), and add your friends' names.

### 2. Add Expenses
Create expense groups (e.g., "Hotel", "Food", "Transport") and add individual items with:
- Item name
- Amount
- Who paid
- Who should split the cost

### 3. View Settlements
The app automatically calculates:
- **Net Balance** — How much each person paid vs. what they owe
- **Settlements** — Minimum transactions needed to settle up
- **Step-by-step explanation** — Understand exactly how settlements were calculated

### 4. Share & Export
- Copy settlements for WhatsApp with one click
- Export the entire trip as JSON for backup
- Import trips on any device

## Project Structure

```
splitease/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page (trip list)
│   └── [tripId]/page.tsx  # Trip detail page
├── components/            # Shared UI components
│   ├── ui/               # Shadcn UI components
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── features/              # Feature modules
│   ├── trips/            # Trip management
│   ├── expenses/         # Expense groups
│   ├── items/            # Line items
│   ├── settlements/      # Settlement calculations
│   └── summary/          # Stats & summaries
├── database/              # Dexie IndexedDB setup
├── services/              # Business logic
├── store/                 # Zustand state
├── types/                 # TypeScript types
└── utils/                 # Helper functions
```

## How Settlements Work

SplitEase uses a greedy algorithm to minimize transactions:

1. **Calculate Net Balances** — For each person: `Paid - Should Pay = Net`
2. **Identify Debtors & Creditors** — Negative net = owes money, Positive = should receive
3. **Greedy Matching** — Match largest debtor with largest creditor, settle the minimum of both amounts
4. **Repeat** — Continue until all balances are zero

This ensures the fewest possible transactions to settle everyone up.

## Screenshots

<p align="center">
  <img src="public/screenshots/home-dark.png" alt="Home Page Dark" width="45%" />
  <img src="public/screenshots/home-light.png" alt="Home Page Light" width="45%" />
</p>

<p align="center">
  <img src="public/screenshots/trip-detail.png" alt="Trip Detail" width="45%" />
  <img src="public/screenshots/settlements.png" alt="Settlements" width="45%" />
</p>

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

- [Shadcn UI](https://ui.shadcn.com/) for the beautiful component library
- [Dexie.js](https://dexie.org/) for making IndexedDB a joy to work with

---

<p align="center">
  Made with ❤️ for splitting bills fairly
</p>
