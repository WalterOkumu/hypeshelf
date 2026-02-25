/**
 * Convex auth config for Clerk JWT verification.
 * In Convex Dashboard: Auth → Add Clerk, paste Clerk issuer and configure JWT template.
 */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
