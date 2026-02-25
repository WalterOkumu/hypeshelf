# HypeShelf – Product Requirements Document (PRD)
**Version:** 1.0  
**Date:** 2025-02-25  
**Status:** Approved for development  
**Author:** Walter Okumu Oriaro

---

## 1. Overview

### 1.1 Purpose
This document defines the functional and non-functional requirements for **HypeShelf**, a shared recommendations hub where users log in and publicly share their favourite movies and media. It serves as the single source of truth for scope, behaviour, and acceptance criteria during development.

### 1.2 Background
HypeShelf is a take-home assignment demonstrating proficiency in Next.js (App Router), Clerk authentication, Convex backend, and TypeScript with role-based access control (RBAC).

### 1.3 Tagline
> **"Collect and share the stuff you're hyped about."**

### 1.4 Goals
| Goal | Metric |
|------|--------|
| Demonstrate clean, secure code architecture | Evaluator review |
| Show end-to-end auth + RBAC implementation | All role tests pass |
| Deliver a polished, minimal UI | Lighthouse accessibility ≥ 90 |
| Provide clear documentation | README + inline JSDoc complete |

---

## 2. Scope

### 2.1 In Scope (MVP)
- Public landing page with latest recommendations
- Sign-in via Clerk (Google OAuth + email/password)
- Authenticated dashboard to add and browse recommendations
- Filter recommendations by genre
- RBAC: `admin` and `user` roles with distinct permissions
- Admin: delete any rec + mark as "Staff Pick"
- User: create and delete only their own recs

### 2.2 Out of Scope (Post-MVP)
- Comments / replies on recommendations
- User profile pages
- Notifications
- Mobile native apps
- Multiple media types beyond movies (Phase 2)
- Search / full-text indexing

---

## 3. Users & Roles

### 3.1 Personas

**Visitor (unauthenticated)**
- Arrives at landing page via link or direct URL
- Wants to browse trending recommendations without signing up
- No write access whatsoever

**User (authenticated)**
- Signs in with Clerk
- Wants to add personal recommendations and see the community shelf
- Can manage only their own content

**Admin (authenticated + elevated)**
- Assigned via Clerk `publicMetadata.role = "admin"`
- Manages content quality: removes inappropriate recs, highlights picks
- Can operate on all content

### 3.2 Role Assignment
- Default role on signup: `user`
- Admin role set manually via Clerk Dashboard (or seeded for the assignment)
- Role synced to Convex `users` table via Clerk webhook on `user.created` and `user.updated`
- Convex functions re-read role from DB; never trust client-provided role claims

---

## 4. Functional Requirements

### 4.1 Public Page (`/`)

| ID | Requirement | Priority |
|----|-------------|----------|
| P-01 | Display HypeShelf logo and tagline | Must |
| P-02 | Show a read-only list of the **10 most recently added** recommendations, ordered newest-first | Must |
| P-03 | Each recommendation card shows: `title`, `genre`, `blurb` (truncated to 100 chars), and the submitter's display name | Must |
| P-04 | Cards marked "Staff Pick" display a visible badge | Must |
| P-05 | Display a **"Sign in to add yours"** CTA button wired to Clerk's `SignInButton` | Must |
| P-06 | If user is already authenticated, CTA changes to **"Go to your shelf"** linking to `/dashboard` | Should |
| P-07 | Page must be statically rendered (ISR with 60-second revalidation) | Should |

### 4.2 Authentication

| ID | Requirement | Priority |
|----|-------------|----------|
| A-01 | Clerk handles all authentication; no custom auth logic | Must |
| A-02 | Supported methods: Google OAuth, email/password | Must |
| A-03 | After sign-in, redirect to `/dashboard` | Must |
| A-04 | After sign-out, redirect to `/` | Must |
| A-05 | Unauthenticated requests to `/dashboard/*` redirect to sign-in | Must |
| A-06 | Clerk webhook `user.created` creates a record in Convex `users` table with default role `user` | Must |
| A-07 | Clerk webhook `user.updated` syncs `displayName` and `imageUrl` to Convex | Must |

### 4.3 Dashboard (`/dashboard`)

| ID | Requirement | Priority |
|----|-------------|----------|
| D-01 | Show the authenticated user's display name and avatar in the header | Must |
| D-02 | Show all recommendations in a card grid, ordered newest-first | Must |
| D-03 | Each card displays: title, genre badge, blurb, link (if provided), submitter name + avatar, timestamp | Must |
| D-04 | "Staff Pick" cards display a distinct badge | Must |
| D-05 | Filter bar allows filtering by genre; "All" selected by default | Must |
| D-06 | Filtering is client-side (no extra DB round-trip for MVP) | Should |
| D-07 | "Add Recommendation" button opens a form/modal | Must |
| D-08 | Sign out button visible and functional | Must |

### 4.4 Add Recommendation

| ID | Requirement | Priority |
|----|-------------|----------|
| R-01 | Form fields: `title` (required), `genre` (required, select), `link` (optional, URL), `blurb` (required, textarea) | Must |
| R-02 | Genre options: Horror, Action, Comedy, Drama, Sci-Fi, Thriller, Documentary, Animation, Other | Must |
| R-03 | Field validation (client): title max 120 chars, blurb max 300 chars, link must be valid URL if provided | Must |
| R-04 | Validation mirrored server-side in Convex `args` validators | Must |
| R-05 | On success: form closes, new card appears at top of list (optimistic update) | Should |
| R-06 | On error: display inline error message; form stays open | Must |
| R-07 | `userId` and `createdAt` are set server-side in the mutation; never trusted from client | Must |

### 4.5 User – Delete Own Recommendation

| ID | Requirement | Priority |
|----|-------------|----------|
| U-01 | "Delete" button visible only on cards the authenticated user owns | Must |
| U-02 | Clicking delete shows a confirmation prompt before the mutation fires | Should |
| U-03 | Convex mutation verifies `recommendation.userId === identity.subject` before deleting | Must |
| U-04 | If ownership check fails, throw `ConvexError("Forbidden")` | Must |

### 4.6 Admin Capabilities

| ID | Requirement | Priority |
|----|-------------|----------|
| ADM-01 | Admin sees "Delete" on every card, not just their own | Must |
| ADM-02 | Admin sees "Staff Pick" toggle on every card | Must |
| ADM-03 | Only one recommendation can be "Staff Pick" at a time (toggle off previous pick) | Should |
| ADM-04 | Convex mutations for admin actions verify role from DB before executing | Must |
| ADM-05 | Regular users receive no client-side indication that admin mutations exist | Should |

---

## 5. Non-Functional Requirements

### 5.1 Performance
- Public page Largest Contentful Paint (LCP) < 2.5 s on mid-range device
- Dashboard initial load < 3 s on 4G
- Convex queries return in < 500 ms (P95)

### 5.2 Security
- No secrets in source code or client bundles
- All mutations authenticate before acting
- Ownership and role checks are server-side only
- External links use `rel="noopener noreferrer"`
- Clerk webhook signature verified via `svix` before processing

### 5.3 Accessibility
- Lighthouse accessibility score ≥ 90
- All interactive elements keyboard-navigable
- Images and icons have alt text / aria-labels
- Colour contrast ratio ≥ 4.5:1

### 5.4 Maintainability
- TypeScript strict mode with no `any`
- 80%+ test coverage on utility functions
- JSDoc on all exported symbols
- All env vars documented in `.env.example`

---

## 6. Data Model (Summary)

Full schema in `ARCHITECTURE.md`. Brief overview:

**`users` table**
- `clerkId` (string, indexed) — Clerk `user.id`
- `displayName` (string)
- `imageUrl` (string)
- `role` (`"admin" | "user"`)

**`recommendations` table**
- `userId` (Id<"users">)
- `title` (string, max 120)
- `genre` (union of genre strings)
- `link` (optional string)
- `blurb` (string, max 300)
- `isStaffPick` (boolean, default false)
- `createdAt` (number — `Date.now()`)

---

## 7. Acceptance Criteria Summary

| Feature | Acceptance Criterion |
|---------|----------------------|
| Public page | Visitor can see 10 latest recs without signing in |
| Sign-in CTA | Clicking CTA initiates Clerk sign-in flow; authenticated users see "Go to your shelf" instead |
| Add rec | Signed-in user can successfully add a rec; it appears immediately |
| User delete | User can delete their own rec via inline confirmation; cannot delete others' and never sees Staff Pick controls |
| Admin delete | Admin can delete any rec; delete control is present on all cards |
| Staff Pick | Admin can toggle Staff Pick on any card; badge appears on card for all visitors/users/admins |
| Filter | Selecting a genre filters visible cards correctly |
| Auth guard | Visiting `/dashboard` unauthenticated redirects to sign-in |
| Role enforcement | Attempting admin mutation as `user` returns `ConvexError("Forbidden")` |

---

## 8. Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| next | 14.x | App Router framework |
| @clerk/nextjs | latest | Authentication |
| convex | latest | Reactive DB + backend |
| zod | 3.x | Runtime validation |
| tailwindcss | 3.x | Styling |
| clsx + tailwind-merge | latest | Class utility |
| svix | latest | Clerk webhook verification |

---

## 9. Open Questions / Assumptions

| # | Question | Assumption |
|---|----------|------------|
| 1 | Is pagination required? | No — latest 10 on public page; all on dashboard (no pagination for MVP) |
| 2 | Can a user edit a rec after posting? | No — out of scope for this assignment |
| 3 | Should the link field open in a new tab? | Yes, always `target="_blank"` + `rel="noopener noreferrer"` |
| 4 | How is the admin first created? | Manually via Clerk Dashboard + seed script documented in README |
