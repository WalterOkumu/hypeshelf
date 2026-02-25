import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Look up internal User record by Clerk ID.
 * Auth: none (used by webhook and auth helpers).
 */
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      clerkId: v.string(),
      displayName: v.string(),
      imageUrl: v.string(),
      role: v.union(v.literal("admin"), v.literal("user")),
    }),
    v.null()
  ),
  handler: async (ctx, { clerkId }) => {
    const doc = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!doc) return null;

    return {
      _id: doc._id,
      clerkId: doc.clerkId,
      displayName: doc.displayName,
      imageUrl: doc.imageUrl,
      role: doc.role,
    };
  },
});

/**
 * Create or update user record on Clerk webhook.
 * Auth: internal only (not callable from client).
 */
export const upsertUser = internalMutation({
  args: {
    clerkId: v.string(),
    displayName: v.string(),
    imageUrl: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        displayName: args.displayName,
        imageUrl: args.imageUrl,
        role: args.role,
      });
      return existing._id;
    }
    return await ctx.db.insert("users", args);
  },
});

/**
 * Returns the full user record for the authenticated caller.
 * Auth: requires Clerk session.
 */
export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("users"),
      clerkId: v.string(),
      displayName: v.string(),
      imageUrl: v.string(),
      role: v.union(v.literal("admin"), v.literal("user")),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const doc = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!doc) return null;

    return {
      _id: doc._id,
      clerkId: doc.clerkId,
      displayName: doc.displayName,
      imageUrl: doc.imageUrl,
      role: doc.role,
    };
  },
});
