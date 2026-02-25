"use client";

import { cn } from "@/lib/utils";
import type { Genre } from "@/types";

const GENRES: Genre[] = [
  "horror",
  "action",
  "comedy",
  "drama",
  "sci-fi",
  "thriller",
  "documentary",
  "animation",
  "other",
];

function formatGenre(genre: string): string {
  if (genre === "all") return "All";
  return genre
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("-");
}

export function FilterBar({
  value,
  onChange,
}: {
  value: Genre | "all";
  onChange: (genre: Genre | "all") => void;
}): React.ReactElement {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label="Filter by genre"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === "all"}
        className={cn(
          "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
          value === "all"
            ? "bg-indigo-600 text-white"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
        )}
        onClick={() => onChange("all")}
      >
        All
      </button>
      {GENRES.map((g) => (
        <button
          key={g}
          type="button"
          role="tab"
          aria-selected={value === g}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            value === g
              ? "bg-indigo-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          )}
          onClick={() => onChange(g)}
        >
          {formatGenre(g)}
        </button>
      ))}
    </div>
  );
}
