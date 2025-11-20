import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

export default defineConfig([
  {
    ignores: [".next/**", "node_modules/**"]
  },
  js.configs.recommended,
  ...nextVitals,
  ...nextTs,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": ["error", { "fixToUnknown": false }]
    },
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      import: importPlugin,
    },
    rules: {
      "no-console": "warn",
    }
  }
]);
