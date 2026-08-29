import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts", "packages/**/tests/**/*.test.ts", "apps/**/tests/**/*.test.ts"],
    globals: false,
    environment: "node",
  },
  resolve: {
    alias: {
      "@openbible/engine-core/book-meta": path.resolve(__dirname, "packages/engine-core/src/book-meta.ts"),
      "@openbible/engine-core/errors": path.resolve(__dirname, "packages/engine-core/src/errors.ts"),
      "@openbible/engine-core/normalize": path.resolve(__dirname, "packages/engine-core/src/normalize.ts"),
      "@openbible/engine": path.resolve(__dirname, "packages/engine/src/index.ts"),
      "@openbible/engine-core": path.resolve(__dirname, "packages/engine-core/src/index.ts"),
      "@openbible/engine-testing": path.resolve(__dirname, "packages/engine-testing/src/index.ts"),
    },
  },
});
