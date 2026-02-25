"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { canDeleteAnyRecommendation, canToggleStaffPick } from "@/lib/roles";
import type { Genre } from "@/types";

const GENRE_STYLES: Record<Genre, string> = {
  horror: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  action: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  comedy: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  drama: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "sci-fi": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  thriller: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  documentary: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  animation: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  other: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
};

function formatGenre(genre: string): string {
  return genre
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("-");
}

function formatTimeAgo(ms: number): string {
  const sec = Math.floor((Date.now() - ms) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

export interface RecommendationDashboardProps {
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
}

export function RecommendationCardDashboard({
  recommendation,
  currentUserId,
  role,
  onError,
}: {
  recommendation: RecommendationDashboardProps;
  currentUserId: Id<"users"> | null;
  role: "admin" | "user" | null | undefined;
  onError?: (message: string) => void;
}): React.ReactElement {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteRec = useMutation(api.recommendations.deleteRecommendation);
  const toggleStaffPick = useMutation(api.recommendations.toggleStaffPick);
  const isOwner = currentUserId !== null && recommendation.userId === currentUserId;
  const showDelete = canDeleteAnyRecommendation(role) || isOwner;
  const showStaffPick = canToggleStaffPick(role);

  const handleDelete = async (): Promise<void> => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      await deleteRec({ id: recommendation._id });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong. Try again.";
      onError?.(msg);
    }
    setConfirmDelete(false);
  };

  const handleToggleStaffPick = async (): Promise<void> => {
    try {
      await toggleStaffPick({ id: recommendation._id });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong. Try again.";
      onError?.(msg);
    }
  };

  const {
    title,
    genre,
    link,
    blurb,
    isStaffPick,
    displayName,
    imageUrl,
    createdAt,
  } = recommendation;

  return (
    <article
      className="rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
      aria-label={`Recommendation: ${title}`}
    >
      <div className="flex flex-wrap gap-2 p-4 pb-2">
        {isStaffPick && (
          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            ⭐ Staff Pick
          </span>
        )}
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-xs font-medium",
            GENRE_STYLES[genre]
          )}
        >
          {formatGenre(genre)}
        </span>
      </div>
      <div className="px-4 pb-2">
        <h3 className="text-lg font-semibold leading-tight text-slate-900 dark:text-slate-50">
          {title}
        </h3>
        <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
          {blurb}
        </p>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-sm text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Watch here
          </a>
        )}
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 dark:border-slate-700">
        <div className="flex items-center gap-2">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={displayName}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <span
              className="h-6 w-6 rounded-full bg-slate-300 dark:bg-slate-600"
              aria-hidden
            />
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {displayName} · {formatTimeAgo(createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {showStaffPick && (
            <button
              type="button"
              onClick={handleToggleStaffPick}
              className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              aria-pressed={isStaffPick}
            >
              Staff Pick
            </button>
          )}
          {showDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className={cn(
                "rounded px-2 py-1 text-xs font-medium",
                confirmDelete
                  ? "bg-red-500 text-white"
                  : "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300"
              )}
            >
              {confirmDelete ? "Confirm delete?" : "Delete"}
            </button>
          )}
        </div>
      </footer>
    </article>
  );
}
