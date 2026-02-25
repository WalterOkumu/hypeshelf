import { fetchQuery } from "convex/nextjs";
import { api } from "convex/_generated/api";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { RecommendationCardPublic } from "@/components/features/recommendations/RecommendationCard";
import type { RecommendationPublicProps } from "@/components/features/recommendations/RecommendationCard";
import TopNav from "@/components/layout/TopNav";

export const revalidate = 60;

export default async function PublicLandingPage(): Promise<React.ReactElement> {
  let recs: RecommendationPublicProps[] = [];

  try {
    recs = (await fetchQuery(api.recommendations.listLatestPublic, {
      count: 10,
    })) as RecommendationPublicProps[];
  } catch {
    // If Convex is not configured or temporarily unavailable, fall back
    // to an empty list so the landing page still renders.
    recs = [];
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <TopNav />

      <section className="mx-auto max-w-5xl px-4 py-24 text-center md:px-8">
        <h1
          className="mb-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
          style={{
            background: "linear-gradient(90deg, #6366f1, #a855f7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          HypeShelf
        </h1>
        <p className="mb-8 text-lg text-slate-500">
          Collect and share the stuff you&apos;re hyped about.
        </p>
        <SignedOut>
          <SignInButton mode="modal">
            <span className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700">
              Sign in to add yours →
            </span>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700"
          >
            Go to your shelf
          </Link>
        </SignedIn>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-12 md:px-8">
        <h2 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Latest Picks
        </h2>
        {recs.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
            Nothing here yet. Be the first!
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recs.map((rec) => (
              <RecommendationCardPublic
                key={rec._id}
                recommendation={rec}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
