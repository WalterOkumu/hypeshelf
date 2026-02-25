/**
 * Role guard helpers. Use these instead of inline role string comparisons.
 * Role is always read from Convex DB in mutations; these are for client-side UX only.
 */

export type Role = "admin" | "user";

export function isAdmin(role: Role | null | undefined): boolean {
  return role === "admin";
}

export function isUser(role: Role | null | undefined): boolean {
  return role === "user";
}

export function canDeleteAnyRecommendation(role: Role | null | undefined): boolean {
  return role === "admin";
}

export function canToggleStaffPick(role: Role | null | undefined): boolean {
  return role === "admin";
}
