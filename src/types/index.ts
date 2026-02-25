export type Genre =
  | "horror"
  | "action"
  | "comedy"
  | "drama"
  | "sci-fi"
  | "thriller"
  | "documentary"
  | "animation"
  | "other";

export interface RecommendationWithUser {
  _id: string;
  _creationTime: number;
  userId: string;
  title: string;
  genre: Genre;
  link?: string;
  blurb: string;
  isStaffPick: boolean;
  createdAt: number;
  displayName: string;
  imageUrl: string;
}
