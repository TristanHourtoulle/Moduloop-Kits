# Moduloop Kits

B2B product and kit management platform for sustainable products. Manages products with dual pricing modes (purchase/rental), environmental impact tracking, and project lifecycle with full audit history.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (strict mode)
- **UI**: React 19, Radix UI, Tailwind CSS 4
- **Database**: PostgreSQL + Prisma 6
- **Auth**: Better Auth (email/password + Google OAuth)
- **Deployment**: Vercel

## Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL database (or Supabase project)

## Setup

1. **Clone and install dependencies**

```bash
git clone <repository-url>
cd Moduloop-Kits
pnpm install
```

1. **Configure environment variables**

```bash
cp .env.example .env
```

Fill in the following variables:

| Variable              | Description                                      |
| --------------------- | ------------------------------------------------ |
| `DATABASE_URL`        | PostgreSQL connection URL (pooling)               |
| `AUTH_SECRET`         | Secret key for Better Auth                        |
| `NEXTAUTH_URL`        | Application URL (`http://localhost:3000` for dev) |
| `NEXTAUTH_SECRET`     | Secret key for session management                 |
| `GOOGLE_CLIENT_ID`    | Google OAuth client ID                            |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret                       |

1. **Push the database schema**

```bash
pnpm db:push
```

1. **Start the development server**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Commands

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Prisma push + generate + Next.js build |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run tests (Vitest) |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm type-check` | TypeScript type checking |
| `pnpm db:push` | Push Prisma schema to database |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Deploy Prisma migrations |

## Architecture

```text
src/
├── app/
│   ├── (auth)/          # Public auth pages
│   ├── (dashboard)/     # Protected pages (products, kits, projects)
│   └── api/             # REST API routes
├── components/
│   ├── ui/              # Radix UI primitives (shadcn/ui)
│   ├── products/        # Product-specific components
│   ├── projects/        # Project-specific components
│   └── providers/       # Context providers
├── lib/
│   ├── schemas/         # Zod validation schemas
│   ├── services/        # Business logic
│   └── utils/           # Helpers organized by domain
└── hooks/               # Shared React hooks
```

For detailed architecture documentation, see [CLAUDE.md](./CLAUDE.md).
