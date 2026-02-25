import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { GENRES } from "./schema";

/**
 * Seed sample users and recommendations for development/demo.
 * Call from Convex Dashboard (Functions → seed.seedSampleData → Run) or
 * via HTTP GET /seed?secret=YOUR_SEED_SECRET (set SEED_SECRET in Convex env).
 */
export const seedSampleData = internalMutation({
  args: {},
  returns: v.object({
    usersInserted: v.number(),
    recommendationsInserted: v.number(),
  }),
  handler: async (ctx) => {
    const now = Date.now();

    const seedUsers = [
      {
        clerkId: "seed_user_1",
        displayName: "Alex",
        imageUrl: "",
        role: "user" as const,
      },
      {
        clerkId: "seed_user_2",
        displayName: "Sam",
        imageUrl: "",
        role: "user" as const,
      },
      {
        clerkId: "seed_admin_1",
        displayName: "Jordan (Admin)",
        imageUrl: "",
        role: "admin" as const,
      },
    ];

    const existingByClerk = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) =>
        q.eq("clerkId", seedUsers[0].clerkId)
      )
      .unique();
    if (existingByClerk) {
      return { usersInserted: 0, recommendationsInserted: 0 };
    }

    const userIds: Id<"users">[] = [];
    for (const u of seedUsers) {
      const id = await ctx.db.insert("users", u);
      userIds.push(id);
    }

    const [alexId, samId, jordanId] = userIds;

    const recommendations: Array<{
      userId: Id<"users">;
      title: string;
      genre: (typeof GENRES)[number];
      link?: string;
      blurb: string;
      isStaffPick: boolean;
      createdAt: number;
    }> = [
      {
        userId: alexId,
        title: "Dune: Part Two",
        genre: "sci-fi",
        link: "https://www.imdb.com/title/tt15239678/",
        blurb: "Epic adaptation of the novel. Stunning visuals and a solid cast.",
        isStaffPick: true,
        createdAt: now - 5 * 60 * 60 * 1000,
      },
      {
        userId: alexId,
        title: "The Bear",
        genre: "drama",
        link: "https://www.imdb.com/title/tt14452776/",
        blurb: "High-pressure kitchen drama. Intense and rewarding.",
        isStaffPick: false,
        createdAt: now - 4 * 60 * 60 * 1000,
      },
      {
        userId: samId,
        title: "Past Lives",
        genre: "drama",
        blurb: "Quiet, moving story about connection and paths not taken.",
        isStaffPick: true,
        createdAt: now - 3 * 60 * 60 * 1000,
      },
      {
        userId: samId,
        title: "Godzilla Minus One",
        genre: "action",
        link: "https://www.imdb.com/title/tt23289160/",
        blurb: "Best Godzilla film in years. Emotional and thrilling.",
        isStaffPick: false,
        createdAt: now - 2 * 60 * 60 * 1000,
      },
      {
        userId: jordanId,
        title: "Shōgun",
        genre: "drama",
        link: "https://www.imdb.com/title/tt2788316/",
        blurb: "Stunning historical epic. A must-watch.",
        isStaffPick: true,
        createdAt: now - 1 * 60 * 60 * 1000,
      },
      {
        userId: jordanId,
        title: "Hereditary",
        genre: "horror",
        blurb: "Deeply unsettling family horror. Sticks with you.",
        isStaffPick: false,
        createdAt: now,
      },
    ];

    for (const rec of recommendations) {
      await ctx.db.insert("recommendations", rec);
    }

    return {
      usersInserted: seedUsers.length,
      recommendationsInserted: recommendations.length,
    };
  },
});
