import { build } from "esbuild";
import { cpSync, mkdirSync } from "fs";

mkdirSync("dist/icons", { recursive: true });
cpSync("manifest.json", "dist/manifest.json");
cpSync("sidepanel.html", "dist/sidepanel.html");
cpSync("grade-viewer.html", "dist/grade-viewer.html");
cpSync("icons", "dist/icons", { recursive: true });

const uiConfig = {
    bundle: true,
    minify: false,
    sourcemap: false,
    format: "iife",
    loader: { ".jsx": "jsx" },
    jsx: "automatic",
};

// content
build({
    ...uiConfig,
    entryPoints: ["content/src/main.jsx"],
    outfile: "dist/content.js",
});

// grade page content script
build({
    ...uiConfig,
    entryPoints: ["content/scripts/grade-viewer/index.js"],
    outfile: "dist/grade-page.js",
});

// grade viewer window
build({
    ...uiConfig,
    entryPoints: ["content/src/grade-viewer/main.jsx"],
    outfile: "dist/grade-viewer.js",
});

// sidepanel
build({
    ...uiConfig,
    entryPoints: ["content/src/sidepanel/main.jsx"],
    outfile: "dist/sidepanel.js",
});

// background
build({
    bundle: true,
    minify: false,
    sourcemap: false,
    format: "esm",
    entryPoints: ["background.js"],
    outfile: "dist/background.js",
});

// injected
build({
    bundle: true,
    minify: false,
    sourcemap: false,
    format: "iife",
    entryPoints: ["injected.js"],
    outfile: "dist/injected.js",
});
