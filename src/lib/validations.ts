import { z } from "zod";

export const MAX_TITLE_LENGTH = 120;
export const MAX_BLURB_LENGTH = 300;

const genreEnum = z.enum([
  "horror",
  "action",
  "comedy",
  "drama",
  "sci-fi",
  "thriller",
  "documentary",
  "animation",
  "other",
]);

export const addRecommendationSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(MAX_TITLE_LENGTH, `Title must be at most ${MAX_TITLE_LENGTH} characters`),
  genre: genreEnum,
  link: z
    .string()
    .optional()
    .refine((s) => !s || s === "" || /^https?:\/\/.+/.test(s), "Must be a valid URL"),
  blurb: z
    .string()
    .min(1, "Blurb is required")
    .max(MAX_BLURB_LENGTH, `Blurb must be at most ${MAX_BLURB_LENGTH} characters`),
});

export type AddRecommendationInput = z.infer<typeof addRecommendationSchema>;
