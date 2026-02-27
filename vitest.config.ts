import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "convex/_generated/api": path.resolve(__dirname, "./convex/_generated/api"),
      "convex/_generated/dataModel": path.resolve(__dirname, "./convex/_generated/dataModel"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});

