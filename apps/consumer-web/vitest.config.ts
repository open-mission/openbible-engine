import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    include: ["tests/**/*.{test,spec}.ts", "tests/**/*.{test,spec}.tsx"],
    exclude: ["tests/browser/**"],
    globals: false,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
