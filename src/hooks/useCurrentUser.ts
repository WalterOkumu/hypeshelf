"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

export interface ConvexUser {
  _id: Id<"users">;
  clerkId: string;
  displayName: string;
  imageUrl: string;
  role: "admin" | "user";
}

/**
 * Returns the current Convex user record for the authenticated Clerk user, or null.
 */
export function useCurrentUser(): ConvexUser | null | undefined {
  return useQuery(api.users.getCurrentUser, {}) as ConvexUser | null | undefined;
}
