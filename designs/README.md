# HypeShelf UI Design

This folder holds design deliverables for the HypeShelf take-home assignment.

## Contents

- **README.md** (this file) – Overview and how to use the designs.
- **DESIGN_IMPLEMENTATION.md** – Spec for building the UI in Pencil (.pen): tokens, components, and four screens. Use when Pencil app is connected via MCP.
- **mockups/** – Static HTML/CSS mockups of the four key screens, aligned to [DESIGN_SPEC](../src/docs/DESIGN_SPEC.md). Open in a browser to view.

## User use cases

| Persona   | Access        | UI focus |
|----------|----------------|----------|
| Visitor  | `/` only       | Read-only cards; CTA "Sign in to add yours". |
| User     | `/`, `/dashboard` | Add rec, filter by genre, delete own cards only. |
| Admin    | `/`, `/dashboard` | Same as User + delete any card, Staff Pick toggle on every card. |

## Screens

1. **Public landing (`/`)** – Header, hero + tagline, CTA, Latest Picks grid (read-only cards).
2. **Dashboard – User** – Header (avatar, Sign out), Add Recommendation, filter pills, card grid (Delete on own cards only).
3. **Dashboard – Admin** – Same layout; every card has Delete + Staff Pick toggle.
4. **Add Recommendation modal** – Title, Genre, Link (optional), Blurb; character counters; Submit + Cancel.

## References

- [PRD](../src/docs/PRD.md) – Requirements and acceptance criteria.
- [ARCHITECTURE](../src/docs/ARCHITECTURE.md) – Data model and Convex/Clerk flow.
- [DESIGN_SPEC](../src/docs/DESIGN_SPEC.md) – Colours, typography, components.
- Plan: `.cursor/plans/hypeshelf_take-home_ui_design_*.plan.md`.
