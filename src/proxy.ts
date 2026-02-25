import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtected = createRouteMatcher(["/dashboard(.*)"]);

const handler = clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) await auth.protect();
});

export const proxy = handler;
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
