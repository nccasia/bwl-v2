---
description: BWL WEB V2 project folder structure and code organization conventions
alwaysApply: false
globs: apps/web/src/**
---

# Project Structure Conventions

Follow the feature-based folder structure for BWL WEB V2 project.

## Directory Pattern

```
apps/web/src/
├── app/                 # Next.js App Router pages
├── components/          # Shared UI components (ui/, cards/, dialogs/, forms/, tables/, navigates/)
├── constants/           # App constants
├── features/            # Feature-based modules - PRIMARY PATTERN
│   └── [feature-name]/
│       ├── components/
│       ├── hooks/
│       └── types/
├── hooks/               # Shared React hooks
├── lib/                 # Utilities, configs
├── services/            # API clients by domain
├── stores/              # State management by domain
├── types/               # Shared TypeScript types
├── schemas/             # Validation schemas by domain
├── enums/               # TypeScript enums
├── utils/               # Utility functions
├── i18n/                # Internationalization
├── providers/           # React context providers
└── styles/              # Global styles
```

## Feature-Based Organization Rule

**Use `features/[name]/` for feature-specific code.** This is the primary pattern.

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

## Component Placement Rules

| Component Type | Location |
|---------------|----------|
| Base/primitive UI | `components/ui/` |
| Card displays | `components/cards/` |
| Dialogs/modals | `components/dialogs/` |
| Form components | `components/forms/` |
| Tables/grids | `components/tables/` |
| Navigation | `components/navigates/` |
| Feature-specific | `features/[name]/components/` |

## Naming Conventions

All files use **kebab-case**: `lottery-manage.tsx`, `use-lottery-config.ts`, `lottery-service.ts`

- Directories: `kebab-case` (audit-logs, lottery-config)
- Components: `kebab-case` (user-profile.tsx, lottery-manage.tsx)
- Hooks: `kebab-case` with `use-` prefix (use-user-profile.ts)
- Services: `kebab-case` (auth-service.ts)
- Schemas: `kebab-case` with `-schema` suffix (login-schema.ts)

## Decision Tree for New Code

1. Is it **shared across features**?
   - Yes → Use top-level directories (`components/ui/`, `hooks/`, `types/`)
   - No → Use `features/[name]/`

2. Is it **feature-specific**?
   - Yes → Use `features/[name]/components/`, `features/[name]/hooks/`
   - No → Use shared directories

3. Does it have **sub-components**?
   - Yes → Create nested `components/` folders within the feature
   - No → Flat structure is fine
