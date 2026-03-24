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
