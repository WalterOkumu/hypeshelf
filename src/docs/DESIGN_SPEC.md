# HypeShelf – Design Specification
**Version:** 1.0  
**Date:** 2025-02-25  
**Status:** Approved  

---

## 1. Design Philosophy

HypeShelf should feel like a **curated, social cork-board** — warm, expressive, but never cluttered. The aesthetic borrows from independent magazines and Letterboxd-style community tools: confident typography, generous whitespace, and subtle personality.

Core principles:
1. **Content first** — recommendations are the hero; chrome is minimal
2. **Clarity over cleverness** — every interaction should be self-evident
3. **Consistent feedback** — every action gets a visible response (loading, success, error)
4. **Mobile-ready** — designed mobile-first, progressively enhanced for desktop

---

## 2. Brand Identity

### 2.1 Logo & Wordmark
- Wordmark: **"HypeShelf"** in `Inter` 700 weight, styled with a gradient from `Indigo 500` → `Purple 500`
- Optional icon: a small stylised shelf/stack glyph to the left of the wordmark
- Minimum size: 120px wide (do not render smaller)

### 2.2 Tagline
> "Collect and share the stuff you're hyped about."

Rendered in `Inter` 400, `text-slate-500`, `text-lg` below the wordmark on the landing page.

### 2.3 Tone
- Casual but polished
- Short, punchy micro-copy ("Add yours", "Staff Pick ⭐", "Drop a rec")
- Error messages: direct and friendly, never technical ("Something went wrong. Try again." not "500 Internal Server Error")

---

## 3. Colour Tokens

All colours use Tailwind's default palette. Do **not** introduce custom hex values.

| Token | Tailwind Class | Usage |
|-------|---------------|-------|
| Brand Primary | `indigo-500` / `indigo-600` | CTAs, active states, links |
| Brand Accent | `purple-500` | Gradient, Staff Pick badge |
| Surface Base | `white` / `slate-950` (dark) | Page background |
| Surface Elevated | `slate-50` / `slate-900` (dark) | Cards, modals |
| Border | `slate-200` / `slate-700` (dark) | Card borders, dividers |
| Text Primary | `slate-900` / `slate-50` (dark) | Headings, body text |
| Text Muted | `slate-500` | Timestamps, subtitles |
| Success | `emerald-500` | Toast success |
| Error | `red-500` | Validation errors, error toasts |
| Staff Pick | `amber-400` | Badge background |
| Genre Badges | See §6.3 | Per-genre accent colour |

---

## 4. Typography

Font family: **Inter** (Google Fonts or `next/font/google`)

| Role | Size | Weight | Class |
|------|------|--------|-------|
| Page title (H1) | 36–48px | 700 | `text-4xl font-bold` |
| Section heading (H2) | 24px | 600 | `text-2xl font-semibold` |
| Card title | 18px | 600 | `text-lg font-semibold` |
| Body / blurb | 14–16px | 400 | `text-sm` / `text-base` |
| Label / badge | 12px | 500 | `text-xs font-medium` |
| Timestamp / muted | 12px | 400 | `text-xs text-slate-500` |

Line height: `leading-relaxed` on body text, `leading-tight` on headings.

---

## 5. Spacing & Layout

- Base unit: 4px (Tailwind default)
- Page max-width: `max-w-5xl` (1024px) centred with `mx-auto px-4 md:px-8`
- Card grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`
- Section spacing: `py-12` between major sections
- Component internal padding: `p-4` for cards, `p-6` for modals

---

## 6. Component Specifications

### 6.1 Navigation / Header

```
┌─────────────────────────────────────────────────────────┐
│  🎬 HypeShelf               [Avatar ▾]  [Sign Out]       │
└─────────────────────────────────────────────────────────┘
```

- Sticky, `backdrop-blur-sm bg-white/80` (or dark equivalent)
- Height: `h-16`
- Left: Logo wordmark (links to `/`)
- Right (authenticated): User avatar (32px circle) + display name + Sign Out button
- Right (unauthenticated): "Sign in" ghost button
- No hamburger menu needed for MVP (single-level nav)

### 6.2 Public Landing Page Layout

```
┌──────────────────────────────────────────────┐
│              HEADER                          │
├──────────────────────────────────────────────┤
│                                              │
│   🎬 HypeShelf                               │
│   "Collect and share the stuff               │
│    you're hyped about."                      │
│                                              │
│   [ Sign in to add yours ▶ ]                 │
│                                              │
├──────────────────────────────────────────────┤
│   Latest Picks                               │
│                                              │
│   ┌──────┐  ┌──────┐  ┌──────┐             │
│   │ Card │  │ Card │  │ Card │             │
│   └──────┘  └──────┘  └──────┘             │
│                                              │
└──────────────────────────────────────────────┘
```

- Hero section: full-width, `py-24`, centred text
- "Latest Picks" section heading: `text-2xl font-semibold mb-6`
- Cards: read-only (no action buttons)

### 6.3 Recommendation Card

```
┌─────────────────────────────────┐
│  ⭐ Staff Pick          [Genre] │  ← badges row (conditional)
│                                 │
│  Movie Title                    │  ← text-lg font-semibold
│  "Blurb text truncated to       │  ← text-sm text-slate-600
│   two lines max..."             │
│                                 │
│  🔗 Watch here                  │  ← optional link
│                                 │
│  ── ── ── ── ── ── ── ── ── ── │
│  [Avatar] DisplayName   2h ago  │  ← footer
│                    [Delete]     │  ← only if owner or admin
└─────────────────────────────────┘
```

- Background: `bg-white dark:bg-slate-900`
- Border: `border border-slate-200 dark:border-slate-700`
- Border radius: `rounded-xl`
- Shadow: `shadow-sm hover:shadow-md transition-shadow`
- Blurb: `line-clamp-2` overflow
- Link: opens in new tab with external link icon

**Genre Badge Colours:**

| Genre | Background | Text |
|-------|-----------|------|
| Horror | `bg-red-100` | `text-red-700` |
| Action | `bg-orange-100` | `text-orange-700` |
| Comedy | `bg-yellow-100` | `text-yellow-700` |
| Drama | `bg-blue-100` | `text-blue-700` |
| Sci-Fi | `bg-cyan-100` | `text-cyan-700` |
| Thriller | `bg-purple-100` | `text-purple-700` |
| Documentary | `bg-green-100` | `text-green-700` |
| Animation | `bg-pink-100` | `text-pink-700` |
| Other | `bg-slate-100` | `text-slate-700` |

**Staff Pick Badge:** `bg-amber-100 text-amber-700` with `⭐` icon prefix.

### 6.4 Add Recommendation Form / Modal

- Triggered by: "Add Recommendation" button (primary CTA in dashboard header)
- Rendered as: Radix UI `Dialog` (or custom) overlaid with `bg-black/50` backdrop
- Modal width: `max-w-lg w-full`
- Form layout: stacked labels and inputs, `gap-4`

**Fields:**

| Field | Input Type | Validation UX |
|-------|-----------|--------------|
| Title | `<input type="text">` | Character counter (0/120) below input; red if over |
| Genre | `<select>` | Required; shows placeholder "Select a genre" |
| Link | `<input type="url">` | Optional; shows inline error if invalid URL on blur |
| Blurb | `<textarea rows={3}>` | Character counter (0/300); red if over |

- Submit button: full-width `bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2`
- Loading state: button text → spinner + "Adding…", disabled
- Cancel: ghost button top-right (`×`) and below the form

### 6.5 Filter Bar (Dashboard)

```
All  |  Horror  |  Action  |  Comedy  |  Drama  |  Sci-Fi  |  Thriller  | ...
```

- Horizontal scrollable pill row on mobile, wrapping on desktop
- Active pill: `bg-indigo-600 text-white`
- Inactive pill: `bg-slate-100 text-slate-700 hover:bg-slate-200`
- Border radius: `rounded-full`
- Padding: `px-4 py-1.5`

### 6.6 Delete Confirmation

- Inline confirmation within the card (no full-screen modal):
  - First click: button label changes to "Confirm delete?" with a red bg + Cancel option
  - Second click: fires mutation
- Alternatively: a lightweight `AlertDialog` (Radix) for explicit confirmation

### 6.7 Toast Notifications

- Position: top-right, `z-50`
- Duration: 3 s auto-dismiss
- Variants: `success` (emerald border), `error` (red border)
- Recommended library: `sonner` (lightweight, compatible with Next.js)

---

## 7. Page States

Every data-fetching view must handle all three states:

| State | Treatment |
|-------|-----------|
| **Loading** | Skeleton cards (same grid layout, `animate-pulse` grey blocks) |
| **Empty** | Friendly empty state illustration + copy: "Nothing here yet. Be the first!" |
| **Error** | Error card with retry button and friendly message |

Skeleton card dimensions must match real card dimensions to prevent layout shift.

---

## 8. Responsive Breakpoints

| Breakpoint | Cards per row | Notes |
|-----------|--------------|-------|
| < 640px (mobile) | 1 | Filter bar scrolls horizontally |
| 640–1023px (tablet) | 2 | Modal full-screen |
| ≥ 1024px (desktop) | 3 | Modal centred overlay |

---

## 9. Animation & Motion

Keep motion subtle. Users with `prefers-reduced-motion` must see no animation.

| Element | Animation |
|---------|-----------|
| Card hover | `shadow-sm → shadow-md` (CSS transition, 150ms) |
| Modal open/close | Fade + scale (100ms ease-out) |
| New card added | Slide in from top (150ms) via Framer Motion `layout` prop |
| Toast | Slide in from right (200ms) |
| Skeleton | `animate-pulse` (Tailwind built-in) |

```css
/* Apply globally for accessibility */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Dark Mode

- Implementation: Tailwind `darkMode: "class"` strategy
- Toggle: system preference by default; manual toggle in header (optional for MVP)
- All colour tokens have explicit `dark:` variants (see §3)
- Images / avatars are not affected

---

## 11. Accessibility Checklist

- [ ] All form inputs have associated `<label>` elements
- [ ] `<Dialog>` traps focus when open; restores on close
- [ ] Keyboard: Tab through all interactive elements; Enter/Space activates buttons
- [ ] Genre filter uses `role="tablist"` / `role="tab"` semantics or accessible button group
- [ ] Colour is never the only way information is conveyed (use icons + colour)
- [ ] Avatar images have `alt` with the user's display name
- [ ] Error messages associated with inputs via `aria-describedby`
- [ ] Loading states announced via `aria-live="polite"` region

---

## 12. File Organisation (Design Assets)

```
src/
  components/
    ui/
      Badge.tsx           # Genre + Staff Pick badges
      Button.tsx          # Primary, ghost, danger variants
      Card.tsx            # Base card wrapper
      Dialog.tsx          # Modal wrapper
      Input.tsx           # Labelled input with error state
      Select.tsx          # Labelled select with error state
      Textarea.tsx        # Labelled textarea with char counter
      Skeleton.tsx        # Animated skeleton block
      Avatar.tsx          # User avatar circle
    features/
      recommendations/
        RecommendationCard.tsx
        RecommendationGrid.tsx
        AddRecommendationForm.tsx
        FilterBar.tsx
        EmptyState.tsx
      auth/
        SignInButton.tsx
        UserMenu.tsx
```
