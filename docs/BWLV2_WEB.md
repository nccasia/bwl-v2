# BWL V2 Web Project Documentation

## Overview

BWL V2 Web is a Next.js 16 application built with TypeScript, featuring a module-based architecture with comprehensive testing.

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 16.2.1 |
| UI Library | HeroUI | 3.0.1 |
| Styling | Tailwind CSS | 4.2.2 |
| Forms | React Hook Form + Valibot | 7.72.0 / 1.3.1 |
| Data Fetching | TanStack Query | 5.95.2 |
| State | Zustand | 5.0.12 |
| i18n | next-intl | 4.8.3 |
| Testing | Vitest + Testing Library | 3.0.0 / 16.0.0 |

## Project Structure

```
apps/web/src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css         # Global styles
├── modules/               # Module-based organization
│   ├── home/              # Home module (demo feature)
│   │   ├── components/    # Module components
│   │   ├── hooks/         # Module hooks
│   │   ├── pages/         # Module pages
│   │   └── tests/         # Module tests
│   └── shared/            # Shared across modules
│       ├── components/    # Shared components
│       ├── hooks/         # Shared hooks
│       └── tests/         # Shared tests
├── constants/             # App constants
├── hooks/                 # Shared React hooks
├── i18n/                  # Internationalization
├── libs/                  # Utilities, configs
├── providers/             # React context providers
├── schemas/               # Validation schemas
├── services/              # API client services
├── stores/                # Zustand stores
├── test/                  # Test setup
│   └── setup.ts
├── types/                 # TypeScript types
└── utils/                 # Utility functions
```

## Core Patterns

### 1. Module Organization

Each feature is a self-contained module in `modules/[name]/`:

```
modules/home/
├── components/
│   ├── demo-list.tsx
│   ├── demo-form.tsx
│   └── index.ts
├── hooks/
│   ├── use-demo-list.ts
│   └── index.ts
├── pages/
│   ├── home-page.tsx
│   └── index.ts
└── tests/
    ├── demo-list.test.tsx
    ├── demo-form.test.tsx
    └── use-demo-list.test.tsx
```

### 2. Query Keys (Centralized)

```typescript
// constants/query-key.ts
export const QUERY_KEYS = {
  DEMO: {
    getKey: () => ["demo"],
    invalidate: () => ["demo"],
  },
  DEMO_LIST: {
    getKey: (params?: Record<string, unknown>) => ["demo", "list", params],
    invalidate: () => ["demo", "list"],
  },
  DEMO_ITEM: {
    getKey: (id: string | null) => ["demo", "item", id],
    invalidate: () => ["demo", "item"],
  },
};
```

### 3. Services (Data Layer)

```typescript
// services/demo-service.ts
export const demoService = {
  getList: async (params: DemoQueryParams = {}): Promise<DemoListResponse> => { /* ... */ },
  getById: async (id: string): Promise<DemoItem | null> => { /* ... */ },
  create: async (data: CreateDemoInput): Promise<DemoItem> => { /* ... */ },
  update: async (data: UpdateDemoInput): Promise<DemoItem> => { /* ... */ },
  delete: async (id: string): Promise<void> => { /* ... */ },
};
```

### 4. Hooks (TanStack Query)

```typescript
// modules/home/hooks/use-demo-list.ts
export function useDemoList(params: DemoQueryParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.DEMO_LIST.getKey(params),
    queryFn: () => demoService.getList(params),
  });
}

export function useCreateDemo() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: CreateDemoInput) => demoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DEMO.getKey() });
      toast.success('Demo created successfully');
    },
  });
}
```

### 5. Validation Schemas (Valibot)

```typescript
// schemas/demo-schema.ts
import * as v from 'valibot';

export const createDemoSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2, 'Name must be at least 2 characters')),
  email: v.pipe(v.string(), v.email('Invalid email format')),
  status: v.union([v.literal('active'), v.literal('inactive')]),
});

export type CreateDemoInput = v.InferInput<typeof createDemoSchema>;
```

### 6. Forms (React Hook Form + Valibot)

```typescript
// components/demo-form.tsx
const form = useForm({
  resolver: valibotResolver(createDemoSchema),
  defaultValues: { name: '', email: '', status: 'active' },
});

const onSubmit = (data: CreateDemoFormData) => {
  createDemo.mutate(data, { onSuccess: closeForm });
};
```

### 7. Client State (Zustand)

```typescript
// stores/demo-store.ts
interface DemoUIState {
  selectedId: string | null;
  isFormOpen: boolean;
  formMode: 'create' | 'edit';
  openForm: (mode: 'create' | 'edit', id?: string) => void;
  closeForm: () => void;
}

export const useDemoUIStore = create<DemoUIState>((set) => ({
  isFormOpen: false,
  openForm: (mode, id) => set({ isFormOpen: true, formMode: mode, selectedId: id }),
  closeForm: () => set({ isFormOpen: false, selectedId: null }),
}));
```

### 8. Toast Notifications

```typescript
// modules/shared/hooks/toast/index.tsx
export function useToast() {
  return {
    success: (message: string, options?: ToastOptions) => { /* ... */ },
    error: (message: string, options?: ToastOptions) => { /* ... */ },
    warning: (message: string, options?: ToastOptions) => { /* ... */ },
    info: (message: string, options?: ToastOptions) => { /* ... */ },
  };
}

// Usage
const toast = useToast();
toast.success('Operation completed!');
toast.error('Something went wrong');
```

## Commands

```bash
# Development
pnpm dev                  # Start dev server
pnpm build                # Production build
pnpm start                # Start production server

# Code Quality
pnpm lint                # Run ESLint
pnpm type-check           # Run TypeScript checks

# Testing
pnpm test                 # Run all tests
pnpm test:web           # Run web tests
pnpm test:web:watch     # Run tests in watch mode
pnpm test:coverage       # Run with coverage
```

## Import Aliases

| Alias | Path |
|-------|------|
| `@/` | `apps/web/src/` |
| `@/modules/*` | `apps/web/src/modules/*` |
| `@/services/*` | `apps/web/src/services/*` |
| `@/stores/*` | `apps/web/src/stores/*` |
| `@/types/*` | `apps/web/src/types/*` |
| `@/schemas/*` | `apps/web/src/schemas/*` |

## Testing

### Test Structure

Tests are co-located with the code they test:

```
modules/home/
├── components/
│   ├── demo-list.tsx
│   └── demo-list.test.tsx    # Component tests
├── hooks/
│   ├── use-demo-list.ts
│   └── use-demo-list.test.tsx    # Hook tests
└── tests/
    ├── demo-store.test.ts    # Store tests
    └── demo-service.test.ts  # Service tests
```

### Test Utilities

```typescript
// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "Wrapper";
  return Wrapper;
};
```

### Example Test

```typescript
// components/demo-list.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DemoList } from "../components/demo-list";

vi.mock("../hooks/use-demo-list");
vi.mock("@/stores/home/demo-store");

describe("DemoList", () => {
  beforeEach(() => {
    vi.mocked(useDemoListModule.useDemoList).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      isSuccess: true,
    } as never);
  });

  it("should render list items", () => {
    render(<DemoList />, { wrapper: createWrapper() });
    expect(screen.getByText("Items")).toBeInTheDocument();
  });
});
```

## Provider Setup

### App Providers

```typescript
// providers/app-providers.tsx
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <Toast.Provider placement="top"/>
      {children}
    </QueryProvider>
  );
}
```

### Query Provider

```typescript
// providers/query-provider.tsx
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## Styling

### Tailwind CSS v4 (CSS-first)

```css
/* globals.css */
@import "tailwindcss";
@import "@heroui/styles";
```

### HeroUI v3 Migration Notes

| v2 Pattern | v3 Pattern |
|------------|-------------|
| `color="primary"` | `variant="primary"` or `color="accent"` |
| `classNames={{}}` | `className` (string) |
| `text-tiny` | `text-xs` |
| Provider required | **No Provider needed** |

## Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start Next.js development server |
| `build` | Create production build |
| `start` | Start production server |
| `lint` | Run ESLint |
| `type-check` | Run TypeScript type checking |
| `test` | Run Vitest tests |
| `test:coverage` | Run tests with coverage |
| `test:ui` | Run tests with UI |
