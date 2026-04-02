# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NEPA Kreuzschleiftechnik online shop — a German-language B2B/B2C e-commerce application for honing spare parts and grinding technology accessories. Features a machine compatibility finder, Stripe checkout, and an admin panel for managing products, orders, and inventory.

## Commands

- `npm run dev` — start Next.js dev server
- `npm run build` — generate Prisma client + build Next.js
- `npm run lint` — ESLint (flat config, Next.js core-web-vitals + TypeScript)
- `npm test` — run all Vitest tests
- `npx vitest run tests/unit/cart-store.test.ts` — run a single test file
- `npm run test:watch` — Vitest in watch mode
- `npm run db:push` — push Prisma schema to database (no migration)
- `npm run db:migrate` — create and apply Prisma migration
- `npm run db:seed` — seed database with products, categories, machines
- `npm run db:studio` — open Prisma Studio GUI
- `npm run admin:create` — create admin user via `scripts/create-admin.ts`

## Architecture

**Next.js 16 App Router** with no `src/` directory — all routes live under `app/`.

### Route structure
- `app/(shop)/` — empty route group (layout passthrough for storefront)
- `app/admin/` — admin panel with its own sidebar layout; routes use German names (`produkte`, `kategorien`, `maschinen`, `bestellungen`, `lager`)
- `app/api/admin/` — CRUD API routes for admin (categories, inventory, machines, orders, products)
- `app/api/auth/logout/` — logout endpoint
- `app/api/finder/` — machine compatibility finder API (machines, products)
- `app/api/webhooks/stripe/` — Stripe webhook handler
- `app/api/setup/` — admin test account setup endpoint
- Storefront pages: `produkte/`, `kategorien/`, `suche/`, `warenkorb/`, `checkout/`, `finder/`, `login/`, `kontakt/`, `impressum/`, `datenschutz/`

### Data layer
- **Prisma** with PostgreSQL (via Supabase). Schema in `prisma/schema.prisma`, config in `prisma/prisma.config.ts`. DATABASE_URL comes from env.
- Models: Category, Machine, Product, ProductMachine (many-to-many), Order, OrderItem, InventoryLog, AdminUser
- `lib/queries.ts` — cached data-fetching functions using `unstable_cache` from Next.js
- `lib/prisma.ts` — singleton Prisma client

### Auth
- **Supabase Auth** with SSR cookie handling
- `lib/supabase/server.ts` — server-side client (cookies)
- `lib/supabase/client.ts` — browser client
- `lib/supabase/admin.ts` — service role client
- `middleware.ts` — protects `/admin/*` routes, redirects unauthenticated users to `/login`
- `lib/admin-auth.ts` — `requireAdmin()` checks both Supabase auth + AdminUser table for API routes

### State management
- **Zustand** with `persist` middleware for cart (`lib/cart-store.ts`, key: `nepa-cart`)

### Server actions
- `actions/checkout.ts` — Stripe checkout session creation
- `actions/inventory.ts` — stock adjustments with audit logging

### Components
- `components/ui/` — shadcn/ui primitives (do not edit manually)
- `components/shop/` — storefront components (product card, add-to-cart, finder widget, realtime stock)
- `components/admin/` — admin panel components (product form, stock adjustment, category/machine actions, order details)
- `components/layout/` — header and footer

### Styling
- **Tailwind CSS v4** with `@tailwindcss/postcss`. Custom colors prefixed `nepa-` (e.g., `nepa-dark`, `nepa-blue`, `nepa-green`).
- Dark mode via `next-themes` (`ThemeProvider` + `ThemeToggle`)

### Testing
- **Vitest** + jsdom + React Testing Library. Tests in `tests/` (unit + integration).
- `tests/setup.ts` — global mocks for `next/navigation`, `next/link`, `next/headers`, `sonner`
- `tests/mocks/prisma.ts` — Prisma client mock

### Types
- `types/index.ts` — shared TypeScript types extending Prisma models (ProductWithRelations, CartItem, etc.)

### Path alias
- `@/*` maps to project root (e.g., `@/lib/queries`, `@/components/ui/button`)

## Environment Variables

Required (see `.env.example`): DATABASE_URL, DIRECT_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, NEXT_PUBLIC_APP_URL

## Language

All user-facing text is in German. URL slugs, admin route names, and UI copy use German terminology.
