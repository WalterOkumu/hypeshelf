import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const GENRES = [
  "horror",
  "action",
  "comedy",
  "drama",
  "sci-fi",
  "thriller",
  "documentary",
  "animation",
  "other",
] as const;

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    displayName: v.string(),
    imageUrl: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
  }).index("by_clerkId", ["clerkId"]),

  recommendations: defineTable({
    userId: v.id("users"),
    title: v.string(),
    genre: v.union(
      ...GENRES.map((g) => v.literal(g))
    ),
    link: v.optional(v.string()),
    blurb: v.string(),
    isStaffPick: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_userId", ["userId"])
    .index("by_genre", ["genre"]),
});
