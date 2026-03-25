---
name: bwl-web-project-structure
description: >-
  Follow the established Next.js folder structure pattern when working in bwl-v2 web project.
  Use when: (1) creating new features, pages, or components, (2) organizing code into proper directories,
  (3) deciding where to place hooks, services, types, schemas, stores, utils, or constants,
  (4) setting up feature-based modules. Triggers on any web/src work including adding files,
  creating components, or organizing imports.
---

# BWL V2 WEB PROJECT STRUCTURE PATTERN

Follow the module-based folder organization pattern with comprehensive testing requirements.

## Core Directory Structure

```
apps/web/src/
├── app/                    # Next.js App Router pages
├── modules/                # Module-based organization (KEY PATTERN)
│   ├── [module-name]/     # Feature module
│   │   ├── components/   # Module components
│   │   ├── hooks/        # Module hooks
│   │   ├── pages/        # Module pages
│   │   ├── tests/        # Module tests (co-located)
│   │   └── index.ts      # Module exports
│   └── shared/           # Shared across modules
│       ├── components/   # Shared components
│       ├── hooks/        # Shared hooks
│       └── tests/        # Shared tests
├── constants/             # App constants
├── hooks/                # Shared React hooks
├── lib/                  # Third-party configs, utilities
├── services/             # API client services by domain
│   └── [domain]/
├── stores/               # Zustand stores by domain
│   └── [domain]/
├── types/                # TypeScript types by domain
│   └── [domain]/
├── schemas/              # Valibot schemas by domain
│   └── [domain]/
├── enums/                # TypeScript enums
├── utils/                # Utility functions
├── i18n/                 # Internationalization
├── providers/            # React context providers
├── test/                 # Test setup files
│   └── setup.ts
└── styles/               # Global styles
```

## Module-Based Organization (Primary Pattern)

Each feature is a self-contained module with co-located tests.

```
modules/home/
├── components/
│   ├── demo-list.tsx
│   ├── demo-list.test.tsx
│   ├── demo-form.tsx
│   ├── demo-form.test.tsx
│   └── index.ts
├── hooks/
│   ├── use-demo-list.ts
│   └── use-demo-list.test.tsx
├── pages/
│   ├── home-page.tsx
│   └── home-page.test.tsx
├── tests/
│   ├── demo-store.test.ts
│   └── demo-service.test.ts
└── index.ts
```

## Testing Requirements (MANDATORY)

**Every new code MUST include tests.** Testing is not optional.

### Test File Co-location

Tests live alongside the code they test:

```
modules/[module]/
├── components/
│   ├── [component].tsx
│   └── [component].test.tsx    # Required
├── hooks/
│   ├── [hook].ts
│   └── [hook].test.tsx         # Required
└── tests/
    └── [store|service].test.ts
```

### Test Patterns

#### Component Testing

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DemoList } from "../components/demo-list";
import * as useDemoListModule from "../hooks/use-demo-list";
import * as demoStoreModule from "@/stores/home/demo-store";

vi.mock("../hooks/use-demo-list");
vi.mock("@/stores/home/demo-store");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "Wrapper";
  return Wrapper;
};

describe("DemoList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDemoListModule.useDemoList).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
    } as never);
  });

  it("should render list items", () => {
    render(<DemoList />, { wrapper: createWrapper() });
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
  });
});
```

#### Hook Testing

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { useDemoList } from "../hooks/use-demo-list";
import * as demoServiceModule from "@/services/home/demo-service";

vi.mock("@/services/home/demo-service");

describe("useDemoList", () => {
  it("should return demo data", async () => {
    vi.mocked(demoServiceModule.demoService.getList).mockResolvedValue(mockData);
    const { result } = renderHook(() => useDemoList(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });
});
```

#### Store Testing

```typescript
import { useDemoUIStore } from "@/stores/home/demo-store";

describe("useDemoUIStore", () => {
  it("should open form in create mode", () => {
    const { openForm } = useDemoUIStore.getState();
    openForm("create");
    expect(useDemoUIStore.getState().isFormOpen).toBe(true);
    expect(useDemoUIStore.getState().formMode).toBe("create");
  });

  it("should open form in edit mode with id", () => {
    const { openForm } = useDemoUIStore.getState();
    openForm("edit", "123");
    expect(useDemoUIStore.getState().selectedId).toBe("123");
  });
});
```

### Test Configuration

Vitest configuration at `apps/web/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "src/**/*.spec.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

Test setup at `apps/web/src/test/setup.ts`:

```typescript
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

afterEach(() => {
  cleanup();
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run web tests
pnpm test:web

# Run web tests in watch mode
pnpm test:web:watch

# Type check
pnpm type-check
```

## State Management & Data Fetching

### TanStack Query (Server State)

```typescript
// services/demo-service.ts
export const demoService = {
  getList: (params: DemoQueryParams = {}) => fetchApi<DemoListResponse>("/demos", { params }),
  getById: (id: string) => fetchApi<DemoItem>(`/demos/${id}`),
  create: (data: CreateDemoInput) => fetchApi<DemoItem>("/demos", { method: "POST", body: data }),
  update: (data: UpdateDemoInput) => fetchApi<DemoItem>(`/demos/${data.id}`, { method: "PATCH", body: data }),
  delete: (id: string) => fetchApi<void>(`/demos/${id}`, { method: "DELETE" }),
};

// hooks/use-demo-list.ts
export function useDemoList(params: DemoQueryParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.DEMO_LIST(params),
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
      toast.success("Demo created successfully");
    },
  });
}
```

### React Hook Form + Valibot (Forms)

```typescript
// schemas/demo-schema.ts
import * as v from "valibot";

export const createDemoSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2, "Name must be at least 2 characters")),
  email: v.pipe(v.string(), v.email("Invalid email format")),
  status: v.union([v.literal("active"), v.literal("inactive")]),
});

export type CreateDemoInput = v.InferInput<typeof createDemoSchema>;
```

### Zustand (Client State)

```typescript
// stores/demo-store.ts
interface DemoUIState {
  selectedId: string | null;
  isFormOpen: boolean;
  formMode: "create" | "edit";
  searchQuery: string;
  openForm: (mode: "create" | "edit", id?: string) => void;
  closeForm: () => void;
  setSearchQuery: (query: string) => void;
}

export const useDemoUIStore = create<DemoUIState>((set) => ({
  isFormOpen: false,
  formMode: "create",
  selectedId: null,
  searchQuery: "",
  openForm: (mode, id) => set({ isFormOpen: true, formMode: mode, selectedId: id ?? null }),
  closeForm: () => set({ isFormOpen: false, selectedId: null }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
```

### HeroUI Toast (Notifications)

```typescript
// modules/shared/hooks/toast/index.tsx
export function useToast() {
  return {
    success: (message: string, options?: ToastOptions) => {
      toast.success(message, { /* ... */ });
    },
    error: (message: string, options?: ToastOptions) => {
      toast.danger(message, { /* ... */ });
    },
  };
}

// Usage
const toast = useToast();
toast.success("Operation completed!");
toast.error("Something went wrong!");
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Directories | kebab-case | `home`, `demo-store`, `custom-button` |
| Components | kebab-case | `demo-list.tsx`, `home-page.tsx` |
| Hooks | kebab-case + `use-` prefix | `use-demo-list.ts` |
| Services | kebab-case | `demo-service.ts` |
| Schemas | kebab-case + `-schema` suffix | `demo-schema.ts` |
| Stores | kebab-case + `-store` suffix | `demo-store.ts` |
| Tests | Same name + `.test.{ts,tsx}` | `demo-list.test.tsx` |

## Import Aliases

```typescript
@/modules/home/components    → apps/web/src/modules/home/components
@/modules/shared/hooks        → apps/web/src/modules/shared/hooks
@/services/home               → apps/web/src/services/home
@/stores/home                 → apps/web/src/stores/home
@/types/home                  → apps/web/src/types/home
@/schemas/home                → apps/web/src/schemas/home
```

## Migration Checklist

When adding new code to bwl-v2:

- [ ] Create module in `modules/[name]/`
- [ ] Add components to `modules/[name]/components/`
- [ ] Add hooks to `modules/[name]/hooks/`
- [ ] Create tests for every component
- [ ] Create tests for every hook
- [ ] Create tests for stores
- [ ] Use `pnpm test:web` to verify tests pass
- [ ] Use `pnpm type-check` to verify no TypeScript errors

## Styling (Tailwind CSS v4 + HeroUI v3)

CSS-first approach, no Tailwind config file:

```css
/* globals.css */
@import "tailwindcss";
@plugin "@heroui/react";
@plugin "@heroui/styles";
```

HeroUI v3 migration notes:

| v2 | v3 |
|----|----|
| `color="primary"` | `variant="primary"` or `color="accent"` |
| `classNames={{}}` | `className` (string) |
| `text-tiny` | `text-xs` |
| `rounded-small` | `rounded-sm` |
| Provider required | **No Provider needed** |
