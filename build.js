import { build } from "esbuild";

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
