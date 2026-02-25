# HypeShelf – Architecture Document
**Version:** 1.0  
**Date:** 2025-02-25  
**Status:** Approved  

---

## 1. High-Level Overview

HypeShelf is a full-stack web application built on three primary pillars:

| Pillar | Technology | Responsibility |
|--------|-----------|----------------|
| **Frontend** | Next.js 14 (App Router) | Pages, UI, server components, ISR |
| **Auth** | Clerk | Identity, session management, role metadata |
| **Backend / DB** | Convex | Reactive database, serverless mutations/queries, webhook handlers |

```
┌────────────────────────────────────────────────────────────────┐
│                         Browser / Client                       │
│                                                                │
│   Next.js RSC (HTML)  ◄──►  Next.js Client Components        │
│        │                          │                            │
│        │                   Convex useQuery /                   │
│        │                   useMutation (WebSocket)             │
└────────┼──────────────────────────┼────────────────────────────┘
         │                          │
         ▼                          ▼
┌─────────────────┐      ┌──────────────────────┐
│   Clerk (Auth)  │      │   Convex Cloud        │
│                 │      │                       │
│  - Sessions     │      │  - Queries            │
│  - JWT tokens   │─────►│  - Mutations          │
│  - Webhooks     │      │  - DB (document store)│
│  - Metadata     │      │  - Auth integration   │
└─────────────────┘      └──────────────────────┘
         │
         │ webhook (user.created / user.updated)
         ▼
┌──────────────────────┐
│  Convex HTTP Action  │
│  (webhook handler)   │
└──────────────────────┘
```

---

## 2. Repository Structure

```
hypeshelf/
├── .cursorrules                  # AI coding rules
├── .env.example                  # Env var documentation (no secrets)
├── .env.local                    # Local secrets (git-ignored)
├── .gitignore
├── README.md
├── PRD.md
├── DESIGN_SPEC.md
├── ARCHITECTURE.md               # This file
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── convex/
│   ├── schema.ts                 # DB schema + indexes
│   ├── recommendations.ts        # Queries + mutations for recs
│   ├── users.ts                  # User sync queries + mutations
│   ├── http.ts                   # HTTP actions (Clerk webhook)
│   ├── auth.config.ts            # Convex ↔ Clerk JWT config
│   └── _generated/               # Auto-generated types (never edit)
└── src/
    ├── app/
    │   ├── layout.tsx             # Root layout (ConvexClerkProvider)
    │   ├── globals.css
    │   ├── (public)/
    │   │   └── page.tsx           # Landing page (ISR)
    │   ├── (auth)/
    │   │   ├── layout.tsx         # Auth guard layout
    │   │   └── dashboard/
    │   │       └── page.tsx       # Main dashboard
    │   └── api/
    │       └── webhooks/
    │           └── clerk/
    │               └── route.ts   # Clerk webhook Next.js proxy (optional)
    ├── components/
    │   ├── ui/                    # Primitive components
    │   └── features/              # Feature components
    ├── lib/
    │   ├── utils.ts               # cn(), misc helpers
    │   ├── roles.ts               # Role guard helpers
    │   └── validations.ts         # Zod schemas + constants
    ├── hooks/
    │   ├── useCurrentUser.ts
    │   └── useCurrentRole.ts
    └── types/
        └── index.ts               # Shared TS types
```

---

## 3. Database Schema

Defined in `convex/schema.ts`:

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const GENRES = [
  "horror", "action", "comedy", "drama",
  "sci-fi", "thriller", "documentary", "animation", "other"
] as const;

export default defineSchema({
  users: defineTable({
    clerkId    : v.string(),          // Clerk user.id
    displayName: v.string(),
    imageUrl   : v.string(),
    role       : v.union(v.literal("admin"), v.literal("user")),
  }).index("by_clerkId", ["clerkId"]),

  recommendations: defineTable({
    userId     : v.id("users"),       // FK → users._id
    title      : v.string(),          // max 120 chars (enforced in mutation)
    genre      : v.union(...GENRES.map(g => v.literal(g))),
    link       : v.optional(v.string()),
    blurb      : v.string(),          // max 300 chars
    isStaffPick: v.boolean(),
    createdAt  : v.number(),          // Date.now()
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_userId",    ["userId"])
    .index("by_genre",     ["genre"]),
});
```

### 3.1 Index Strategy

| Index | Table | Fields | Used by |
|-------|-------|--------|---------|
| `by_clerkId` | users | `clerkId` | Webhook user lookup, auth helpers |
| `by_createdAt` | recommendations | `createdAt` | Latest 10 on public page |
| `by_userId` | recommendations | `userId` | User's own recs (delete guard) |
| `by_genre` | recommendations | `genre` | Genre filter (server-side option) |

---

## 4. Convex Backend Functions

### 4.1 `convex/users.ts`

```
getUserByClerkId(clerkId)  → query (internal)
  Purpose: look up internal User record by Clerk ID
  Auth: none (called from webhook + auth helpers)

upsertUser({ clerkId, displayName, imageUrl, role })  → internalMutation
  Purpose: create or update user record on Clerk webhook
  Auth: internal only (not callable from client)

getCurrentUser()  → query
  Purpose: returns full user record for the authenticated caller
  Auth: requires Clerk session
```

### 4.2 `convex/recommendations.ts`

```
listLatestPublic(count?)  → query
  Purpose: returns the N most recent recs (default 10), public
  Auth: none
  Returns: rec fields + denormalised { displayName, imageUrl } from users

listAll()  → query
  Purpose: returns all recs for dashboard view
  Auth: requires Clerk session
  Returns: rec fields + denormalised user info

addRecommendation({ title, genre, link?, blurb })  → mutation
  Purpose: create a new recommendation
  Auth: requires Clerk session
  Sets: userId (from session), createdAt, isStaffPick = false
  Validates: title ≤ 120, blurb ≤ 300, link valid URL if present

deleteRecommendation({ id })  → mutation
  Purpose: delete a recommendation
  Auth: requires Clerk session
  Guard: if role === "user", verify rec.userId === caller's userId
         if role === "admin", allow unconditionally

toggleStaffPick({ id })  → mutation
  Purpose: set isStaffPick = true, clear previous Staff Pick
  Auth: requires Clerk session AND role === "admin"
  Side effect: previous Staff Pick (if any) is unset in same mutation
```

### 4.3 `convex/http.ts` — Clerk Webhook Handler

```
POST /clerk-webhook
  Verifies: svix signature headers
  Handles:
    user.created  →  upsertUser({ ..., role: "user" })
    user.updated  →  upsertUser({ ...updated fields })
  Returns: 200 OK or 400 on signature failure
```

---

## 5. Authentication & RBAC Architecture

### 5.1 Flow Diagram

```
User visits /dashboard
        │
        ▼
Clerk middleware (middleware.ts)
        │
        ├─ No session? ──► Redirect to /sign-in
        │
        └─ Session exists
                │
                ▼
        Convex query (getCurrentUser)
                │
                ▼
        User record from DB (includes role)
                │
                ├─ role === "admin" ──► Admin UI controls visible
                └─ role === "user"  ──► Only own-rec controls visible
```

### 5.2 Role Propagation

```
1. Admin sets role in Clerk Dashboard:
   publicMetadata = { role: "admin" }

2. Clerk fires user.updated webhook

3. Convex HTTP action receives webhook, verifies svix signature

4. internalMutation upsertUser updates role in users table

5. Client calls getCurrentUser() query → gets updated role

6. UI conditionally renders admin controls based on role
```

### 5.3 Server-Side Role Enforcement (Critical)

Every sensitive mutation:

```ts
// convex/recommendations.ts
export const deleteRecommendation = mutation({
  args: { id: v.id("recommendations") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    // 2. Load caller's DB record (single source of truth for role)
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", q => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    // 3. Load target record
    const rec = await ctx.db.get(id);
    if (!rec) throw new ConvexError("Not found");

    // 4. Authorise
    if (user.role !== "admin" && rec.userId !== user._id) {
      throw new ConvexError("Forbidden");
    }

    // 5. Act
    await ctx.db.delete(id);
    return null;
  },
});
```

**Key security properties:**
- Role is read from the DB inside the mutation — never from the client request
- Ownership is verified using internal user ID, not Clerk ID strings
- `ConvexError` messages are safe to surface to the client (no internals leaked)

---

## 6. Data Flow Diagrams

### 6.1 Public Page Load

```
Browser
  │
  ├─ GET /  (Next.js ISR, revalidate: 60s)
  │       │
  │       └─► server component calls fetchQuery(listLatestPublic)
  │                    │
  │                    └─► Convex DB (by_createdAt index)
  │                              │
  │                              └─► returns 10 recs + user info
  │
  └─► HTML streamed to browser (no client-side fetch needed)
```

### 6.2 Adding a Recommendation (Authenticated)

```
User fills form → clicks Submit
  │
  ├─ Zod validation (client) → show inline errors if invalid
  │
  └─ useMutation(addRecommendation)({ title, genre, link, blurb })
          │
          ├─ Optimistic update: card appears immediately in list
          │
          └─► Convex mutation:
                  ├─ authenticate (identity check)
                  ├─ validate args (server-side)
                  ├─ set userId, createdAt, isStaffPick=false
                  └─► db.insert("recommendations", {...})
                              │
                              └─► Convex pushes update to all
                                  subscribed clients via WebSocket
```

### 6.3 Admin Toggle Staff Pick

```
Admin clicks "Staff Pick" toggle on card
  │
  └─ useMutation(toggleStaffPick)({ id })
          │
          └─► Convex mutation:
                  ├─ authenticate
                  ├─ load user → verify role === "admin"
                  ├─ query for existing Staff Pick
                  │       └─ if found: db.patch(existingId, { isStaffPick: false })
                  └─► db.patch(id, { isStaffPick: true })
                              │
                              └─► All clients updated reactively
```

---

## 7. Next.js Routing & Middleware

### 7.1 Route Structure

| Route | Type | Auth Required | Notes |
|-------|------|--------------|-------|
| `/` | RSC (ISR) | No | Public shelf, read-only |
| `/dashboard` | Client Component | Yes | Full shelf + add form |
| `/sign-in` | Clerk hosted | No | Handled by Clerk |
| `/sign-up` | Clerk hosted | No | Handled by Clerk |

### 7.2 Middleware (`src/middleware.ts`)

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtected = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isProtected(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### 7.3 Provider Hierarchy (`src/app/layout.tsx`)

```tsx
<html>
  <body>
    <ConvexProviderWithClerk client={convex}>
      <ClerkProvider>
        {children}
      </ClerkProvider>
    </ConvexProviderWithClerk>
  </body>
</html>
```

---

## 8. Environment Variables

Documented in `.env.example`:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
CLERK_WEBHOOK_SECRET=whsec_...

# Convex
NEXT_PUBLIC_CONVEX_URL=https://....convex.cloud
```

**Security rules:**
- `NEXT_PUBLIC_*` variables are safe to expose to the browser
- `CLERK_SECRET_KEY` and `CLERK_WEBHOOK_SECRET` are server-only; never prefix with `NEXT_PUBLIC_`
- `.env.local` is git-ignored; `.env.example` is committed with placeholder values

---

## 9. Key Architectural Decisions

### ADR-001: Convex over traditional REST API

**Decision:** Use Convex reactive database instead of a custom API layer (e.g., Prisma + tRPC).

**Rationale:**
- Real-time subscriptions are first-class citizens — no polling needed
- Convex's `args` validators serve as the server-side type contract
- Reduces boilerplate: no ORM, no migration files for simple schemas
- Built-in Clerk integration via `convex/nextjs` and JWT template

**Trade-off:** Vendor lock-in to Convex platform. Acceptable for this project scope.

### ADR-002: Role stored in both Clerk metadata AND Convex DB

**Decision:** Role is written to Clerk `publicMetadata` (source of truth for assignment) and synced to the Convex `users` table on webhook.

**Rationale:**
- Convex mutations need to check role without making external HTTP calls to Clerk
- Convex DB lookup is fast (indexed) and transactional with the rest of the mutation logic
- Prevents TOCTOU (time-of-check-time-of-use) issues if role changes mid-request

**Risk:** DB role could go stale if webhook delivery fails.
**Mitigation:** Webhook verified via svix; Convex retries failed HTTP actions.

### ADR-003: Client-side genre filtering (MVP)

**Decision:** Filter by genre is applied client-side after loading all recs.

**Rationale:**
- Simplest implementation for MVP volume (likely < 1000 recs)
- No extra DB round-trip on filter change = instant UI response

**Upgrade path:** If rec count grows, switch to `listAll` query accepting a `genre` arg that uses the `by_genre` index.

### ADR-004: ISR for public page

**Decision:** Public landing page uses Incremental Static Regeneration (revalidate: 60s).

**Rationale:**
- Near-zero TTFB for unauthenticated visitors (CDN-cached)
- "Latest 10" recs are acceptable to be 60s stale on the public page
- Dashboard uses real-time Convex subscriptions for live data

### ADR-005: No edit functionality

**Decision:** Users cannot edit recommendations after posting.

**Rationale:**
- Reduces attack surface (no partial-update logic to secure)
- Keeps the schema and mutations simple
- Common pattern for recommendation feeds (immutable posts)

---

## 10. Security Model Summary

| Threat | Mitigation |
|--------|-----------|
| Unauthenticated write | All mutations verify `ctx.auth.getUserIdentity()` |
| Privilege escalation (user acting as admin) | Role read from Convex DB inside every mutation |
| Horizontal privilege (deleting others' recs) | Ownership check `rec.userId === user._id` in mutation |
| Webhook forgery | `svix.verify()` on every Clerk webhook request |
| XSS via user content | React escapes all JSX output by default; no `dangerouslySetInnerHTML` |
| Open redirect | Only Clerk-controlled redirect URLs used post-auth |
| Sensitive env vars in browser | Only `NEXT_PUBLIC_*` vars sent to client |
| Malformed input | Convex `args` validators reject unexpected field types/values |

---

## 11. Development Setup

```bash
# 1. Clone and install
git clone <repo>
pnpm install

# 2. Configure environment
cp .env.example .env.local
# fill in Clerk + Convex keys

# 3. Start Convex dev server
pnpm convex dev

# 4. Start Next.js dev server
pnpm dev

# 5. Seed admin user (first time only)
# Sign up normally, then in Clerk Dashboard:
# Users → select user → Metadata → publicMetadata → set { "role": "admin" }
# Wait for webhook to sync role to Convex (or manually run seed script)
```

### 11.1 Convex Clerk JWT Template

In Convex Dashboard → Auth → Add Clerk:
1. Paste your Clerk `issuer` URL
2. In Clerk Dashboard → JWT Templates → New → Convex preset
3. Copy the JWKS endpoint URL into Convex

---

## 12. Testing Strategy

| Layer | Tool | Coverage Target |
|-------|------|----------------|
| Utility functions (`lib/`) | Vitest | ≥ 80% |
| Convex helper logic | Vitest (pure functions extracted) | ≥ 60% |
| Component rendering | React Testing Library | Key paths |
| E2E (auth, add, delete, RBAC) | Playwright | Critical flows |

### Critical E2E Test Cases

1. **Visitor** can see public page without signing in
2. **Visitor** clicking CTA redirects to Clerk sign-in
3. **User** can sign in and see dashboard
4. **User** can add a recommendation and see it appear
5. **User** can delete their own recommendation
6. **User** cannot delete another user's recommendation (UI guard + server guard)
7. **Admin** can delete any recommendation
8. **Admin** can toggle Staff Pick; only one exists at a time
9. Direct API call to `deleteRecommendation` with wrong userId returns `ConvexError("Forbidden")`

---

## 13. Deployment

| Target | Platform |
|--------|---------|
| Frontend | Vercel (auto-deploy on `main` branch push) |
| Backend / DB | Convex Cloud (managed, auto-scales) |
| Auth | Clerk Cloud (managed) |

**Post-deploy checklist:**
- [ ] Set all env vars in Vercel project settings
- [ ] Register Clerk webhook endpoint: `https://<your-domain>/api/webhooks/clerk`
- [ ] Confirm webhook events: `user.created`, `user.updated`
- [ ] Verify `CLERK_WEBHOOK_SECRET` matches the one in Clerk Dashboard
- [ ] Run E2E smoke tests against production URL
