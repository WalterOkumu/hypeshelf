import {
  canDeleteAnyRecommendation,
  canToggleStaffPick,
  isAdmin,
  isUser,
} from "./roles";

describe("role helpers", () => {
  describe("isAdmin", () => {
    it("returns true only for admin", () => {
      expect(isAdmin("admin")).toBe(true);
      expect(isAdmin("user")).toBe(false);
    });

    it("returns false for nullish values", () => {
      expect(isAdmin(null)).toBe(false);
      expect(isAdmin(undefined)).toBe(false);
    });
  });

  describe("isUser", () => {
    it("returns true only for user", () => {
      expect(isUser("user")).toBe(true);
      expect(isUser("admin")).toBe(false);
    });

    it("returns false for nullish values", () => {
      expect(isUser(null)).toBe(false);
      expect(isUser(undefined)).toBe(false);
    });
  });

  describe("canDeleteAnyRecommendation", () => {
    it("allows only admin to delete any recommendation", () => {
      expect(canDeleteAnyRecommendation("admin")).toBe(true);
      expect(canDeleteAnyRecommendation("user")).toBe(false);
      expect(canDeleteAnyRecommendation(null)).toBe(false);
      expect(canDeleteAnyRecommendation(undefined)).toBe(false);
    });
  });

  describe("canToggleStaffPick", () => {
    it("allows only admin to toggle staff pick", () => {
      expect(canToggleStaffPick("admin")).toBe(true);
      expect(canToggleStaffPick("user")).toBe(false);
      expect(canToggleStaffPick(null)).toBe(false);
      expect(canToggleStaffPick(undefined)).toBe(false);
    });
  });
});

