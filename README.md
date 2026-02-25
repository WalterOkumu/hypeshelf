# HypeShelf

**Collect and share the stuff you're hyped about.**

A shared recommendations hub (movies and media) built with Next.js 16+, Clerk, and Convex. Supports two roles: **user** (add and delete own recommendations) and **admin** (delete any, toggle Staff Pick).

## Stack

- **Next.js 16** (App Router)
- **Clerk** (auth: Google OAuth, email/password)
- **Convex** (reactive DB, serverless functions, Clerk webhook)
- **TypeScript**, **Tailwind CSS**, **Zod**

## Setup

1. **Install and link Convex**

   ```bash
   pnpm install
   npx convex dev
   ```

   When prompted, create or link a Convex project. This generates `convex/_generated` and sets `NEXT_PUBLIC_CONVEX_URL` in `.env.local`.

2. **Configure Clerk**

   - Create an app at [clerk.com](https://clerk.com).
   - Add the env vars from `.env.example` to `.env.local` (Clerk keys, sign-in/sign-up URLs, after-sign-in URL `/dashboard`).
   - In Clerk Dashboard → JWT Templates → New → Convex: create a template named `convex`, copy the Issuer URL.
   - In Convex Dashboard → Auth → Add Clerk: paste the Issuer and complete the Convex preset.

3. **Clerk webhook (user sync to Convex)**

   - In Convex Dashboard → Settings → Environment Variables: set `CLERK_WEBHOOK_SECRET` (from Clerk → Webhooks).
   - In Clerk Dashboard → Webhooks: add endpoint `https://<your-convex-site>.convex.site/api/http/clerk-webhook`, events `user.created`, `user.updated`.
   - Or use the Convex HTTP action URL shown in `npx convex dev` for the `/clerk-webhook` route.

4. **Run the app**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Sign up (default role: **user**). To test **admin**: in Clerk Dashboard → Users → Metadata → `publicMetadata` → `{ "role": "admin" }`; the webhook will sync the role to Convex.

5. **Seed sample data (optional)**

   - **From Convex Dashboard:** Functions → `seed` → `seedSampleData` → Run (no args).
   - **From HTTP:** In Convex Dashboard → Settings → Environment Variables, set `SEED_SECRET` to a value of your choice. Then run:
     ```bash
     curl "https://<your-deployment>.convex.site/api/http/seed?secret=YOUR_SEED_SECRET"
     ```
     Replace `<your-deployment>` with your Convex deployment name (shown when you run `npx convex dev`).

   The seed adds 3 users (Alex, Sam, Jordan) and 6 recommendations (movies/shows), including Staff Picks. It is idempotent: running it again does nothing if seed users already exist.

## Admin roles and dev verification

- **Where roles live**: Roles are stored in the Convex `users` table as `"admin"` or `"user"`, and are kept in sync from Clerk via the `/clerk-webhook` HTTP action.
- **Setting an admin**: In the Clerk dashboard (for your development instance), open the user (for example `test_admin@example.com`), go to **Metadata → Public metadata**, and set:

  ```json
  { "role": "admin" }
  ```

  Save the user; Clerk will emit a `user.updated` event and the Convex webhook will upsert the corresponding `users` record with `role: "admin"`.

- **Disabling email codes in development**: Email verification and sign‑in flows are controlled entirely in Clerk:
  - In the Clerk dashboard for your **development** instance, open the authentication/sign‑in configuration.
  - Relax or disable email verification for sign‑in in development (for example, allow unverified emails or use a method that does not require a one‑time code on every login).
  - Alternatively, use Clerk’s built‑in test/dev users, which are auto‑verified and skip real email delivery.

These changes should only be applied to your development instance; keep stronger verification requirements enabled for production.

## Scripts

- `pnpm dev` – Next.js dev server
- `pnpm build` – Production build
- `pnpm start` – Start production server
- `pnpm run test:e2e` – Playwright E2E (starts dev server if not running)
- `pnpm run test:e2e:ui` – Playwright UI mode
- `npx convex dev` – Convex dev (codegen + push)

## E2E and CI

- **E2E:** Playwright tests live in `e2e/`. Run `pnpm run test:e2e` (optionally start `pnpm dev` first so the server reuses). Tests cover landing page and unauthenticated redirect to sign-in; dashboard tests run only when Clerk env is set.
- **CI:** `.github/workflows/ci.yml` runs on push/PR to `main` and `development`: lint, build (with placeholder env if secrets are missing), then E2E. Set `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (and optionally `CLERK_SECRET_KEY`) as repo secrets for full E2E with real backend.

## Roles & UI behaviour

- **Visitor (unauthenticated)**:
  - Sees the public landing page with the HypeShelf hero and **Latest Picks** grid.
  - Header shows a **Sign in** button; no shelf/dashboard link.
  - Recommendation cards are read-only – no **Delete** or **Staff Pick** controls.
- **User (authenticated)**:
  - Header shows **Go to your shelf**, the user’s display name, avatar, and **Sign out**.
  - On `/dashboard`, cards owned by the user show a **Delete** button with an inline `"Confirm delete?"` confirmation state; cards owned by others have no delete control.
  - Users never see the **Staff Pick** toggle on any card.
- **Admin (authenticated + elevated)**:
  - Header shows everything a normal user sees plus a small **Admin** pill next to the display name.
  - On `/dashboard`, every card shows both **Delete** and **Staff Pick** controls, regardless of ownership.
  - Staff-picked cards render a visible **⭐ Staff Pick** badge on both the public landing page and dashboard.

## Docs

- [PRD](src/docs/PRD.md) – Requirements and acceptance criteria
- [ARCHITECTURE](src/docs/ARCHITECTURE.md) – Data model, Convex/Clerk flow
- [DESIGN_SPEC](src/docs/DESIGN_SPEC.md) – UI tokens and components
- [Design mockups](designs/README.md) – Static HTML mockups and Pencil spec

## Routes

| Route        | Auth   | Description                          |
|-------------|--------|--------------------------------------|
| `/`         | No     | Public landing, latest 10 recs, CTA  |
| `/dashboard`| Yes    | All recs, filter, add, delete, Staff Pick (admin) |
| `/sign-in`, `/sign-up` | No | Clerk hosted                        |

## Env vars

See `.env.example`. Required: Clerk publishable/secret keys, Convex URL, and (for webhook) `CLERK_WEBHOOK_SECRET` in Convex env.

## Next.js 16 notes

- Auth runs in **proxy** (`src/proxy.ts`); the old `middleware` convention is deprecated.
- `turbopack.root` in `next.config.mjs` pins the project root; if you see lockfile warnings, use a single package manager (e.g. only `pnpm-lock.yaml` and remove `package-lock.json` if present).

## Convex return contracts

- Convex queries and mutations use **validators** (`returns: v.object(...)`) that must match the returned value **exactly**.
- For `users:getCurrentUser`, the server explicitly returns only `_id`, `clerkId`, `displayName`, `imageUrl`, and `role`; internal Convex fields like `_creationTime` are **not** part of the public contract.
- If a handler returns additional fields (for example by returning the raw document), Convex will throw a `ReturnsValidationError`. Always keep the validator and returned object in sync.
