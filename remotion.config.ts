import path from "node:path";
import { Config } from "@remotion/cli/config";

/**
 * The film imports the product's own code rather than copies of it: the mascot
 * generator, the publish response schema and the slug rules come straight from
 * the pinned `kept/` submodule. Exact-match aliases (`$`) so `@kept/shared`
 * does not swallow `@kept/shared/mascot`. Mirrors `paths` in tsconfig.json.
 */
const kept = (p: string) => path.resolve(process.cwd(), "kept", p);

Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...(config.resolve?.alias ?? {}),
      "@kept/shared$": kept("packages/shared/src/index.ts"),
      "@kept/shared/mascot$": kept("packages/shared/src/mascot/index.ts"),
      "@kept/slug$": kept("apps/web/lib/publish/slug.ts"),
      // `geist` exports only its next/font entry; reach its woff2 files directly.
      "geist-fonts": path.resolve(process.cwd(), "node_modules/geist/dist/fonts"),
    },
  },
}));

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setConcurrency(4);
Config.setCodec("h264");
Config.setCrf(16);
Config.setPixelFormat("yuv420p");
Config.setChromiumOpenGlRenderer("angle");

// The environment's pre-installed chrome-headless-shell; the renderer must not
// download one (the network policy blocks it). Override with
// REMOTION_BROWSER_EXECUTABLE on another machine, or unset both to let
// Remotion fetch its own.
const pwBrowsers = process.env.PLAYWRIGHT_BROWSERS_PATH;
const browser =
  process.env.REMOTION_BROWSER_EXECUTABLE ??
  (pwBrowsers
    ? path.join(pwBrowsers, "chromium_headless_shell-1194/chrome-linux/headless_shell")
    : undefined);
if (browser) Config.setBrowserExecutable(browser);
