import { httpRouter } from "convex/server";
import { httpAction, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

/**
 * Clerk webhook handler. Verifies svix signature and syncs user.created / user.updated to Convex users table.
 */
const handleClerkWebhook = httpAction(async (ctx: ActionCtx, request: Request) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
  }
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }
  const body = await request.text();
  const wh = new Webhook(secret);
  let payload: {
    type: string;
    data: {
      id: string;
      first_name?: string;
      last_name?: string;
      image_url?: string;
      public_metadata?: { role?: string };
    };
  };
  try {
    payload = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof payload;
  } catch (e) {
    console.error("Clerk webhook signature verification failed", e);
    return new Response("Invalid signature", { status: 400 });
  }
  const { type, data } = payload;
  const displayName = [data.first_name, data.last_name].filter(Boolean).join(" ") || "User";
  const imageUrl = data.image_url ?? "";
  const role = data.public_metadata?.role === "admin" ? "admin" : "user";

  if (type === "user.created" || type === "user.updated") {
    await ctx.runMutation(internal.users.upsertUser, {
      clerkId: data.id,
      displayName,
      imageUrl,
      role,
    });
  }
  return new Response("OK", { status: 200 });
});

/**
 * Seed endpoint. GET /seed?secret=YOUR_SEED_SECRET runs the sample data seed.
 * Set SEED_SECRET in Convex Dashboard → Settings → Environment Variables.
 */
const handleSeed = httpAction(async (ctx: ActionCtx, request: Request) => {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }
  const expectedSecret = process.env.SEED_SECRET;
  if (!expectedSecret) {
    return new Response("SEED_SECRET not configured", { status: 501 });
  }
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  if (secret !== expectedSecret) {
    return new Response("Forbidden", { status: 403 });
  }
  try {
    const result = await ctx.runMutation(internal.seed.seedSampleData, {});
    return new Response(
      JSON.stringify({
        ok: true,
        usersInserted: result.usersInserted,
        recommendationsInserted: result.recommendationsInserted,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Seed failed", e);
    return new Response("Seed failed", { status: 500 });
  }
});

const http = httpRouter();
http.route({ path: "/clerk-webhook", method: "POST", handler: handleClerkWebhook });
http.route({ path: "/seed", method: "GET", handler: handleSeed });

// Convex expects a default export of a Router instance.
export default http;
