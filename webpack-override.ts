import path from "node:path";
import type { WebpackOverrideFn } from "@remotion/bundler";

/**
 * The film imports the product's own code rather than copies of it: the mascot
 * generator, the publish response schema, the slug rules and the draft chip's
 * label logic come straight from the pinned `kept/` submodule. Exact-match
 * aliases (`$`) so `@kept/shared` does not swallow `@kept/shared/mascot`.
 * Mirrors `paths` in tsconfig.json. Shared by remotion.config.ts (CLI, Studio)
 * and scripts/stills.ts (programmatic bundle).
 */
const kept = (p: string) => path.resolve(process.cwd(), "kept", p);

export const webpackOverride: WebpackOverrideFn = (config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...(config.resolve?.alias ?? {}),
      "@kept/shared$": kept("packages/shared/src/index.ts"),
      "@kept/shared/mascot$": kept("packages/shared/src/mascot/index.ts"),
      "@kept/slug$": kept("apps/web/lib/publish/slug.ts"),
      // The control plane's own `@/` imports, for the web modules read directly.
      "@": kept("apps/web"),
      // `geist` exports only its next/font entry; reach its woff2 files directly.
      "geist-fonts": path.resolve(process.cwd(), "node_modules/geist/dist/fonts"),
    },
  },
});
