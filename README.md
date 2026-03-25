# BWL - Next Generation Meme Social Media Platform

A monorepo containing the BWL platform built with Nx, featuring a Next.js frontend and NestJS backend.

## Tech Stack

### Frontend (apps/web)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS
- **UI Components**: HeroUI v3
- **State Management**: TanStack Query
- **Testing**: Vitest + React Testing Library

### Backend (apps/server)
- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **ORM**: TypeORM with PostgreSQL
- **Authentication**: Passport.js (JWT + OTP)
- **API Documentation**: Swagger
- **Job Queue**: BullMQ
- **Email**: Nodemailer with Handlebars
- **Testing**: Jest + TestingModule

### Shared
- **Monorepo Tool**: Nx 22.x
- **Package Manager**: pnpm 10.x
- **Linting**: ESLint + Prettier

## Project Structure

```
bwl-v2/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/           # App router pages
│   │   │   ├── components/    # React components
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── services/      # API services
│   │   │   ├── stores/        # State stores
│   │   │   ├── schemas/       # Zod schemas
│   │   │   ├── types/         # TypeScript types
│   │   │   └── utils/         # Utilities
│   │   └── ...
│   └── server/                 # NestJS backend
│       ├── src/
│       │   ├── base/          # Shared utilities
│       │   ├── configs/       # Configuration
│       │   ├── constants/     # Global constants
│       │   ├── enums/         # Global enums
│       │   ├── migrations/    # TypeORM migrations
│       │   ├── modules/       # Feature modules
│       │   └── templates/     # Email templates
│       └── ...
├── libs/
│   └── utils/                  # Shared utilities library
├── docs/                       # Documentation
│   ├── BWLV2_SERVER.MD        # Server documentation
│   └── BWLV2_WEB.MD           # Web documentation
├── .agents/
│   ├── rules/                 # Project rules
│   └── skills/                # Project skills
├── nx.json                     # Nx configuration
├── package.json                # Root package.json
└── tsconfig.base.json          # Base TypeScript config
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10.x
- PostgreSQL (for server)
- Redis (for job queues)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment files
cp apps/web/.env.example apps/web/.env
cp apps/server/.env.example apps/server/.env
```

### Development

```bash
# Run both apps in development mode
pnpm dev

# Run only web (frontend)
pnpm dev:web

# Run only server (backend)
pnpm dev:server

# Run server with migration
pnpm migration:run
```

### Build

```bash
# Build all apps
pnpm build

# Build only web
pnpm build:web

# Build only server
pnpm build:server
```

### Testing

```bash
# Run all tests
pnpm test

# Run web tests only
pnpm test:web

# Run server tests only
pnpm test:server

# Run web tests in watch mode
pnpm test:web:watch
```

### Linting & Type Checking

```bash
# Lint all apps
pnpm lint

# Type check all apps
pnpm type-check
```

### Database Migrations

```bash
# Run pending migrations
pnpm migration:run

# Generate a new migration
pnpm migration:generate src/migrations/MigrationName

# Revert last migration
pnpm migration:revert
```

## Documentation

- [Server Documentation](./docs/BWLV2_SERVER.MD) - Backend API, entities, services, patterns
- [Web Documentation](./docs/BWLV2_WEB.MD) - Frontend components, hooks, state management
- [Server Rules](./.agents/rules/server-project-structure.mdc) - Server conventions
- [Server Skill](./.agents/skills/bwl-server-project/SKILL.md) - Server development guide
- [Web Rules](./.agents/rules/web-project-structure.mdc) - Web conventions
- [Web Skill](./.agents/skills/bwl-web-project/SKILL.md) - Web development guide

## API Documentation

When the server is running, Swagger documentation is available at:

```
http://localhost:3000/api/docs
```

## Environment Variables

### Web (apps/web/.env)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Server (apps/server/.env)

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=bwl

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Mail
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=user
MAIL_PASSWORD=password
```

## Scripts Reference

| Script | Description |
|--------|-------------|
| `pnpm dev` | Run both apps in dev mode |
| `pnpm build` | Build all apps |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all apps |
| `pnpm type-check` | Type check all apps |
| `pnpm migration:run` | Run database migrations |
| `pnpm clean` | Remove build artifacts |

## License

MIT
