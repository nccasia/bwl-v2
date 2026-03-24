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

Follow the feature-based folder organization pattern inspired by cryptoishtar-admin.

## Core Directory Structure

```
apps/web/src/
├── app/                    # Next.js App Router pages
├── components/             # Shared/reusable UI components
│   ├── ui/                # Base UI components (buttons, inputs, etc.)
│   ├── cards/
│   ├── dialogs/
│   ├── forms/
│   ├── tables/
│   └── navigates/
├── constants/              # App-wide constants
├── features/               # Feature-based modules (KEY PATTERN)
│   └── [feature-name]/
│       ├── components/    # Feature-specific components
│       │   └── [component-name]/
│       ├── hooks/         # Feature-specific hooks
│       └── types/         # Feature-specific types
├── hooks/                  # Shared/custom React hooks
├── lib/                    # Third-party library configs, utilities
├── services/               # API client services
│   └── [domain]/
├── stores/                 # State management stores
│   └── [domain]/
├── types/                  # Shared TypeScript types
├── schemas/                # Zod/validation schemas
│   └── [domain]/
├── enums/                  # TypeScript enums
├── utils/                  # Utility functions
├── i18n/                   # Internationalization
├── providers/              # React context providers
└── styles/                 # Global styles
```

## Key Patterns

### Feature-Based Organization (Primary Pattern)

When creating a new feature/domain:

1. Create a `features/[feature-name]/` folder
2. Within the feature, co-locate related code:

```
features/auth/
├── components/
│   ├── LoginForm.tsx
│   └── 2fa/
├── hooks/
│   └── useAuth.ts
└── types/
    └── auth.ts
```

3. Add the feature's pages to `app/[feature-name]/`

### Domain-Based Subfolders

When a feature has multiple subdomains, create nested structures:

```
features/lottery/
├── components/
│   ├── lottery-manage/
│   └── settings/
└── hooks/
    ├── lottery-config/
    └── lottery-manage/
```

### Shared vs Feature Code

| Category | Location | When to Use |
|----------|----------|-------------|
| Cross-feature UI | `components/ui/` | Base components (Button, Input, Modal) |
| Cross-feature hooks | `hooks/` | Generic logic (useToast, useAuth) |
| Cross-feature types | `types/` | Shared interfaces (ApiResponse, Pagination) |
| Feature-specific | `features/[name]/` | Any code tied to one feature |
| API services | `services/[domain]/` | API calls organized by domain |

### Component Organization

Components should be grouped by purpose:

- `components/ui/` - Base, reusable primitives
- `components/cards/` - Card-based display components
- `components/dialogs/` - Modal/dialog components
- `components/forms/` - Form-specific components
- `components/tables/` - Table/data grid components
- `components/navigates/` - Navigation components

### Naming Conventions

All files use **kebab-case**: `lottery-manage.tsx`, `use-lottery-config.ts`, `lottery-service.ts`

- Directories: kebab-case (`lottery-config`, `audit-logs`)
- Components: kebab-case (`lottery-manage.tsx`, `user-profile.tsx`)
- Hooks: kebab-case with `use-` prefix (`use-lottery-config.ts`)
- Services: kebab-case (`lottery-service.ts`)
- Schemas: kebab-case with `-schema` suffix (`lottery-schema.ts`)

## Migration Checklist

When adding new code to bwl-v2:

- [ ] Is this feature-specific? → Use `features/[name]/`
- [ ] Is this shared across features? → Use top-level directories
- [ ] Does it have sub-components? → Create nested `components/` folders
- [ ] Does it need feature-specific hooks? → Add to `features/[name]/hooks/`

## State Management & Data Fetching Libraries

The project uses these libraries. Always use them according to the patterns below.

### TanStack Query (Server State)

Use TanStack Query for all server state management (API calls, caching, mutations).

```typescript
// services/user-service.ts
import { fetchApi } from '@/lib/fetch-api';

export const userService = {
  getList: (params: UserQueryParams) =>
    fetchApi<UserListResponse>('/users', { params }),

  getById: (id: string) =>
    fetchApi<UserResponse>(`/users/${id}`),

  create: (data: CreateUserInput) =>
    fetchApi<UserResponse>('/users', { method: 'POST', body: data }),

  update: (id: string, data: UpdateUserInput) =>
    fetchApi<UserResponse>(`/users/${id}`, { method: 'PATCH', body: data }),

  delete: (id: string) =>
    fetchApi<void>(`/users/${id}`, { method: 'DELETE' }),
};
```

```typescript
// features/user/hooks/use-user-list.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user-service';
import type { UserQueryParams, CreateUserInput } from '@/types/user';

export function useUserList(params: UserQueryParams) {
  return useQuery({
    queryKey: ['users', 'list', params],
    queryFn: () => userService.getList(params),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserInput) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

### React Hook Form + Valibot (Forms)

Use react-hook-form with valibot for form handling and validation.

```typescript
// schemas/user-schema.ts
import * as v from 'valibot';

export const createUserSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2, 'Name must be at least 2 characters')),
  email: v.pipe(v.string(), v.email('Invalid email format')),
});

export type CreateUserInput = v.InferInput<typeof createUserSchema>;
```

```typescript
// features/user/components/create-user-form.tsx
import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { createUserSchema } from '@/features/user/schemas/user-schema';

export function CreateUserForm() {
  const form = useForm({
    resolver: valibotResolver(createUserSchema),
    defaultValues: { name: '', email: '' },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Zustand (Client State)

Use Zustand for client-side state that doesn't need server sync.

```typescript
// stores/ui-store.ts
import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
```

```typescript
// Usage in component
import { useUIStore } from '@/stores/ui-store';

function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  // ...
}
```

### HeroUI Toast (Notifications)

Use HeroUI toast for notifications. The app wraps HeroUI with a custom toast context.

```typescript
// providers/toast-provider.tsx (already set up)
import { Toast } from '@heroui/react';

export function ToastProvider({ children }) {
  return (
    <Toast.Provider maxVisibleToasts={5} placement="top end">
      {children}
    </Toast.Provider>
  );
}
```

```typescript
// hooks/toast/index.ts
import { useContext } from 'react';
import { ToastContext } from '@/providers/toast-provider';

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}
```

```typescript
// Usage in components
import { useToast } from '@/hooks/toast';

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Operation completed!');
  };

  const handleError = () => {
    toast.error('Something went wrong!');
  };

  const handlePromise = () => {
    toast.promise(saveData(), {
      loading: 'Saving...',
      success: 'Saved successfully!',
      error: (err) => `Failed: ${err.message}`,
    });
  };

  return (/* ... */);
}
```

## Required Imports Pattern

Always use path aliases:

| Alias | Path |
|-------|------|
| `@/` | `apps/web/src/` |
| `@/components/` | `apps/web/src/components/` |
| `@/features/` | `apps/web/src/features/` |
| `@/hooks/` | `apps/web/src/hooks/` |
| `@/lib/` | `apps/web/src/lib/` |
| `@/services/` | `apps/web/src/services/` |
| `@/stores/` | `apps/web/src/stores/` |
| `@/types/` | `apps/web/src/types/` |
| `@/schemas/` | `apps/web/src/schemas/` |
| `@/utils/` | `apps/web/src/utils/` |
