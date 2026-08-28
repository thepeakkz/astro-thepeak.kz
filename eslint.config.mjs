import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/ban-ts-comment": "error",
      "@typescript-eslint/no-explicit-any": "error",
      // The site deliberately uses native img elements for tracking pixels,
      // animated duplicate marquees, WebGL fallbacks, and runtime remote media.
      "@next/next/no-img-element": "off",
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/use-memo": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".vercel/**",
    ".astro/**",
    "scripts/**",
    "out/**",
    "build/**",
    "dist/**",
    "public/imported-home/**",
    "trash/**",
    "next-env.d.ts",
    "apps/**",
  ]),
]);

export default eslintConfig;
