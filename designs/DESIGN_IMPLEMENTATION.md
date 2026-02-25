# HypeShelf – Pencil Design Implementation Spec

Use this spec when building the UI in Pencil (.pen). The plan assumes design-system patterns: Header + Content, Card Grid, Modal, Filter Bar.

---

## 1. Design tokens / theme

Define variables to match DESIGN_SPEC §3–4:

| Token | Value / usage |
|-------|----------------|
| Background | `#FFFFFF` (light), `#020617` slate-950 (dark) |
| Foreground | `#0f172a` slate-900 (light), `#f8fafc` slate-50 (dark) |
| Muted | `#64748b` slate-500 |
| Primary | `#6366f1` indigo-500, `#4f46e5` indigo-600 hover |
| Border | `#e2e8f0` slate-200, `#334155` slate-700 dark |
| Card | `#f8fafc` slate-50, `#0f172a` slate-900 dark |
| Staff Pick | `#fbbf24` amber-400; badge bg `#fef3c7` amber-100, text `#b45309` amber-700 |
| Success | `#10b981` emerald-500 |
| Error | `#ef4444` red-500 |
| Radius | Cards/modals: 12px (rounded-xl); pills: 9999px (rounded-full) |
| Font | Inter: 700 wordmark, 600 headings, 400 body, 500 labels |

---

## 2. Reusable components (define first)

### 2.1 Recommendation card (base)

- **Frame:** vertical layout, padding 16px, border 1px, radius 12px, shadow-sm.
- **Badges row (optional):** horizontal; Staff Pick badge (amber) + Genre badge (per-genre colour from DESIGN_SPEC §6.3).
- **Title:** 18px semibold.
- **Blurb:** 14px, muted, line-clamp 2.
- **Link (optional):** "Watch here" + external icon.
- **Footer:** horizontal; left: avatar 32px + display name + timestamp; right (slot): Delete and/or Staff Pick for User/Admin variants.

**Card variants:**

- **Public:** No footer actions.
- **User:** Delete button in footer only when card is “owned”.
- **Admin:** Delete + Staff Pick toggle on every card.

### 2.2 Header

- **Height:** 64px. Sticky; blur/surface.
- **Left:** Logo wordmark "HypeShelf" (min 120px), gradient indigo→purple.
- **Right (unauthenticated):** Ghost button "Sign in".
- **Right (authenticated):** Avatar 32px circle + display name + "Sign out" button.

### 2.3 Filter bar

- Horizontal row of pills: All, Horror, Action, Comedy, Drama, Sci-Fi, Thriller, Documentary, Animation, Other.
- **Active pill:** indigo-600 bg, white text, rounded-full, px-4 py-1.5.
- **Inactive:** slate-100 bg, slate-700 text, same padding/radius.

---

## 3. Screens to create

### 3.1 Public landing (`/`)

- **Layout:** Vertical; max-width 1024px, centred.
- **Header:** Unauthenticated variant.
- **Hero:** Centred; wordmark "HypeShelf"; tagline "Collect and share the stuff you're hyped about."; primary CTA "Sign in to add yours".
- **Section:** "Latest Picks" (H2); grid 1/2/3 columns (responsive); 10 read-only recommendation cards (public variant, no actions).

### 3.2 Dashboard – User view (`/dashboard`)

- **Header:** Authenticated variant (avatar, name, Sign out).
- **Top bar:** "Add Recommendation" primary button.
- **Filter bar:** Pills with "All" active.
- **Content:** Card grid; recommendation cards in **User** variant (Delete only on one example “owned” card).

### 3.3 Dashboard – Admin view (`/dashboard`)

- Same as User view.
- Card grid uses **Admin** variant: every card has Delete + Staff Pick toggle; one card shows Staff Pick badge.

### 3.4 Add Recommendation modal

- **Overlay:** Semi-transparent backdrop.
- **Modal:** max-width 512px; vertical form.
- **Fields:** Title (required, 0/120), Genre (select, required), Link (optional URL), Blurb (required, 0/300). Show character counters.
- **Actions:** Cancel (ghost), Submit (primary, full-width).

---

## 4. Genre badge colours (DESIGN_SPEC §6.3)

| Genre | Bg | Text |
|-------|-----|------|
| Horror | red-100 | red-700 |
| Action | orange-100 | orange-700 |
| Comedy | yellow-100 | yellow-700 |
| Drama | blue-100 | blue-700 |
| Sci-Fi | cyan-100 | cyan-700 |
| Thriller | purple-100 | purple-700 |
| Documentary | green-100 | green-700 |
| Animation | pink-100 | pink-700 |
| Other | slate-100 | slate-700 |

---

## 5. Implementation order in Pencil

1. New document → save as `designs/hypeshelf.pen` (or `src/docs/hypeshelf.pen`).
2. Set variables (tokens) per §1.
3. Build Recommendation card (base), then Header, then Filter bar.
4. Build Public landing, then Dashboard User, then Dashboard Admin, then Add Recommendation modal.
5. Optional: use `get_style_guide` with tags e.g. `webapp`, `dashboard`, `minimal` for visual direction.
6. Use `get_screenshot` on key frames to validate.
