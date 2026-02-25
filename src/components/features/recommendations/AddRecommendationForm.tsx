"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addRecommendationSchema, type AddRecommendationInput } from "@/lib/validations";
import { cn } from "@/lib/utils";
import { MAX_TITLE_LENGTH, MAX_BLURB_LENGTH } from "@/lib/validations";

const GENRES = [
  "horror",
  "action",
  "comedy",
  "drama",
  "sci-fi",
  "thriller",
  "documentary",
  "animation",
  "other",
] as const;

export function AddRecommendationForm({
  onSuccess,
  onError,
  onCancel,
}: {
  onSuccess?: () => void;
  onError?: (message: string) => void;
  onCancel: () => void;
}): React.ReactElement {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addRec = useMutation(api.recommendations.addRecommendation);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AddRecommendationInput>({
    resolver: zodResolver(addRecommendationSchema),
    defaultValues: { title: "", genre: undefined, link: "", blurb: "" },
  });

  const titleLen = watch("title")?.length ?? 0;
  const blurbLen = watch("blurb")?.length ?? 0;

  const onSubmit = async (data: AddRecommendationInput): Promise<void> => {
    setIsSubmitting(true);
    try {
      await addRec({
        title: data.title,
        genre: data.genre,
        link: data.link && data.link.trim() ? data.link.trim() : undefined,
        blurb: data.blurb,
      });
      onSuccess?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong. Try again.";
      onError?.(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-slate-900">
      <h2 id="add-rec-title" className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-50">
        Add Recommendation
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        aria-labelledby="add-rec-title"
        noValidate
      >
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Title
          </label>
          <input
            id="title"
            type="text"
            maxLength={MAX_TITLE_LENGTH}
            placeholder="Movie title"
            className={cn(
              "w-full rounded-lg border px-3 py-2 text-sm",
              errors.title
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            )}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "title-error" : "title-count"}
            {...register("title")}
          />
          <p id="title-count" className={cn("mt-1 text-xs", titleLen > MAX_TITLE_LENGTH && "text-red-500")} aria-live="polite">
            {titleLen} / {MAX_TITLE_LENGTH}
          </p>
          {errors.title && (
            <p id="title-error" className="mt-1 text-xs text-red-500" role="alert">
              {errors.title.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="genre" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Genre
          </label>
          <select
            id="genre"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            aria-required
            aria-invalid={!!errors.genre}
            {...register("genre")}
          >
            <option value="">Select a genre</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("-")}
              </option>
            ))}
          </select>
          {errors.genre && (
            <p className="mt-1 text-xs text-red-500" role="alert">
              {errors.genre.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="link" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Link (optional)
          </label>
          <input
            id="link"
            type="url"
            placeholder="https://..."
            className={cn(
              "w-full rounded-lg border px-3 py-2 text-sm",
              errors.link ? "border-red-500" : "border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            )}
            aria-invalid={!!errors.link}
            {...register("link")}
          />
          {errors.link && (
            <p className="mt-1 text-xs text-red-500" role="alert">
              {errors.link.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="blurb" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Blurb
          </label>
          <textarea
            id="blurb"
            rows={3}
            maxLength={MAX_BLURB_LENGTH}
            placeholder="Why do you recommend it?"
            className={cn(
              "w-full rounded-lg border px-3 py-2 text-sm",
              errors.blurb ? "border-red-500" : "border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            )}
            aria-invalid={!!errors.blurb}
            aria-describedby={errors.blurb ? "blurb-error" : "blurb-count"}
            {...register("blurb")}
          />
          <p id="blurb-count" className={cn("mt-1 text-xs", blurbLen > MAX_BLURB_LENGTH && "text-red-500")} aria-live="polite">
            {blurbLen} / {MAX_BLURB_LENGTH}
          </p>
          {errors.blurb && (
            <p id="blurb-error" className="mt-1 text-xs text-red-500" role="alert">
              {errors.blurb.message}
            </p>
          )}
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "Adding…" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
