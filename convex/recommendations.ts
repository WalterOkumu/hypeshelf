import { query, mutation, type MutationCtx } from "./_generated/server";
import { v, Infer } from "convex/values";
import { ConvexError } from "convex/values";
import { GENRES } from "./schema";

const genreValidator = v.union(...GENRES.map((g) => v.literal(g)));

const recommendationWithUser = v.object({
  _id: v.id("recommendations"),
  _creationTime: v.number(),
  userId: v.id("users"),
  title: v.string(),
  genre: genreValidator,
  link: v.optional(v.string()),
  blurb: v.string(),
  isStaffPick: v.boolean(),
  createdAt: v.number(),
  displayName: v.string(),
  imageUrl: v.string(),
});

async function getOrCreateUserForIdentity(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError("Unauthenticated");

  const existing = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (existing) {
    return existing;
  }

  const displayName = identity.name?.trim() || "User";
  const imageUrl =
    ((identity as any).pictureUrl as string | undefined) ??
    ((identity as any).imageUrl as string | undefined) ??
    "";

  const userId = await ctx.db.insert("users", {
    clerkId: identity.subject,
    displayName,
    imageUrl,
    role: "user",
  });

  const inserted = await ctx.db.get(userId);
  if (!inserted) {
    throw new ConvexError("Failed to create user");
  }
  return inserted;
}

/**
 * Returns the N most recent recommendations (default 10) for public landing.
 * Auth: none.
 */
export const listLatestPublic = query({
  args: { count: v.optional(v.number()) },
  returns: v.array(recommendationWithUser),
  handler: async (ctx, { count = 10 }) => {
    const recs = await ctx.db
      .query("recommendations")
      .withIndex("by_createdAt")
      .order("desc")
      .take(count);
    const withUser: Infer<typeof recommendationWithUser>[] = [];
    for (const rec of recs) {
      const user = await ctx.db.get(rec.userId);
      withUser.push({
        ...rec,
        displayName: user?.displayName ?? "Unknown",
        imageUrl: user?.imageUrl ?? "",
      });
    }
    return withUser;
  },
});

/**
 * Returns all recommendations for dashboard with denormalised user info.
 * Auth: requires Clerk session.
 */
export const listAll = query({
  args: {},
  returns: v.array(recommendationWithUser),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const recs = await ctx.db
      .query("recommendations")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();
    const withUser: Infer<typeof recommendationWithUser>[] = [];
    for (const rec of recs) {
      const user = await ctx.db.get(rec.userId);
      withUser.push({
        ...rec,
        displayName: user?.displayName ?? "Unknown",
        imageUrl: user?.imageUrl ?? "",
      });
    }
    return withUser;
  },
});

function isValidUrl(s: string): boolean {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a new recommendation. Sets userId, createdAt, isStaffPick from server.
 * Auth: requires Clerk session.
 */
export const addRecommendation = mutation({
  args: {
    title: v.string(),
    genre: genreValidator,
    link: v.optional(v.string()),
    blurb: v.string(),
  },
  returns: v.id("recommendations"),
  handler: async (ctx, args) => {
    if (args.title.length > 120) throw new ConvexError("Title must be at most 120 characters");
    if (args.blurb.length > 300) throw new ConvexError("Blurb must be at most 300 characters");
    if (args.link !== undefined && args.link !== "" && !isValidUrl(args.link)) {
      throw new ConvexError("Link must be a valid URL");
    }
    const user = await getOrCreateUserForIdentity(ctx);
    return await ctx.db.insert("recommendations", {
      userId: user._id,
      title: args.title.trim(),
      genre: args.genre,
      link: args.link?.trim() || undefined,
      blurb: args.blurb.trim(),
      isStaffPick: false,
      createdAt: Date.now(),
    });
  },
});

/**
 * Delete a recommendation. User can delete only own; admin can delete any.
 * Auth: requires Clerk session. Enforces ownership or admin role from DB.
 */
export const deleteRecommendation = mutation({
  args: { id: v.id("recommendations") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const user = await getOrCreateUserForIdentity(ctx);
    const rec = await ctx.db.get(id);
    if (!rec) throw new ConvexError("Not found");
    if (user.role !== "admin" && rec.userId !== user._id) {
      throw new ConvexError("Forbidden");
    }
    await ctx.db.delete(id);
    return null;
  },
});

/**
 * Set isStaffPick = true for given rec and clear previous Staff Pick. Admin only.
 * Auth: requires Clerk session and role === "admin".
 */
export const toggleStaffPick = mutation({
  args: { id: v.id("recommendations") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const user = await getOrCreateUserForIdentity(ctx);
    if (user.role !== "admin") throw new ConvexError("Forbidden");
    const rec = await ctx.db.get(id);
    if (!rec) throw new ConvexError("Not found");
    const current = await ctx.db
      .query("recommendations")
      .withIndex("by_createdAt")
      .filter((q) => q.eq(q.field("isStaffPick"), true))
      .first();
    if (current && current._id !== id) {
      await ctx.db.patch(current._id, { isStaffPick: false });
    }
    await ctx.db.patch(id, { isStaffPick: true });
    return null;
  },
});
