# Clean Code Audit Report

**Project**: Moduloop Kits (my-app)
**Stack**: Next.js 16, React 19, TypeScript 5, Prisma 6, PostgreSQL (Supabase), Better Auth, Radix UI, Tailwind CSS 4
**Context**: Growing B2B product (1-2y), solo developer, deployed on Vercel
**Date**: 2026-02-24

---

## Score Summary

```
--------------------------------------------
Category                    Score    Weight
--------------------------------------------
TypeScript & Type Safety    6.5/10     H
Architecture & Structure    4.5/10     H
Linting & Formatting        4/10       M
Testing                     1/10       H
CI/CD & Automation          2/10       H
Security                    5.5/10     H
Git & Documentation         6/10       M
--------------------------------------------
WEIGHTED OVERALL            4.1/10
--------------------------------------------
```

**TypeScript & Type Safety (6.5/10)** — `strict: true` is enabled and zero `@ts-ignore` directives is excellent. Weakened by 10 `as any` casts, missing `noUncheckedIndexedAccess`/`noUnusedLocals`/`noUnusedParameters`, inconsistent Zod validation at API boundaries (only ~55% of endpoints), and no custom error classes.

**Architecture & Structure (4.5/10)** — Feature-based organization in `components/` and `utils/` is solid. Severely weakened by: `db.ts` is a 390-line god file mixing data access with business logic, no service layer (API routes call Prisma directly), 12 files over 400 lines (one at 989), debug/test routes shipped to production, stale files (`product-card-old.tsx`, `product-form-new.tsx`), and duplicated calculation logic between services and components.

**Linting & Formatting (4/10)** — ESLint 9 flat config exists with Next.js presets. Missing: Prettier config entirely (quote style inconsistent), no type-aware rules (`no-floating-promises`, `no-misused-promises`), no security plugin, no import sorting, no `max-warnings` policy.

**Testing (1/10)** — Zero test files. Zero test scripts. No test runner configured. Playwright is installed but has no config. 500+ lines of critical financial calculation logic (pricing, margins, break-even) have no coverage at all. This is the single biggest risk for a product handling money.

**CI/CD & Automation (2/10)** — No GitHub Actions, no pre-commit hooks (husky), no commitlint, no lint-staged, no dependabot/renovate, no npm audit. The only automation is the Vercel build script. Code goes from editor to production with zero automated gates.

**Security (5.5/10)** — Good fundamentals: Prisma prevents SQLi, no hardcoded secrets, Zod validation on most endpoints, proper role checks. Critical gaps: authorization bypass on `GET /api/projects/[id]/kits` (any authenticated user can read any project's kits), wrong HTTP status code (500 instead of 401), no security headers, no rate limiting, `trustedOrigins` hardcoded to localhost only, 24 files with `console.log` in production.

**Git & Documentation (6/10)** — Commit messages are consistently excellent (conventional commits). CLAUDE.md is comprehensive. Weakened by: README is default Next.js boilerplate, no `.nvmrc`, no `engines` field, no PR template, no contributing guide, inconsistent branch naming.

---

## Phase 0 — Project Discovery

### Codebase Facts

| Metric                  | Value              |
| ----------------------- | ------------------ |
| Total files in `src/`   | 199                |
| TypeScript (.ts)        | 55                 |
| TypeScript React (.tsx) | 143                |
| CSS                     | 1                  |
| Total lines of code     | 26,254             |
| Average file size       | ~132 lines         |
| Max file size           | 989 lines          |
| Test files              | 0                  |
| Test coverage           | 0%                 |
| Total commits           | 128                |
| Contributors            | 1 (solo developer) |
| Dependencies            | 20                 |
| DevDependencies         | 13                 |

### Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: React 19, Radix UI, Tailwind CSS 4, Framer Motion
- **Forms**: React Hook Form + Zod 4
- **ORM**: Prisma 6 with PostgreSQL (Supabase)
- **Auth**: Better Auth with Prisma adapter
- **PDF**: @react-pdf/renderer
- **Icons**: Lucide React
- **Deployment**: Vercel (CDG1 region)

### Project Structure

```
src/
├── app/
│   ├── (auth)/              # Public auth pages (connexion, inscription, mot-de-passe-oublie)
│   ├── (dashboard)/         # Protected pages (dashboard, products, kits, projects, profile, admin)
│   ├── api/                 # REST API routes
│   ├── test-form/           # DEBUG — should be removed
│   ├── test-product/        # DEBUG — should be removed
│   ├── error.tsx
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx
├── components/
│   ├── admin/
│   ├── auth/
│   ├── debug/               # DEBUG — should be removed
│   ├── examples/            # Examples — should be removed
│   ├── headers/
│   ├── kits/
│   │   ├── form-sections/
│   │   └── product-selection/
│   ├── products/
│   │   ├── form-sections/
│   │   └── product-card/
│   ├── projects/
│   │   └── shared/
│   ├── providers/
│   └── ui/                  # Radix UI + shadcn primitives
├── features/
│   └── pdf/
│       └── sections/
├── hooks/
│   ├── use-debounce.ts
│   ├── use-role.ts
│   └── use-project-actions.ts
├── lib/
│   ├── auth/
│   ├── schema/
│   ├── schemas/
│   ├── services/
│   ├── types/
│   ├── utils/
│   │   ├── kit/
│   │   ├── project/
│   │   └── product-helpers.ts
│   ├── validations/
│   ├── auth-client.ts
│   ├── auth-helpers.ts
│   ├── auth.ts
│   ├── cache.ts
│   ├── db.ts
│   ├── forms.ts
│   └── utils.ts
├── types/
│   └── framer-motion.d.ts
└── middleware.ts
```

---

## Phase 1 — Deep Analysis

### 1. TypeScript & Type Safety

#### TSConfig Analysis

**File**: `tsconfig.json`

| Flag                       | Status                                             |
| -------------------------- | -------------------------------------------------- |
| `strict`                   | Present                                            |
| `noEmit`                   | Present                                            |
| `isolatedModules`          | Present                                            |
| `noUncheckedIndexedAccess` | **MISSING**                                        |
| `noImplicitReturns`        | **MISSING** (implicit via strict but not explicit) |
| `noUnusedLocals`           | **MISSING**                                        |
| `noUnusedParameters`       | **MISSING**                                        |

#### `as any` Assertions (10 occurrences in 8 files)

| File                                               | Count | Issue                                                         |
| -------------------------------------------------- | ----- | ------------------------------------------------------------- |
| `src/lib/db.ts`                                    | 3     | `transformDates()` returns `as any` instead of proper generic |
| `src/lib/forms.ts`                                 | 2     | Double `as any` cast on `zodResolver(schema as any) as any`   |
| `src/lib/auth/sign-in-with-error-handling.ts`      | 1     | Unnecessary cast on error object                              |
| `src/components/projects/project-edit-wrapper.tsx` | 1     | Type coercion instead of proper alignment                     |
| `src/components/products/product-form.tsx`         | 1     | Two `as any` when accessing object keys                       |
| `src/app/(dashboard)/profile/page.tsx`             | 1     | String to enum cast for role                                  |
| `src/components/kits/kits-grid-client.tsx`         | 1     | Kit type coercion                                             |
| `src/components/kits/kits-grid.tsx`                | 1     | Kits prop type mismatch                                       |

#### Zod Validation at API Boundaries

**Validated (4 endpoints):**

- `POST /api/products` — `productSchema.parse(body)`
- `POST /api/kits` — `kitSchema.parse(body)`
- `PATCH /api/admin/users/[id]/role` — `updateRoleSchema.parse(body)`
- `PUT /api/kits/[id]` — uses `kitSchema`

**NOT validated (5+ endpoints):**

- `POST /api/projects` — manual `if (!nom)` check only
- `PATCH /api/projects/[id]` — manual validation for `surfaceManual`
- `POST /api/projects/[id]/kits` — no schema for kits array items
- `DELETE /api/projects/[id]/kits/[kitId]` — no body validation

#### Error Handling

- **Custom error classes**: NONE — all 23 `throw new Error` instances use raw `Error` with string messages
- **@ts-ignore / @ts-expect-error**: NONE (excellent)

#### Type Organization

- `src/lib/types/` contains 3 files: `user.ts`, `project.ts`, `project-card.ts`
- **Duplicate UserRole enum** defined in both `lib/types/user.ts` and `lib/types/project.ts`
- `src/types/` only contains `framer-motion.d.ts` (underutilized)

---

### 2. Architecture & Structure

#### Separation of Concerns

**API routes directly call Prisma — no service layer:**

- `src/app/api/products/route.ts` (276 lines): WHERE clause construction, Prisma calls with joins/pagination, client-side filtering logic all in one handler
- `src/app/api/projects/[id]/route.ts` (271 lines): Direct Prisma queries, `calculateProjectTotals()` called inline, transaction management in HTTP handler, history recording inline

**`src/lib/db.ts` is a god file (390 lines):**

| Section                    | Lines       | Concern                          |
| -------------------------- | ----------- | -------------------------------- |
| Prisma singleton           | 11-17       | Infrastructure                   |
| Product select fields      | 20-59       | Config                           |
| Date transform helper      | 62-94       | Utility                          |
| Data fetching              | 97-178      | Data access                      |
| Preload functions          | 181-195     | Unnecessary wrappers             |
| Project fetching           | 198-259     | Data access                      |
| Project CRUD               | 261-308     | Data access                      |
| **calculateProjectTotals** | **311-381** | **Business logic in data layer** |

#### Circular Dependency

```
lib/auth-client.ts → components/providers/auth-provider.tsx
```

This violates the rule that `lib/` should NOT import from `components/`.

#### Files Over 400 Lines (12 files)

| File                                                                      | Lines   | Status                          |
| ------------------------------------------------------------------------- | ------- | ------------------------------- |
| `src/components/products/form-sections/pricing-environmental-section.tsx` | **989** | CRITICAL                        |
| `src/components/projects/kits-list.tsx`                                   | **672** | CRITICAL                        |
| `src/components/projects/pricing-detailed-analysis.tsx`                   | **653** | CRITICAL                        |
| `src/components/products/form-sections/pricing-section.tsx`               | **597** | HIGH                            |
| `src/components/kits/form-sections/kit-products-section.tsx`              | **592** | HIGH                            |
| `src/components/projects/project-kit-card.tsx`                            | **514** | HIGH                            |
| `src/components/projects/purchase-rental-comparison.tsx`                  | **492** | HIGH                            |
| `src/components/projects/add-kit-modal.tsx`                               | **481** | HIGH                            |
| `src/lib/schemas/product.ts`                                              | **450** | MEDIUM (acceptable for schemas) |
| `src/components/projects/project-overview-tab.tsx`                        | **431** | HIGH                            |
| `src/app/(dashboard)/profile/page.tsx`                                    | **422** | MEDIUM                          |
| `src/components/kits/kit-card.tsx`                                        | **407** | HIGH                            |

#### Code Bloat Root Causes (pricing-environmental-section.tsx, 989 lines)

This single component handles:

- Two pricing modes (ACHAT/LOCATION)
- Three rental periods (1an, 2ans, 3ans)
- Environmental impact rendering
- Form integration with react-hook-form
- Calculation logic (useEffect hooks)
- All UI rendering (Tabs + Accordion)

#### Code Duplication

**Impact aggregation** repeated 3+ times:

1. `kits-list.tsx` (lines 42-75) — inline `getKitImpact()`
2. `lib/utils/kit/calculations.ts` (lines 30-64) — `calculateKitImpact()`
3. `lib/utils/project/calculations.ts` (lines 169-207) — `calculateEnvironmentalSavings()`

**Price calculation** repeated 4+ times:

- `kits-list.tsx` — `getKitPrice()` inline
- `pricing-detailed-analysis.tsx` — inline price aggregation
- `project-kit-card.tsx` — inline pricing
- `add-kit-modal.tsx` — inline pricing
- (Service layer also has `calculateKitPrice()` and `calculateProjectPriceTotals()`)

#### Debug/Test/Stale Files in Production

| File                                           | Type              |
| ---------------------------------------------- | ----------------- |
| `src/app/test-form/page.tsx`                   | Test route        |
| `src/app/test-product/page.tsx`                | Test route        |
| `src/components/debug/simple-form-test.tsx`    | Debug component   |
| `src/components/examples/avatar-examples.tsx`  | Example component |
| `src/components/products/product-card-old.tsx` | Stale file        |
| `src/components/products/product-form-new.tsx` | Stale file        |

---

### 3. Linting, Formatting & Style

#### ESLint Configuration

**File**: `eslint.config.mjs`

| Check                                                            | Status                                    |
| ---------------------------------------------------------------- | ----------------------------------------- |
| Format                                                           | Flat config (ESLint v9) via FlatCompat    |
| Presets                                                          | `next/core-web-vitals`, `next/typescript` |
| Type-aware rules (`no-floating-promises`, `no-misused-promises`) | **NOT enabled**                           |
| `eslint-config-prettier`                                         | **NOT installed**                         |
| `eslint-plugin-security`                                         | **NOT installed**                         |
| `eslint-plugin-import` (sorting)                                 | **NOT installed**                         |
| `max-warnings` policy                                            | **NOT configured**                        |

#### Prettier

**Status**: NO configuration file found (no `.prettierrc`, no `prettier.config.js`).
Quote style inconsistent across files (single vs double quotes).

#### Indentation

Consistent 2-space indentation throughout the codebase.

#### ESLint-Disable Comments (4 occurrences)

| File                                                  | Rule Disabled                        | Justification             |
| ----------------------------------------------------- | ------------------------------------ | ------------------------- |
| `src/lib/forms.ts` (lines 5, 11)                      | `@typescript-eslint/no-explicit-any` | Schema type constraints   |
| `src/components/products/product-form.tsx` (line 122) | `react-hooks/exhaustive-deps`        | Controlled useEffect      |
| `src/components/kits/kit-form.tsx` (line 64)          | `react-hooks/exhaustive-deps`        | Controlled useEffect      |
| `src/app/api/products/[id]/route.ts` (line 110)       | `@typescript-eslint/no-unused-vars`  | Intentional destructuring |

All 4 are justified and documented.

---

### 4. Testing

#### Test Infrastructure

| Category               | Status                                                           |
| ---------------------- | ---------------------------------------------------------------- |
| Unit testing framework | **ABSENT** — no Vitest/Jest configured                           |
| Test files             | **ZERO** — no `.test.ts`, `.test.tsx`, `.spec.ts`, `.spec.tsx`   |
| Test scripts           | **ABSENT** — no `test` script in package.json                    |
| E2E framework          | **PARTIAL** — Playwright installed but no `playwright.config.ts` |
| Coverage               | **ABSENT** — no coverage tools                                   |
| Type safety            | TypeScript strict mode (only safety net)                         |

#### Critical Business Logic That SHOULD Be Tested

**High Priority — Financial Calculations:**

| File                                                | Functions                                                                                                                   | Risk                                                            |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `src/lib/utils/product-helpers.ts` (300 lines)      | `ceilPrice()`, `annualToMonthly()`, `calculateMarginPercentage()`, `getProductPricing()`, `getProductEnvironmentalImpact()` | Floating-point precision, incorrect fallback with legacy fields |
| `src/lib/utils/kit/calculations.ts` (88 lines)      | `calculateKitPrice()`, `calculateKitImpact()`                                                                               | Incorrect quantity multiplication, null handling                |
| `src/lib/utils/project/calculations.ts` (251 lines) | `calculateProjectPriceTotals()`, `calculateBreakEvenPoint()`, `calculateEnvironmentalSavings()`                             | Nested aggregations, division by zero                           |

**Medium Priority — Audit Trail:**

| File                                              | Functions                                                 | Risk                                                             |
| ------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------- |
| `src/lib/services/project-history.ts` (229 lines) | `recordProjectHistory()`, `createProjectUpdatedHistory()` | Silent failures (console.error only), incorrect change detection |

**Medium Priority — API Routes (14 routes):**

- Product CRUD, Kit CRUD, Project CRUD + kit management + history
- No input validation beyond partial Zod, no boundary condition testing

---

### 5. CI/CD & Automation

#### What EXISTS

| Item                | Details                                               |
| ------------------- | ----------------------------------------------------- |
| `vercel.json`       | Serverless max duration: 30s, region: `cdg1` (Paris)  |
| ESLint              | Configured in `eslint.config.mjs`                     |
| TypeScript strict   | Enabled in `tsconfig.json`                            |
| Build scripts       | `pnpm build` = Prisma push + generate + Next.js build |
| DB migration script | `scripts/deploy-db.sh` (manual)                       |

#### What is MISSING

| Item                          | Impact                          |
| ----------------------------- | ------------------------------- |
| GitHub Actions / CI workflows | No automated checks on PR       |
| Husky (pre-commit hooks)      | No local quality gates          |
| Commitlint                    | No commit message enforcement   |
| Lint-staged                   | No staged file linting          |
| Dependabot / Renovate         | No dependency update automation |
| npm audit in CI               | No vulnerability scanning       |
| Test execution in build       | No test step anywhere           |

---

### 6. Security

#### CRITICAL Issues

**1. Authorization Bypass — Missing ownership check on GET endpoint**

- **File**: `src/app/api/projects/[id]/kits/route.ts:146-183`
- Any authenticated user can read any project's kits. No `createdById` check.

**2. Wrong HTTP Status Code**

- **File**: `src/app/api/projects/[id]/route.ts:235`
- DELETE endpoint returns `500` instead of `401` when user is not authenticated.

**3. Missing Input Validation — No validation of kit quantities**

- **File**: `src/app/api/projects/[id]/kits/route.ts:22-30`
- `kit.quantite` and `kit.kitId` are NOT validated. Negative or non-numeric values can reach Prisma.

#### HIGH Issues

**4. Console.log in Production (24 files)**

- `src/middleware.ts` (5 statements with emojis)
- All API route files
- Multiple component files

**5. Hardcoded trustedOrigins**

- **File**: `src/lib/auth.ts:32`
- `trustedOrigins: ["http://localhost:3000"]` — CSRF protection broken in production.

**6. Missing Security Headers**

- **File**: `next.config.mjs`
- No X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy.

#### MEDIUM Issues

**7. No Rate Limiting** on auth endpoints — brute-force attacks possible.

**8. Insufficient Validation on Projects Route**

- **File**: `src/app/api/projects/route.ts:71-78`
- POST only checks `nom` exists, no schema validation.

**9. Environment Variable Fallback**

- **File**: `src/components/providers/auth-provider.tsx:7`
- `NEXT_PUBLIC_APP_URL` falls back to `http://localhost:3000` in production.

#### Positive Findings

- No hardcoded secrets in source code
- Prisma ORM used exclusively (no raw SQL)
- Role-based access control implemented on most endpoints
- No `dangerouslySetInnerHTML` usage
- `.env` files properly gitignored

---

### 7. Git & Documentation

#### Commit Convention

**Status**: EXCELLENT — last 20 commits consistently follow `type(scope): description`:

- `feat(projects): add PDF export for project summary`
- `refactor(pricing): extract ceilPrice utility and apply ceiling rounding`
- `refactor(projects): split large components into focused sub-components`

#### Branch Naming

**Mixed**:

- Good: `feature/tri-14`, `feature/tri-15`, `feature/tri-16`
- Inconsistent: `tristanh/tri-13-rent-by-month`, `tristanh/tri-17-refactor-projects`

#### .gitignore

**Excellent** — covers node_modules, build outputs, .env files, IDE files, OS files, Prisma generated, coverage.
Minor issue: `CLAUDE.md` is gitignored (line 44) but should be committed for collaboration.

#### Documentation

| Document                         | Status      | Quality                              |
| -------------------------------- | ----------- | ------------------------------------ |
| README.md                        | Exists      | POOR — default Next.js boilerplate   |
| CLAUDE.md                        | Exists      | EXCELLENT — 180 lines, comprehensive |
| CACHING.md                       | Exists      | Good — 248 lines, caching strategy   |
| NEXT_16_MIGRATION_PLAN.md        | Exists      | Good — 626 lines, migration guide    |
| VERCEL_CACHE_SOLUTION.md         | Exists      | Good — 150 lines                     |
| CONTRIBUTING.md                  | **MISSING** | —                                    |
| .github/PULL_REQUEST_TEMPLATE.md | **MISSING** | —                                    |
| ADRs                             | **MISSING** | —                                    |

#### Version Pinning

| Check                           | Status                             |
| ------------------------------- | ---------------------------------- |
| `.nvmrc`                        | **MISSING**                        |
| `engines` field in package.json | **MISSING**                        |
| `pnpm-lock.yaml`                | Present                            |
| Dependency ranges               | Caret (`^`) — allows minor updates |

---

## Phase 2 — Issues List (Sorted by Urgency)

### CRITICAL (active risk or broken)

```
[ ] Authorization bypass: GET /api/projects/[id]/kits returns any project's kits
    to any authenticated user
    File: src/app/api/projects/[id]/kits/route.ts:146-183
    Risk: Data leak — users can enumerate and read other users' project data
    Effort: XS (< 15min)

[ ] Zero test coverage on financial calculation logic
    Files: src/lib/utils/product-helpers.ts,
           src/lib/utils/kit/calculations.ts,
           src/lib/utils/project/calculations.ts
    Risk: Pricing bugs ship to production undetected — directly impacts revenue
    Effort: L (< 1 day to set up Vitest + write core tests)

[ ] No CI pipeline — code goes directly to production with no automated checks
    Risk: Regressions, lint failures, type errors, and broken builds deploy
    Effort: M (< 4h for basic GitHub Actions)
```

### HIGH (accumulating debt, fix this week)

```
[ ] pricing-environmental-section.tsx is 989 lines (exceeds 800-line absolute max)
    File: src/components/products/form-sections/pricing-environmental-section.tsx
    Risk: Unmaintainable — dual-mode pricing + env impact + calculations + UI
    Effort: M (< 4h)

[ ] db.ts is a god file mixing data access with business logic
    File: src/lib/db.ts:311-381 (calculateProjectTotals)
    Risk: Cannot test business logic independently, tight coupling
    Effort: S (< 1h)

[ ] No security headers configured
    File: next.config.mjs
    Risk: Clickjacking, MIME sniffing, missing HSTS
    Effort: XS (< 15min)

[ ] trustedOrigins hardcoded to localhost only
    File: src/lib/auth.ts:32
    Risk: CSRF protection broken in production OR auth fails entirely
    Effort: XS (< 15min)

[ ] Wrong HTTP status code — DELETE returns 500 instead of 401 for unauthenticated
    File: src/app/api/projects/[id]/route.ts:235
    Risk: Incorrect error handling on client side
    Effort: XS (< 15min)

[ ] Debug/test routes deployed to production
    Files: src/app/test-form/, src/app/test-product/, src/components/debug/,
           src/components/examples/
    Risk: Exposes internal tooling, increases attack surface
    Effort: XS (< 15min)

[ ] 24 files with console.log/console.error in production code
    Files: middleware.ts, all API routes, multiple components
    Risk: Clutters production logs, may leak internal state
    Effort: S (< 1h)

[ ] Missing Zod validation on project API endpoints
    Files: src/app/api/projects/route.ts:71-78,
           src/app/api/projects/[id]/kits/route.ts:22-30
    Risk: Invalid data reaches database (negative quantities, wrong types)
    Effort: S (< 1h)
```

### MEDIUM (quality improvement, fix this month)

```
[ ] No pre-commit hooks (husky + lint-staged)
    Risk: Broken code committed without lint/type-check
    Effort: S (< 1h)

[ ] 11 more files between 400-672 lines need splitting
    Files: kits-list.tsx (672), pricing-detailed-analysis.tsx (653),
           pricing-section.tsx (597), kit-products-section.tsx (592),
           project-kit-card.tsx (514), purchase-rental-comparison.tsx (492),
           add-kit-modal.tsx (481), project-overview-tab.tsx (431),
           profile/page.tsx (422), kit-card.tsx (407)
    Risk: Increasing maintenance burden, harder to reason about
    Effort: L per file

[ ] 10 `as any` type assertions
    Files: lib/db.ts (3), lib/forms.ts (2), auth/sign-in-with-error-handling.ts,
           project-edit-wrapper.tsx, product-form.tsx, profile/page.tsx,
           kits-grid-client.tsx, kits-grid.tsx
    Risk: Type safety holes — runtime errors possible
    Effort: S (< 1h)

[ ] Missing tsconfig flags: noUncheckedIndexedAccess, noUnusedLocals,
    noUnusedParameters
    File: tsconfig.json
    Risk: Array access without null checks, dead code accumulates
    Effort: S (< 1h — but may surface existing errors)

[ ] No Prettier configuration — inconsistent quote style
    Risk: Code style drift, noisy diffs
    Effort: XS (< 15min)

[ ] Duplicated calculation logic between services and components
    Files: kits-list.tsx duplicates lib/utils/kit/calculations.ts,
           multiple components duplicate price aggregation
    Risk: Bug fixes applied in one place but not the other
    Effort: M (< 4h)

[ ] Stale files left in codebase
    Files: src/components/products/product-card-old.tsx,
           src/components/products/product-form-new.tsx
    Risk: Confusion about which is canonical
    Effort: XS (< 15min)

[ ] No rate limiting on auth endpoints
    Risk: Brute-force password attacks possible
    Effort: M (< 4h)

[ ] No dependency update automation (dependabot/renovate)
    Risk: Known vulnerabilities in outdated packages
    Effort: XS (< 15min)
```

### LOW (backlog, nice to have)

```
[ ] README.md is default Next.js boilerplate
    Risk: Poor onboarding if team grows
    Effort: S (< 1h)

[ ] No .nvmrc or engines field in package.json
    Risk: Node version mismatches between environments
    Effort: XS (< 15min)

[ ] No PR template
    File: .github/PULL_REQUEST_TEMPLATE.md (missing)
    Risk: Inconsistent PR descriptions
    Effort: XS (< 15min)

[ ] No import sorting rule
    Risk: Inconsistent import ordering, noisy diffs
    Effort: XS (< 15min)

[ ] Circular dependency: lib/auth-client.ts imports from components/providers/
    Risk: Import cycle, couples library to component layer
    Effort: S (< 1h)

[ ] Duplicate UserRole enum in lib/types/user.ts and lib/types/project.ts
    Risk: Divergence between the two definitions
    Effort: XS (< 15min)
```

---

## Phase 3 — Actionable Tasks

### [CRITICAL] Fix authorization bypass on project kits endpoint

**What**: Add ownership verification to the GET handler for `/api/projects/[id]/kits`.
**Why**: Any authenticated user can read any project's kit data.
**Example**:

```typescript
// Before (route.ts:146-183)
const projectKits = await prisma.projectKit.findMany({
  where: { projectId },
})

// After
const project = await prisma.project.findFirst({
  where: { id: projectId, createdById: session.user.id },
})
if (!project) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
const projectKits = await prisma.projectKit.findMany({
  where: { projectId },
})
```

**Files**: `src/app/api/projects/[id]/kits/route.ts`
**Effort**: XS

---

### [CRITICAL] Set up Vitest and write tests for pricing logic

**What**: Install Vitest, configure it, and write unit tests for `ceilPrice()`, `calculateKitPrice()`, `calculateProjectPriceTotals()`, and `calculateBreakEvenPoint()`.
**Why**: Financial calculations with zero coverage are the highest business risk.
**Example**:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: { globals: true },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})

// src/lib/utils/product-helpers.test.ts
import { ceilPrice } from './product-helpers'

describe('ceilPrice', () => {
  it('rounds up to next cent', () => {
    expect(ceilPrice(10.001)).toBe(10.01)
    expect(ceilPrice(10.0)).toBe(10.0)
  })
})
```

**Files**: `vitest.config.ts`, `package.json`, `src/lib/utils/product-helpers.test.ts`, `src/lib/utils/kit/calculations.test.ts`, `src/lib/utils/project/calculations.test.ts`
**Effort**: L

---

### [CRITICAL] Add GitHub Actions CI pipeline

**What**: Create a workflow that runs lint, type-check, and tests on every PR.
**Why**: No automated gates means regressions ship directly to production.
**Example**:

```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: '.nvmrc' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm tsc --noEmit
      - run: pnpm test
```

**Files**: `.github/workflows/ci.yml`, `package.json` (add `test` script)
**Effort**: M

---

### [HIGH] Fix auth trustedOrigins and wrong status code

**What**: Use env var for trustedOrigins; fix 500 -> 401 on DELETE endpoint.
**Why**: CSRF protection is broken in production; wrong status code misguides clients.
**Example**:

```typescript
// Before (src/lib/auth.ts:32)
trustedOrigins: ["http://localhost:3000"],

// After
trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"],

// Before (src/app/api/projects/[id]/route.ts:235)
{ status: 500 }

// After
{ status: 401 }
```

**Files**: `src/lib/auth.ts`, `src/app/api/projects/[id]/route.ts`
**Effort**: XS

---

### [HIGH] Add security headers

**What**: Configure security headers in `next.config.mjs`.
**Why**: Missing X-Frame-Options, X-Content-Type-Options, HSTS.
**Example**:

```javascript
// next.config.mjs
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
    ],
  }]
}
```

**Files**: `next.config.mjs`
**Effort**: XS

---

### [HIGH] Delete debug routes and stale files

**What**: Remove test pages, debug components, example components, and stale product files.
**Why**: Increases attack surface and causes confusion.
**Files to delete**:

- `src/app/test-form/` (entire directory)
- `src/app/test-product/` (entire directory)
- `src/components/debug/` (entire directory)
- `src/components/examples/` (entire directory)
- `src/components/products/product-card-old.tsx`
- `src/components/products/product-form-new.tsx`

**Effort**: XS

---

### [HIGH] Remove console.log from production code

**What**: Remove all `console.log` and `console.error` from `src/` (24 files). Replace critical error logging with a simple logger utility.
**Why**: Clutters production logs, leaks internal state.
**Files**: `src/middleware.ts`, all files in `src/app/api/`
**Effort**: S

---

### [HIGH] Add Zod validation to remaining API endpoints

**What**: Create Zod schemas for project creation and kit addition endpoints.
**Why**: Unvalidated input (negative quantities, wrong types) can corrupt data.
**Example**:

```typescript
// src/lib/schemas/project.ts
import { z } from 'zod'

export const createProjectSchema = z.object({
  nom: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['ACTIF', 'TERMINE', 'EN_PAUSE', 'ARCHIVE']).optional(),
})

export const addKitsSchema = z.object({
  kits: z
    .array(
      z.object({
        kitId: z.string().uuid(),
        quantite: z.number().int().positive(),
      }),
    )
    .min(1),
})
```

**Files**: `src/lib/schemas/project.ts`, `src/app/api/projects/route.ts`, `src/app/api/projects/[id]/kits/route.ts`
**Effort**: S

---

### [HIGH] Split pricing-environmental-section.tsx (989 lines)

**What**: Extract into `AchatPricingSection`, `LocationPricingSection`, and `EnvironmentalImpactSection`.
**Why**: Exceeds the 800-line absolute maximum. Combines three distinct responsibilities.
**Files**: `src/components/products/form-sections/pricing-environmental-section.tsx` -> 3 new files
**Effort**: M

---

### [HIGH] Extract business logic from db.ts into service layer

**What**: Move `calculateProjectTotals()` (lines 311-381) to `src/lib/services/project.service.ts`. Keep `db.ts` as pure data access.
**Why**: Cannot test calculation logic independently; couples domain logic to data layer.
**Files**: `src/lib/db.ts`, new `src/lib/services/project.service.ts`
**Effort**: S

---

### [MEDIUM] Set up husky + lint-staged

**What**: Install husky and lint-staged to run ESLint and type-check on staged files before commit.
**Why**: Prevents broken code from being committed.
**Example**:

```json
// package.json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "bash -c 'tsc --noEmit'"]
}
```

**Files**: `package.json`, `.husky/pre-commit`
**Effort**: S

---

### [MEDIUM] Add Prettier config

**What**: Create `.prettierrc` and install `eslint-config-prettier`.
**Why**: Quote style is inconsistent across files; no formatting standard enforced.
**Example**:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all"
}
```

**Files**: `.prettierrc`, `package.json`
**Effort**: XS

---

### [MEDIUM] Strengthen tsconfig

**What**: Add `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`.
**Why**: Catches null access on arrays/maps and flags dead code.
**Files**: `tsconfig.json`
**Effort**: S (may surface existing errors to fix)

---

### [MEDIUM] Eliminate duplicated calculation logic

**What**: Remove inline calculations from components and use the existing service functions in `lib/utils/kit/calculations.ts` and `lib/utils/project/calculations.ts`.
**Why**: Bug fixes applied in one place but not the other.
**Files**: `src/components/projects/kits-list.tsx`, `src/components/projects/pricing-detailed-analysis.tsx`, `src/components/projects/project-kit-card.tsx`, `src/components/projects/add-kit-modal.tsx`
**Effort**: M

---

### [MEDIUM] Add dependabot configuration

**What**: Create `.github/dependabot.yml` for automated dependency update PRs.
**Why**: Known vulnerabilities in outdated packages go undetected.
**Example**:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 5
```

**Files**: `.github/dependabot.yml`
**Effort**: XS

---

### [LOW] Replace README boilerplate

**What**: Write a proper README with project description, setup instructions, architecture overview, and deployment info.
**Why**: Poor onboarding if team grows.
**Files**: `README.md`
**Effort**: S

---

### [LOW] Add .nvmrc and engines field

**What**: Pin Node.js version and add engines constraint.
**Example**:

```
# .nvmrc
20.11.0
```

```json
// package.json
"engines": {
  "node": ">=20.11.0",
  "pnpm": ">=8.0.0"
}
```

**Files**: `.nvmrc`, `package.json`
**Effort**: XS

---

### [LOW] Add PR template

**What**: Create `.github/PULL_REQUEST_TEMPLATE.md`.
**Example**:

```markdown
## Summary

<!-- 1-3 bullet points -->

## Changes

<!-- List of changes -->

## Test Plan

- [ ] Unit tests pass
- [ ] Manual testing done

## Screenshots (if UI changes)
```

**Files**: `.github/PULL_REQUEST_TEMPLATE.md`
**Effort**: XS

---

### [LOW] Fix circular dependency

**What**: Move auth client creation out of `lib/auth-client.ts` so it does not import from `components/providers/`.
**Why**: Library code should not depend on component layer.
**Files**: `src/lib/auth-client.ts`, `src/components/providers/auth-provider.tsx`
**Effort**: S

---

### [LOW] Consolidate duplicate UserRole enum

**What**: Remove UserRole from `lib/types/project.ts` and import from `lib/types/user.ts`.
**Why**: Two definitions can diverge silently.
**Files**: `src/lib/types/project.ts`, `src/lib/types/user.ts`
**Effort**: XS

---

## Phase 4 — Implementation Roadmap

```
RECOMMENDED IMPLEMENTATION ORDER
──────────────────────────────────
 1. Fix authorization bypass on project kits GET (XS)
    — Active data leak, highest urgency

 2. Fix trustedOrigins + wrong 401 status code (XS)
    — CSRF protection broken in production

 3. Add security headers to next.config.mjs (XS)
    — Quick security win, 5 minutes

 4. Delete debug routes and stale files (XS)
    — Reduce attack surface immediately

 5. Add Zod validation to remaining API endpoints (S)
    — Prevent data corruption before more users onboard

 6. Remove all console.log from production code (S)
    — Clean slate before CI setup

 7. Set up Vitest + write pricing calculation tests (L)
    — Highest business risk, foundation for all future safety

 8. Add GitHub Actions CI pipeline (M)
    — Gates for all future changes, depends on test setup

 9. Set up husky + lint-staged + Prettier (S)
    — Enforce quality locally, complements CI

10. Extract business logic from db.ts + split 989-line component (M)
    — Reduce tech debt, enable testability
```

Items 1-6 are quick wins (total ~3 hours) that eliminate all critical and high-priority security issues. Items 7-8 build the safety net. Items 9-10 establish the foundation for sustainable growth as the product and team scale.
