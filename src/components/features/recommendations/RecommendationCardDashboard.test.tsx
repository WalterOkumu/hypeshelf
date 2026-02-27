/// <reference types="vitest/globals" />
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import type { Id } from "convex/_generated/dataModel";
import { RecommendationCardDashboard } from "./RecommendationCardDashboard";

vi.mock("convex/react", () => ({
  useMutation: () => vi.fn(),
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img {...props} />
  ),
}));

const baseRecommendation = {
  _id: "rec_1" as Id<"recommendations">,
  userId: "user_1" as Id<"users">,
  title: "Test Movie",
  genre: "drama" as const,
  blurb: "A great test movie",
  link: "https://example.com",
  isStaffPick: false,
  displayName: "Owner User",
  imageUrl: "",
  createdAt: Date.now(),
};

function renderCard(options: {
  currentUserId: Id<"users"> | null;
  role: "admin" | "user" | null | undefined;
  overrides?: Partial<typeof baseRecommendation>;
}) {
  const { currentUserId, role, overrides } = options;
  return render(
    <RecommendationCardDashboard
      recommendation={{ ...baseRecommendation, ...overrides }}
      currentUserId={currentUserId}
      role={role}
    />,
  );
}

describe("RecommendationCardDashboard RBAC UI", () => {
  it("shows neither Delete nor Staff Pick for unauthenticated viewer", () => {
    renderCard({ currentUserId: null, role: null });

    expect(screen.queryByText(/Delete/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Staff Pick/i)).not.toBeInTheDocument();
  });

  it("shows Delete only on owned cards for regular user and never Staff Pick", () => {
    // Owned card
    renderCard({
      currentUserId: "user_1" as Id<"users">,
      role: "user",
    });

    expect(screen.getByText(/Delete/i)).toBeInTheDocument();
    expect(screen.queryByText(/Staff Pick/i)).not.toBeInTheDocument();
  });

  it("does not show Delete for regular user on someone else's card", () => {
    renderCard({
      currentUserId: "user_2" as Id<"users">,
      role: "user",
    });

    expect(screen.queryByText(/Delete/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Staff Pick/i)).not.toBeInTheDocument();
  });

  it("shows Delete and Staff Pick on all cards for admin", () => {
    renderCard({
      currentUserId: "admin_1" as Id<"users">,
      role: "admin",
      overrides: { userId: "another_user" as Id<"users"> },
    });

    expect(screen.getByText(/Delete/i)).toBeInTheDocument();
    const staffPickButton = screen.getByRole("button", { name: /Staff Pick/i });
    expect(staffPickButton).toBeInTheDocument();
    expect(staffPickButton).toHaveAttribute("aria-pressed", "false");
  });

  it("indicates staff-picked state via aria-pressed", () => {
    renderCard({
      currentUserId: "admin_1" as Id<"users">,
      role: "admin",
      overrides: { isStaffPick: true },
    });

    const staffPickButton = screen.getByRole("button", { name: /Staff Pick/i });
    expect(staffPickButton).toHaveAttribute("aria-pressed", "true");
  });

  it('requires a second click to confirm delete (inline "Confirm delete?" state)', () => {
    renderCard({
      currentUserId: "user_1" as Id<"users">,
      role: "user",
    });

    const deleteButton = screen.getByText(/Delete/i);
    fireEvent.click(deleteButton);

    expect(screen.getByText(/Confirm delete\?/i)).toBeInTheDocument();
  });
});

