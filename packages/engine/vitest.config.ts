import { defineConfig } from "vitest/config";
import path from "node:path";
export default defineConfig({
  test: { include: ["src/**/*.test.ts"] },
  resolve: {
    alias: {
      "@openbible/engine-testing": path.resolve(__dirname, "../engine-testing/src/index.ts"),
    },
  },
});
