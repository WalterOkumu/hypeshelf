"use client";

import { useCurrentUser } from "./useCurrentUser";
import type { Role } from "@/lib/roles";

/**
 * Returns the current user's role from Convex, or null if not loaded / not authenticated.
 */
export function useCurrentRole(): Role | null | undefined {
  const user = useCurrentUser();
  return (user?.role as Role | undefined) ?? null;
}
