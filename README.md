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

Copy the example files before running the apps:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/server/.env.example apps/server/.env
```

For production, use `apps/web/.env` (or your host's env injection) and `apps/server/.env`.

### Web (`apps/web/.env.example`)

```env
API_BASE_URL=https://api-bwl.example.com
NEXT_PUBLIC_API_BASE_URL=${API_BASE_URL}
BETTER_AUTH_SECRET=better-auth-secret
NEXT_PUBLIC_APP_URL=https://bwl.example.com
REDIRECT_URI=https://bwl.example.com/auth/callback
MEZON_CLIENT_ID=mezon-client-id
MEZON_CLIENT_SECRET=mezon-client-secret
```

| Variable | Required | Description |
|----------|----------|-------------|
| `API_BASE_URL` | Yes | Base URL of the NestJS API. Used by server-side requests in the web app. |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Public API base URL exposed to the browser. Usually the same as `API_BASE_URL`. |
| `BETTER_AUTH_SECRET` | Yes | Secret for Better Auth session signing. Use a long random string (32+ characters). |
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL of the web app. Used for OAuth redirects and auth client base URL. |
| `REDIRECT_URI` | Yes | Mezon OAuth callback URL. Must match the redirect URI registered in Mezon (`{NEXT_PUBLIC_APP_URL}/auth/callback`). |
| `MEZON_CLIENT_ID` | Yes | Mezon OAuth client ID. |
| `MEZON_CLIENT_SECRET` | Yes | Mezon OAuth client secret. Quote the value if it contains special characters. |

Local development example:

```env
API_BASE_URL=http://localhost:5100
NEXT_PUBLIC_API_BASE_URL=http://localhost:5100
BETTER_AUTH_SECRET=local-dev-better-auth-secret-min-32-chars
NEXT_PUBLIC_APP_URL=http://localhost:3000
REDIRECT_URI=http://localhost:3000/auth/callback
MEZON_CLIENT_ID=mezon-client-id
MEZON_CLIENT_SECRET=mezon-client-secret
```

### Server (`apps/server/.env.example`)

```env
# App
PORT=5100
NODE_ENV=development
EXTEND_CORS="http://localhost:3000,https://bwl.example.com"

# Database
DATABASE_USERNAME=DATABASE_USERNAME
DATABASE_PASSWORD=DATABASE_PASSWORD
DATABASE_HOST=DATABASE_HOST
DATABASE_PORT=5432
DATABASE_NAME=DATABASE_NAME

# JWT
JWT_SECRET=JWT_SECRET

# REDIS
REDIS_URL=redis://localhost:6379

# S3 Storage
S3_API_ENDPOINT=https://s3-api-endpoint.example.com
S3_CDN_ENDPOINT=https://s3-cdn-endpoint.example.com
S3_ACCESS_KEY_ID='S3_ACCESS_KEY_ID'
S3_SECRET_ACCESS_KEY='S3_SECRET_ACCESS_KEY'
S3_BUCKET_NAME=nestjs-template
S3_FOLDER=bwl

# Mezon Bot
MEZON_BOT_ID=MEZON_BOT_ID
MEZON_BOT_TOKEN=MEZON_BOT_TOKEN
WHITELIST_CHANNEL_IDS=channel_id_1,channel_id_2
```

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | API server port. Default: `5100`. |
| `NODE_ENV` | No | Runtime environment. Use `production` in production. |
| `EXTEND_CORS` | No | Additional allowed CORS origins. `http://localhost:3000` is allowed by default. Separate extra origins with `;`. |
| `DATABASE_USERNAME` | Yes | PostgreSQL username. |
| `DATABASE_PASSWORD` | Yes | PostgreSQL password. |
| `DATABASE_HOST` | Yes | PostgreSQL host. |
| `DATABASE_PORT` | No | PostgreSQL port. Default: `5432`. |
| `DATABASE_NAME` | Yes | PostgreSQL database name. |
| `JWT_SECRET` | Yes | Secret used to sign API access tokens. |
| `REDIS_URL` | Yes | Redis connection URL for cache and BullMQ queues. |
| `S3_API_ENDPOINT` | Yes | S3-compatible storage API endpoint. |
| `S3_CDN_ENDPOINT` | Yes | Public CDN/base URL for uploaded files. |
| `S3_ACCESS_KEY_ID` | Yes | S3 access key ID. |
| `S3_SECRET_ACCESS_KEY` | Yes | S3 secret access key. |
| `S3_BUCKET_NAME` | Yes | S3 bucket name. |
| `S3_FOLDER` | No | Folder/prefix inside the bucket for uploaded files. |
| `MEZON_BOT_ID` | Yes* | Mezon bot application ID. Required for Mezon bot features. |
| `MEZON_BOT_TOKEN` | Yes* | Mezon bot token. Required for Mezon bot and webview auth fallback. |
| `WHITELIST_CHANNEL_IDS` | No | Comma-separated Mezon channel IDs allowed by the bot integration. |

\* Required when Mezon bot or Mezon webview login is enabled.

Local development example:

```env
PORT=5100
NODE_ENV=development
EXTEND_CORS="http://localhost:3000"

DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=bwl

JWT_SECRET=local-dev-jwt-secret

REDIS_URL=redis://localhost:6379

S3_API_ENDPOINT=https://s3-api-endpoint.example.com
S3_CDN_ENDPOINT=https://s3-cdn-endpoint.example.com
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=nestjs-template
S3_FOLDER=bwl

MEZON_BOT_ID=your-mezon-bot-id
MEZON_BOT_TOKEN=your-mezon-bot-token
WHITELIST_CHANNEL_IDS=channel_id_1,channel_id_2
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
| `pnpm start:web` | Start web app in production mode |
| `pnpm start:server` | Start API server in production mode |
| `pnpm clean` | Remove build artifacts |

## Production Deployment

Deploy the web app and API server separately. In production, the web app handles Mezon OAuth through Better Auth and calls the NestJS API for business data.

### Prerequisites

- Node.js 18+
- pnpm 10.x
- PostgreSQL
- Redis
- S3-compatible storage (for media uploads)
- A Mezon OAuth application with redirect URI configured

### 1. Install dependencies

```bash
pnpm install
```

On first install, pnpm builds native dependencies such as `better-sqlite3` (required by `mezon-sdk`). If the server fails with a native module error, run:

```bash
pnpm rebuild better-sqlite3
```

### 2. Configure environment variables

Copy the example env files and set production values:

```bash
cp apps/web/.env.example apps/web/.env
cp apps/server/.env.example apps/server/.env
```

See [Environment Variables](#environment-variables) for the full list of variables and descriptions. For production, at minimum set:

- Web: public app URL, API URL, Better Auth secret, Mezon OAuth credentials, and matching `REDIRECT_URI`
- Server: `NODE_ENV=production`, database, Redis, JWT secret, S3, CORS origins, and Mezon bot credentials

### 3. Run database migrations

Build the server first, then apply migrations:

```bash
pnpm build:server
pnpm migration:run
```

Run this step on every deploy that includes new migrations.

### 4. Build for production

```bash
pnpm build:web
pnpm build:server
```

Or build everything at once:

```bash
pnpm build
```

### 5. Start production processes

From the repo root:

```bash
pnpm start:server
pnpm start:web
```

Equivalent commands:

```bash
# API server (NestJS) - default port from apps/server/.env (5100)
nx run server:serve:production

# Web app (Next.js) - default port 3000
nx run web:serve:production
```

Set `PORT` when starting the web app if needed:

```bash
PORT=3000 pnpm start:web
```

For long-running production hosts, run both processes with a process manager such as PM2 or systemd, and restart them after deploy.

Example with PM2:

```bash
pm2 start "pnpm start:server" --name bwl-server --cwd /path/to/bwl-v2
pm2 start "pnpm start:web" --name bwl-web --cwd /path/to/bwl-v2
pm2 save
```

### 6. Reverse proxy (recommended)

Put both apps behind HTTPS with a reverse proxy (Nginx, Caddy, Cloudflare, etc.).

| Public URL | Upstream | App |
|------------|----------|-----|
| `https://bwl.example.com` | `http://127.0.0.1:3000` | Next.js web |
| `https://api-bwl.example.com` | `http://127.0.0.1:5100` | NestJS API |

Ensure proxy headers (`X-Forwarded-For`, `X-Forwarded-Proto`, `Host`) are forwarded so cookies and OAuth redirects work correctly.

### 7. Post-deploy checks

1. Open the web app and sign in with Mezon.
2. Confirm the OAuth callback succeeds at `/auth/callback`.
3. Verify authenticated API requests from the web app (profile, notifications, posts).
4. Check server health and Swagger (if exposed): `https://api-bwl.example.com/api/docs`
5. Confirm Redis and background jobs are connected if queues/notifications are enabled.

### Production deploy checklist

- [ ] Web and server env files configured
- [ ] Mezon OAuth redirect URI matches `REDIRECT_URI`
- [ ] `EXTEND_CORS` includes the web production origin
- [ ] Database migrations applied
- [ ] Web and server builds completed
- [ ] Both processes running behind HTTPS
- [ ] Login and core authenticated flows tested

## License

MIT
