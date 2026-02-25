"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCurrentRole } from "@/hooks/useCurrentRole";
import { FilterBar } from "@/components/features/recommendations/FilterBar";
import { RecommendationCardDashboard } from "@/components/features/recommendations/RecommendationCardDashboard";
import { AddRecommendationForm } from "@/components/features/recommendations/AddRecommendationForm";
import TopNav from "@/components/layout/TopNav";
import type { Genre } from "@/types";

export default function DashboardPage(): React.ReactElement {
  const [genreFilter, setGenreFilter] = useState<Genre | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const user = useCurrentUser();
  const role = useCurrentRole();
  const recs = useQuery(api.recommendations.listAll) as
    | Array<{
        _id: Id<"recommendations">;
        userId: Id<"users">;
        title: string;
        genre: Genre;
        link?: string;
        blurb: string;
        isStaffPick: boolean;
        displayName: string;
        imageUrl: string;
        createdAt: number;
      }>
    | undefined;

  const filteredRecs = useMemo(() => {
    if (!recs) return [];
    if (genreFilter === "all") return recs;
    return recs.filter((r) => r.genre === genreFilter);
  }, [recs, genreFilter]);

  const handleModalSuccess = (): void => {
    setModalOpen(false);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <TopNav />

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Add Recommendation
          </button>
          <FilterBar value={genreFilter} onChange={setGenreFilter} />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            {role === "admin" ? "Admin view" : "Your shelf"}
          </h1>
        </div>

        {errorMessage && (
          <div
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        {recs === undefined ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : filteredRecs.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
            Nothing here yet. Be the first!
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRecs.map((rec) => (
              <RecommendationCardDashboard
                key={rec._id}
                recommendation={{
                  ...rec,
                  _id: rec._id,
                  userId: rec.userId,
                }}
                currentUserId={user?._id ?? null}
                role={role}
                onError={setErrorMessage}
              />
            ))}
          </ul>
        )}
      </main>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-rec-title"
        >
          <div className="w-full max-w-lg">
            <AddRecommendationForm
              onSuccess={handleModalSuccess}
              onError={setErrorMessage}
              onCancel={() => {
                setModalOpen(false);
                setErrorMessage(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
