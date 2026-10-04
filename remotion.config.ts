import path from "node:path";
import { Config } from "@remotion/cli/config";
import { webpackOverride } from "./webpack-override";

Config.overrideWebpackConfig(webpackOverride);

// PNG frames: exact colour on flat fills and type (JPEG frames ring, and land
// the encode in full-range yuvj420p)
Config.setVideoImageFormat("png");
Config.setConcurrency(4);
Config.setCodec("h264");
Config.setCrf(16);
Config.setPixelFormat("yuv420p");
Config.setColorSpace("bt709");
Config.setAudioCodec("aac");
Config.setAudioBitrate("320k");
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
