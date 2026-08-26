import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["tests/arch/**/*.test.ts"],
    globals: false,
    environment: "node",
  },
  resolve: {
    alias: {
      "@openbible/engine": path.resolve(__dirname, "packages/engine/src/index.ts"),
      "@openbible/engine-core": path.resolve(__dirname, "packages/engine-core/src/index.ts"),
      "@openbible/engine-testing": path.resolve(__dirname, "packages/engine-testing/src/index.ts"),
    },
  },
});
