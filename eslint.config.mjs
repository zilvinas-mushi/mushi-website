import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Sibling git worktrees live here and carry their own build output, which
    // `.next/**` above does not match — it is anchored at the repo root. Without
    // this, `npx eslint .` fails on another session's compiled bundles.
    ".claude/**",
  ]),
]);

export default eslintConfig;
