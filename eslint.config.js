import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/coverage/**", "specs/**", ".specsfy/**", ".agents/**"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {},
  },
  {
    files: ["packages/engine-core/src/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "fs", message: "engine-core não pode importar fs" },
            { name: "path", message: "engine-core não pode importar path" },
            { name: "node:fs", message: "engine-core não pode importar node:fs" },
            { name: "better-sqlite3", message: "engine-core zero deps" },
            { name: "react", message: "engine-core zero deps" },
          ],
        },
      ],
    },
  },
];
