# SplitEase Implementation Summary

A comprehensive guide to how each technology is implemented in the SplitEase bill-splitting application.

## Tech Stack Overview

| Technology | Purpose | Implementation Location |
|------------|---------|------------------------|
| Next.js 16 | Framework & Routing | `app/` directory |
| TypeScript | Type Safety | Throughout codebase |
| Tailwind CSS | Styling | `app/globals.css`, components |
| Shadcn UI | UI Components | `components/ui/` |
| Zustand | State Management | `store/` |
| TanStack Query | Data Fetching | `features/*/hooks/` |
| React Hook Form | Form Management | Dialog components |
| Zod | Schema Validation | `features/*/schemas/` |
| Dexie | IndexedDB Storage | `database/` |
| Framer Motion | Animations | Components & `lib/animations.ts` |

---

## 1. Next.js App Router

### Implementation
- **App Directory Structure**: Uses Next.js 16 App Router with file-based routing
- **Server Components**: Layout is a server component; pages are client components
- **Dynamic Routes**: `app/[tripId]/page.tsx` for individual trip pages

### Key Files
```
app/
├── layout.tsx      # Root layout with providers
├── page.tsx        # Home page (trip list)
├── globals.css     # Global styles with CSS variables
└── [tripId]/
    └── page.tsx    # Trip detail page
```

### Usage Example
```typescript
// app/[tripId]/page.tsx
export default function TripPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  // ...
}
```

---

## 2. TypeScript

### Implementation
- **Strict Mode**: Enabled in `tsconfig.json`
- **Type Definitions**: Centralized in `types/` directory
- **Path Aliases**: `@/*` configured for clean imports

### Key Types
```typescript
// types/trip.types.ts
interface Trip {
  id: string;
  name: string;
  friends: string[];
  subTopics: ExpenseGroup[];
  createdAt: string;
  googleSheetUrl: string | null;
}

// types/item.types.ts
interface Item {
  id: string;
  name: string;
  amount: number;
  paidBy: string;
  splitAmong: string[];
}
```

---

## 3. Tailwind CSS

### Implementation
- **Version**: Tailwind CSS 4 with PostCSS
- **CSS Variables**: HSL-based color system for theming
- **Dark Theme**: Default theme with emerald/cyan accent colors

### Configuration
```css
/* app/globals.css */
@layer base {
  .dark {
    --background: 222 47% 5%;
    --foreground: 210 40% 98%;
    --primary: 160 84% 39%;
    /* ... */
  }
}
```

### Usage
- Utility classes for styling
- Gradient backgrounds: `bg-gradient-to-r from-primary to-cyan-500`
- Hover states: `hover:bg-primary/20`

---

## 4. Shadcn UI

### Implementation
- **Components**: Pre-built, customizable components in `components/ui/`
- **Styling**: Uses `cn()` utility for class merging
- **Variants**: Customized with Tailwind classes

### Components Used
| Component | Usage |
|-----------|-------|
| Button | Actions, form submissions |
| Card | Trip cards, expense groups, stats |
| Dialog | All modals/dialogs |
| Input | Form inputs |
| Table | Summary table, item table |
| Badge | Friend tags, labels |
| Label | Form labels |
| Checkbox | Split selection |

### Usage Example
```tsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent>
    <Button variant="outline">Click me</Button>
  </DialogContent>
</Dialog>
```

---

## 5. Zustand

### Implementation
- **Store Location**: `store/ui.store.ts`
- **Use Case**: UI state management (modals, expanded items, excluded groups)
- **Pattern**: Single store with actions

### Store Structure
```typescript
// store/ui.store.ts
interface UIState {
  // Dialog states
  createTripDialogOpen: boolean;
  editTripDialogOpen: boolean;
  // ...

  // Expanded/Excluded groups (stored as arrays)
  expandedExpenseGroups: string[];
  excludedExpenseGroups: string[];

  // Actions
  openCreateTripDialog: () => void;
  toggleExpandedExpenseGroup: (id: string) => void;
  // ...
}

export const useUIStore = create<UIState>((set) => ({
  createTripDialogOpen: false,
  openCreateTripDialog: () => set({ createTripDialogOpen: true }),
  // ...
}));
```

### Usage
```tsx
const { createTripDialogOpen, openCreateTripDialog } = useUIStore();
```

---

## 6. TanStack Query

### Implementation
- **Provider**: `lib/query-client.tsx` wraps app in `QueryClientProvider`
- **Hooks**: Custom hooks in `features/*/hooks/` for each entity
- **Caching**: 60-second stale time configured

### Query Keys Pattern
```typescript
// features/trips/hooks/useTrips.ts
export const tripKeys = {
  all: ["trips"] as const,
  detail: (id: string) => ["trips", id] as const,
};
```

### Custom Hooks
```typescript
// Query hook
export function useTrips() {
  return useQuery({
    queryKey: tripKeys.all,
    queryFn: () => tripsRepository.getAll(),
  });
}

// Mutation hook
export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tripsRepository.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
    },
  });
}
```

---

## 7. React Hook Form

### Implementation
- **Integration**: Used with Zod via `@hookform/resolvers`
- **Location**: Dialog components for all forms
- **Pattern**: Controlled form with validation

### Usage Example
```tsx
// features/trips/components/CreateTripDialog.tsx
const {
  register,
  handleSubmit,
  watch,
  setValue,
  formState: { errors },
  reset,
} = useForm<CreateTripFormData>({
  resolver: zodResolver(createTripSchema),
  defaultValues: {
    name: "",
    friends: [],
  },
});

// In JSX
<Input {...register("name")} placeholder="Trip name" />
{errors.name && <p>{errors.name.message}</p>}
```

---

## 8. Zod

### Implementation
- **Location**: `features/*/schemas/` directories
- **Integration**: Combined with React Hook Form
- **Pattern**: Schema-first validation

### Schema Examples
```typescript
// features/trips/schemas/trip.schema.ts
export const createTripSchema = z.object({
  name: z.string()
    .min(1, "Trip name is required")
    .max(100, "Trip name is too long"),
  friends: z.array(z.string().min(1))
    .min(2, "Add at least 2 friends"),
});

// features/items/schemas/item.schema.ts
export const createItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  paidBy: z.string().min(1, "Please select who paid"),
  splitAmong: z.array(z.string()).min(1, "Select at least one person"),
});
```

---

## 9. Dexie (IndexedDB)

### Implementation
- **Database**: `database/db.ts` defines schema
- **Repository**: `database/trips.repository.ts` handles CRUD
- **Tables**: Single `trips` table storing all data

### Database Schema
```typescript
// database/db.ts
export class SplitEaseDB extends Dexie {
  trips!: Table<Trip, string>;

  constructor() {
    super("SplitEaseDB");
    this.version(1).stores({
      trips: "id, name, createdAt",
    });
  }
}

export const db = new SplitEaseDB();
```

### Repository Pattern
```typescript
// database/trips.repository.ts
export const tripsRepository = {
  async getAll(): Promise<Trip[]> {
    return db.trips.orderBy("createdAt").reverse().toArray();
  },

  async create(data: TripCreate): Promise<Trip> {
    const trip: Trip = { /* ... */ };
    await db.trips.add(trip);
    return trip;
  },

  async addItem(tripId, expenseGroupId, data): Promise<Item | undefined> {
    const trip = await db.trips.get(tripId);
    // Modify nested structure
    await db.trips.put(trip);
    return item;
  },
};
```

### Key Difference from localStorage
- **Async Operations**: All database operations are async
- **Structured Data**: IndexedDB handles larger datasets efficiently
- **Indexing**: Can query by `id`, `name`, or `createdAt`

---

## 10. Framer Motion

### Implementation
- **Variants**: Defined in `lib/animations.ts`
- **Components**: Applied to cards, lists, dialogs
- **Features**: Page transitions, stagger animations, expand/collapse

### Animation Variants
```typescript
// lib/animations.ts
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.05 },
  },
};
```

### Usage Examples

#### Stagger Animation (Trip Grid)
```tsx
<motion.div
  variants={staggerContainer}
  initial="initial"
  animate="animate"
>
  {trips.map((trip) => (
    <motion.div key={trip.id} variants={staggerItem}>
      <TripCard trip={trip} />
    </motion.div>
  ))}
</motion.div>
```

#### Expand/Collapse Animation
```tsx
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
    >
      {children}
    </motion.div>
  )}
</AnimatePresence>
```

#### Hover Animation
```tsx
<motion.div
  whileHover={{ scale: 1.02, y: -4 }}
  whileTap={{ scale: 0.98 }}
>
  <Card>...</Card>
</motion.div>
```

---

## Project Structure

```
splitease/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout with providers
│   ├── page.tsx              # Home page
│   ├── globals.css           # Global styles
│   └── [tripId]/
│       └── page.tsx          # Trip detail page
├── components/
│   └── ui/                   # Shadcn UI components
├── features/                 # Feature modules
│   ├── trips/
│   │   ├── components/       # Trip-related components
│   │   ├── hooks/            # TanStack Query hooks
│   │   └── schemas/          # Zod schemas
│   ├── expenses/
│   ├── items/
│   ├── settlements/
│   └── summary/
├── hooks/                    # Shared custom hooks
├── services/                 # Business logic
│   ├── settlement.service.ts # Settlement calculations
│   └── export.service.ts     # CSV/JSON export
├── store/                    # Zustand stores
│   └── ui.store.ts
├── database/                 # Dexie setup
│   ├── db.ts                 # Database schema
│   └── trips.repository.ts   # CRUD operations
├── utils/                    # Utility functions
├── types/                    # TypeScript types
└── lib/                      # Shared libraries
    ├── utils.ts              # cn() utility
    ├── query-client.tsx      # TanStack Query provider
    └── animations.ts         # Framer Motion variants
```

---

## Data Flow

```
User Action → React Hook Form (validation)
           → Zod Schema (validation)
           → TanStack Query Mutation
           → Dexie Repository (IndexedDB)
           → Query Invalidation
           → UI Update
```

---

## Key Features

1. **Offline-First**: All data stored locally in IndexedDB
2. **Type-Safe**: Full TypeScript coverage with strict mode
3. **Responsive**: Mobile-first design with Tailwind
4. **Animated**: Smooth transitions with Framer Motion
5. **Validated**: Schema-based validation with Zod
6. **Optimized**: Efficient data fetching with TanStack Query

---

## Running the Project

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The app will be available at `http://localhost:3000`.
