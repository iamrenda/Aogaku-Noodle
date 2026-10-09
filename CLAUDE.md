# Aogaku Noodle

Chrome Manifest V3 extension for Aoyama Gakuin University's Moodle LMS (`agulms45.aim.aoyama.ac.jp`). It redesigns the Moodle UI (timetable view first; later assignment tracking, grade viewer, side panel), injected into live Moodle pages via content scripts.

## Stack

- TypeScript, React 19, Tailwind CSS v4 (`@tailwindcss/vite`, no config file; `@import "tailwindcss"` in `src/index.css`)
- Vite + `@crxjs/vite-plugin`: bundles everything referenced from `manifest.json` (popup, side panel, content scripts, service worker). Do not use Webpack.

## Commands

- `npm run dev`: dev build with HMR into `dist/`
- `npm run build`: type-check, then production build into `dist/`
- `npm run lint`: ESLint (typescript-eslint + react-hooks); config in `eslint.config.js`
- **Run `npm run build` at the end of every assistant turn that changes files**, and report failures.
- Load in Chrome: `chrome://extensions` > Developer mode > Load unpacked > select `dist/`

## Layout

- `manifest.json`: source of truth for the extension; imported by `vite.config.ts`. Add new entry points (content scripts, side panel, background) here.
- `popup.html` + `src/popup.tsx`: toolbar popup entry
- `src/index.css`: Tailwind entry
- `public/icons/`: extension icons, referenced in the manifest as `icons/...`

## Conventions

- Keep the number of files small; avoid new config files or splitting code prematurely. The owner reviews every change by hand.
- Ask the owner before adding any dependency, and explain why it is needed.
- Moodle pages are not ours: injected UI must not leak styles into or inherit styles from the host page (consider Shadow DOM for injected React UI, and Tailwind's preflight will otherwise affect the page).
- Only request the permissions and host permissions a feature actually needs.
